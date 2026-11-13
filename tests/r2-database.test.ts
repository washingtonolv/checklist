import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { expect, it } from "vitest";

it("executes the migration in PostgreSQL: store RLS, limits and atomic expiration audit", async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      create role anon; create role authenticated; create role service_role bypassrls;
      create schema private; create schema auth; create schema storage;
      create function auth.uid() returns uuid language sql as $$ select '11111111-1111-1111-1111-111111111111'::uuid $$;
      create function private.dd_has_store_access(uuid) returns boolean language sql as $$ select $1 = '22222222-2222-2222-2222-222222222222'::uuid $$;
      create function private.dd_can_review() returns boolean language sql as $$ select false $$;
      create table storage.objects(id uuid);
      create table public.task_instances(id uuid primary key, store_id uuid, status text);
      create table public.task_photos(id uuid primary key, task_id uuid, storage_path text, mime_type text, size_bytes int, is_original boolean, uploaded_by uuid, created_at timestamptz);
      create table public.audit_logs(actor_id uuid, action text, entity_type text, entity_id text, details jsonb);
      create function public.log_audit(text,text,text,jsonb) returns void language sql as $$ insert into public.audit_logs values(auth.uid(),$1,$2,$3,$4) $$;
      alter table public.task_photos enable row level security;
      create policy task_photos_select_access on public.task_photos for select to authenticated using (exists(select 1 from public.task_instances t where t.id = task_id and private.dd_has_store_access(t.store_id)));
      create policy task_photos_insert_access on public.task_photos for insert to authenticated with check(false);
      grant usage on schema public,private,auth to authenticated,service_role;
      grant all on all tables in schema public to authenticated,service_role;
      insert into public.task_instances values('33333333-3333-3333-3333-333333333333','22222222-2222-2222-2222-222222222222','pending');
      insert into public.task_instances values('44444444-4444-4444-4444-444444444444','55555555-5555-5555-5555-555555555555','pending');
    `);
    await db.exec(readFileSync(new URL("../supabase/migrations/20261113014551_r2_photos.sql", import.meta.url), "utf8"));
    const task = "33333333-3333-3333-3333-333333333333";
    async function insert(id: string, taskId = task, path?: string) {
      const key = path ?? `lojas/22222222-2222-2222-2222-222222222222/${new Date().toISOString().slice(0,10).replaceAll("-", "/")}/${taskId}/${id}.webp`;
      return db.query(`insert into public.task_photos(id,task_id,storage_path,mime_type,size_bytes,is_original,uploaded_by,created_at) values($1,$2,$3,'image/webp',100,false,auth.uid(),now())`, [id,taskId,key]);
    }
    await db.exec("set role authenticated");
    await expect(insert(crypto.randomUUID(),task,"forged/path")).rejects.toThrow("permission denied");
    await expect(insert(crypto.randomUUID())).rejects.toThrow("permission denied");
    await db.exec("set role service_role");
    const first = crypto.randomUUID(); await insert(first);
    for (let i=0;i<4;i++) await insert(crypto.randomUUID());
    await expect(insert(crypto.randomUUID())).rejects.toThrow("Limite de 5");
    await db.exec("set role authenticated");
    await expect(db.query("select public.expire_r2_photo($1)",[first])).rejects.toThrow("permission denied");
    await db.exec("reset role");
    await db.query("update public.task_photos set created_at=now()-interval '91 days' where id=$1",[first]);
    await db.exec("set role service_role");
    await db.query("select public.expire_r2_photo($1)",[first]);
    await db.query("select public.expire_r2_photo($1)",[first]);
    expect((await db.query("select * from public.audit_logs")).rows).toHaveLength(1);
    expect((await db.query("select * from public.task_photos where expired_at is not null")).rows).toHaveLength(1);
    expect((await db.query("select * from public.task_photos")).rows).toHaveLength(5);
  } finally { await db.close(); }
});
