import fs from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { beforeAll, afterAll, it, expect } from "vitest";
import type { TaskTemplateInput } from "../src/lib/types";
import { GENERAL_ADMIN_ID } from "../src/lib/access";
let db: PGlite;
const owner = GENERAL_ADMIN_ID;
const other = "00000000-0000-4000-8000-000000000002";
const store = "00000000-0000-4000-8000-000000000003";
const category = "00000000-0000-4000-8000-000000000004";
const input: TaskTemplateInput = { title: "Rotina sem categoria", description: "Orientação", categoryId: null, recurrence: "daily", dueTime: "18:00", onceDueDate: null, photoRequirement: "none", active: true, storeIds: [store] };
async function actor(id: string) {
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
  await db.exec("set role authenticated");
}
async function save(id: string | null, data = input) {
  const result = await db.query<{ id: string }>("select public.save_task_template($1,$2::jsonb) as id", [id, JSON.stringify(data)]);
  return result.rows[0].id;
}
beforeAll(async () => {
  db = new PGlite();
  // Supabase-owned schemas are represented locally; application DDL/RLS is loaded unchanged.
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create schema storage;
    create table auth.users(id uuid primary key, email text, raw_user_meta_data jsonb default '{}', raw_app_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated;
    create table storage.buckets(id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
    create table storage.objects(id uuid, bucket_id text, name text);
    create function storage.foldername(text) returns text[] language sql immutable as $$ select string_to_array($1,'/') $$;`);
  const baseline = fs.readFileSync("supabase/migrations/0001_schema.sql", "utf8").replace("create extension if not exists pgcrypto with schema extensions;", "");
  await db.exec(baseline);
  await db.exec(fs.readFileSync("supabase/migrations/20261117021603_task_management.sql", "utf8"));
  await db.query("insert into auth.users(id,email) values ($1,'owner@test.local'),($2,'other@test.local')", [owner, other]);
  await db.exec("update public.profiles set role='admin'");
  await db.query("insert into public.stores(id,name,code) values ($1,'Loja teste','TEST')", [store]);
  await db.query("insert into public.categories(id,name) values ($1,'Categoria teste')", [category]);
  await actor(owner);
}, 60_000);
afterAll(async () => { await db?.close(); });
it("saves and generates uncategorized tasks using real SQL", async () => {
  const id = await save(null);
  await db.exec("select public.generate_task_instances('2026-11-16')");
  const tasks = await db.query<{ category_id: string | null }>("select category_id from public.task_instances where template_id=$1", [id]);
  expect(tasks.rows).toEqual([{ category_id: null }]);
  await expect(db.query("delete from public.task_templates where id=$1", [id])).rejects.toThrow(/task_instances_template_id_fkey/);
  await db.query("update public.task_templates set active=false where id=$1", [id]);
  await db.exec("select public.generate_task_instances('2026-11-17')");
  expect((await db.query("select * from public.task_instances where template_id=$1", [id])).rows).toHaveLength(1);
});
it("rolls back model fields and store links together when a foreign key fails", async () => {
  const id = await save(null, { ...input, active: false });
  await expect(save(id, { ...input, title: "Must roll back", storeIds: ["00000000-0000-4000-8000-000000000099"] })).rejects.toThrow();
  expect((await db.query<{ title: string }>("select title from public.task_templates where id=$1", [id])).rows[0].title).toBe(input.title);
  expect((await db.query<{ store_id: string }>("select store_id from public.template_stores where template_id=$1", [id])).rows).toEqual([{ store_id: store }]);
});
it("restricts direct API deletes to the General Administrator and audits successful deletion", async () => {
  const id = await save(null, { ...input, active: false });
  await actor(other);
  expect((await db.query("delete from public.task_templates where id=$1 returning id", [id])).rows).toHaveLength(0);
  await actor(owner);
  expect((await db.query("delete from public.task_templates where id=$1 returning id", [id])).rows).toHaveLength(1);
  expect((await db.query("select * from public.audit_logs where entity_id=$1 and action='template.deleted'", [id])).rows).toHaveLength(1);
});
it("blocks deleting linked categories, then permits deletion after reassignment", async () => {
  const id = await save(null, { ...input, active: false, categoryId: category });
  await expect(db.query("delete from public.categories where id=$1", [category])).rejects.toThrow(/task_templates_category_id_fkey/);
  await save(id, { ...input, active: false });
  expect((await db.query("delete from public.categories where id=$1 returning id", [category])).rows).toHaveLength(1);
});
it("rejects managers and inactive administrators at the SQL boundary", async () => {
  await db.exec("reset role; select set_config('request.jwt.claim.sub','',false)");
  await db.query("update public.profiles set role='manager' where id=$1", [other]);
  await actor(other);
  await expect(save(null)).rejects.toThrow(/restrito/);
  await db.exec("reset role; select set_config('request.jwt.claim.sub','',false)");
  await db.query("update public.profiles set role='admin',active=false where id=$1", [other]);
  await actor(other);
  await expect(save(null)).rejects.toThrow(/restrito/);
  await actor(owner);
});
it("keeps archived category names visible on historical tasks to their store manager", async () => {
  const cat = "00000000-0000-4000-8000-000000000005";
  await db.query("insert into public.categories(id,name) values ($1,'Histórico preservado')", [cat]);
  const id = await save(null, { ...input, categoryId: cat });
  await db.exec("select public.generate_task_instances('2026-11-18')");
  await db.query("update public.categories set active=false where id=$1", [cat]);
  await db.exec("reset role; select set_config('request.jwt.claim.sub','',false)");
  await db.query("update public.profiles set role='manager',active=true where id=$1", [other]);
  await db.query("update public.stores set manager_id=$1 where id=$2", [other, store]);
  await actor(other);
  const result = await db.query<{ name: string }>("select c.name from public.task_instances t left join public.categories c on c.id=t.category_id where t.template_id=$1", [id]);
  expect(result.rows[0].name).toBe("Histórico preservado");
  await actor(owner);
  await save(id, { ...input, active: false });
  await expect(db.query("delete from public.categories where id=$1", [cat])).rejects.toThrow(/task_instances_category_id_fkey/);
});
