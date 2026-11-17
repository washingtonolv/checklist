import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, expect, it } from "vitest";
import { createLocalBackend } from "../src/lib/backend/local";
import { getDb, resetLocalDbCacheForTests } from "../src/lib/backend/local/db";
import { storeSchema } from "../src/lib/validation";
import type { SessionUser, StoreInput } from "../src/lib/types";
const backend = createLocalBackend();
let dir: string, admin: SessionUser;
beforeAll(async () => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "dd-store-classification-"));
  process.env.LOCAL_DATA_DIR = dir;
  resetLocalDbCacheForTests();
  const db = await getDb();
  const user = db.users.find((u) => u.role === "admin")!;
  admin = { ...user, storeIds: [] };
});
afterAll(() => { resetLocalDbCacheForTests(); delete process.env.LOCAL_DATA_DIR; fs.rmSync(dir, { recursive: true, force: true }); });
const input: StoreInput = { name: "Franquia exemplo", code: "CLASS", region: "rio_de_janeiro", operationType: "franquia_natura", active: true, managerId: null, supervisorIds: [] };
it("requires valid persisted region/type, including the Northeast rule", () => {
  expect(storeSchema.safeParse(input).success).toBe(true);
  expect(storeSchema.safeParse({ ...input, region: "nordeste" }).success).toBe(false);
  expect(storeSchema.safeParse({ ...input, region: "nordeste", operationType: "dd_multimarcas" }).success).toBe(true);
  expect(storeSchema.safeParse({ ...input, region: undefined }).success).toBe(false);
  expect(storeSchema.safeParse({ ...input, operationType: "other" }).success).toBe(false);
});
it("keeps classification when names and staff change, including after disk reload", async () => {
  const db = await getDb();
  const supervisor = db.users.find((u) => u.role === "supervisor")!;
  const store = await backend.createStore(admin, { ...input, supervisorIds: [supervisor.id] });
  await backend.updateStore(admin, store.id, { ...input, name: "D&D PB - Novo nome", supervisorIds: [] });
  resetLocalDbCacheForTests();
  const reloaded = await backend.getStore(admin, store.id);
  expect(reloaded?.region).toBe("rio_de_janeiro");
  expect(reloaded?.operationType).toBe("franquia_natura");
  expect(reloaded?.supervisors).toEqual([]);
});
it("supports explicit reclassification without replacing store IDs or history", async () => {
  const db = await getDb();
  const original = (await backend.listStores(admin))[0];
  const tasksBefore = db.tasks.filter((t) => t.storeId === original.id).map((t) => ({ ...t }));
  const changed = await backend.updateStore(admin, original.id, { name: original.name, code: original.code, active: original.active, managerId: original.managerId, supervisorIds: original.supervisors.map((s) => s.id), region: "nordeste", operationType: "dd_multimarcas" });
  expect(changed.id).toBe(original.id);
  expect(changed.region).toBe("nordeste");
  expect(changed.managerId).toBe(original.managerId);
  expect((await getDb()).tasks.filter((t) => t.storeId === original.id)).toEqual(tasksBefore);
});
it("rejects invalid classifications and non-admin writes in the backend", async () => {
  await expect(backend.createStore(admin, { ...input, code: "BAD", region: "nordeste" })).rejects.toThrow(/região/);
  await expect(backend.createStore({ ...admin, role: "manager" }, input)).rejects.toThrow();
  const existing = (await backend.listStores(admin))[0];
  await expect(backend.updateStore(admin, existing.id, { ...input, code: existing.code, region: "nordeste" })).rejects.toThrow(/região/);
  expect((await backend.getStore(admin, existing.id))?.name).toBe(existing.name);
});
