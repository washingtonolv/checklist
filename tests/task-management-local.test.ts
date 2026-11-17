import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { beforeAll, afterAll, it, expect } from "vitest";
import { createLocalBackend } from "../src/lib/backend/local";
import { getDb, resetLocalDbCacheForTests } from "../src/lib/backend/local/db";
import { templateSchema } from "../src/lib/validation";
import type { SessionUser, TaskTemplateInput } from "../src/lib/types";
const backend = createLocalBackend();
let dir: string, admin: SessionUser, store: string;
beforeAll(async () => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "dd-management-"));
  process.env.LOCAL_DATA_DIR = dir;
  resetLocalDbCacheForTests();
  const db = await getDb();
  const user = db.users.find((u) => u.role === "admin")!;
  store = db.stores[0].id;
  admin = { ...user, storeIds: [store] };
});
afterAll(() => { resetLocalDbCacheForTests(); delete process.env.LOCAL_DATA_DIR; fs.rmSync(dir, { recursive: true, force: true }); });
function input(active = false): TaskTemplateInput {
  return { title: "Modelo de teste", description: "Orientação", categoryId: null, recurrence: "daily", dueTime: "18:00", onceDueDate: null, photoRequirement: "none", active, storeIds: [store] };
}
it("accepts an empty category but rejects malformed identifiers", () => {
  expect(templateSchema.parse({ ...input(), categoryId: "" }).categoryId).toBeNull();
  expect(templateSchema.safeParse({ ...input(), categoryId: "invalid" }).success).toBe(false);
});
it("creates, edits, archives and restores uncategorized models while preserving tasks", async () => {
  const template = await backend.createTemplate(admin, input(true));
  const before = (await getDb()).tasks.filter((t) => t.templateId === template.id).map((t) => ({ ...t }));
  expect(before.length).toBeGreaterThan(0);
  expect(before[0].categoryId).toBeNull();
  await backend.updateTemplate(admin, template.id, { ...input(true), title: "Novo nome" });
  await backend.setTemplateActive(admin, template.id, false);
  expect((await backend.getTemplate(admin, template.id))?.active).toBe(false);
  expect((await getDb()).tasks.filter((t) => t.templateId === template.id)).toEqual(before);
  await expect(backend.deleteTemplate(admin, template.id)).rejects.toThrow(/Arquive/);
  await backend.setTemplateActive(admin, template.id, true);
  expect((await backend.getTemplate(admin, template.id))?.active).toBe(true);
});
it("blocks category deletion until models are reassigned and audits deletion", async () => {
  const category = await backend.createCategory(admin, { name: "Categoria temporária", description: "", active: true, sortOrder: 0 });
  const template = await backend.createTemplate(admin, { ...input(), categoryId: category.id });
  await expect(backend.deleteCategory(admin, category.id)).rejects.toThrow(/Transfira/);
  await backend.updateTemplate(admin, template.id, input());
  await backend.deleteCategory(admin, category.id);
  await backend.deleteTemplate(admin, template.id);
  expect((await backend.listAudit(admin)).some((a) => a.entityId === template.id && a.action === "template.deleted")).toBe(true);
});
it("retains categories referenced by historical tasks even after model reassignment", async () => {
  const category = await backend.createCategory(admin, { name: "Categoria histórica", description: "", active: true, sortOrder: 0 });
  const template = await backend.createTemplate(admin, { ...input(true), categoryId: category.id });
  await backend.updateTemplate(admin, template.id, input());
  await expect(backend.deleteCategory(admin, category.id)).rejects.toThrow(/histórico/);
  await backend.setCategoryActive(admin, category.id, false);
  await expect(backend.createTemplate(admin, { ...input(), categoryId: category.id })).rejects.toThrow(/Categoria/);
  await backend.setCategoryActive(admin, category.id, true);
});
it("denies mutations to managers and inactive administrators", async () => {
  for (const actor of [{ ...admin, role: "manager" as const }, { ...admin, active: false }]) {
    await expect(backend.createTemplate(actor, input())).rejects.toThrow();
    await expect(backend.setTemplateActive(actor, "any", false)).rejects.toThrow();
    await expect(backend.deleteTemplate(actor, "any")).rejects.toThrow();
    await expect(backend.deleteCategory(actor, "any")).rejects.toThrow();
  }
});
