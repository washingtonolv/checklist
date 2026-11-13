import { beforeEach, expect, it, vi } from "vitest";
import sharp from "sharp";
const s = vi.hoisted(() => ({ task: { id: "task", store_id: "store", status: "pending" }, count: 0 as number|null,
  insertError: null as any, missing: false, createdAt: "", put: vi.fn(), remove: vi.fn(), get: vi.fn(), insert: vi.fn(), audit: vi.fn(), deleteError: null as any }));
vi.mock("../src/lib/supabase/server", () => ({ createSupabaseServerClient: () => ({
  rpc: s.audit,
  from(table: string) {
    const q: any = { select: () => q, eq: () => q, order: () => q, in: () => q,
      maybeSingle: async () => ({ data: s.missing ? null : table === "task_instances" ? s.task : { id: "photo", storage_path: "key", task_id: "task", task: s.task, created_at: s.createdAt } }),
      then: (resolve: any) => Promise.resolve({ count: s.count, error: s.deleteError }).then(resolve),
      insert: async (data: any) => { s.insert(table, data); return { error: table === "task_photos" ? s.insertError : null }; },
      delete: () => q };
    return q;
  }
}) }));
vi.mock("../src/lib/photo-store", async (original) => ({ ...await original<any>(), assertPhotoEnvironment: vi.fn(), createPhotoObjectStore: () => ({ put: s.put, delete: s.remove, get: s.get }) }));
vi.mock("../src/lib/supabase/admin", () => ({ createSupabaseAdminClient: () => ({ from: () => ({ insert: async (data: any) => { s.insert("task_photos", data); return { error: s.insertError }; } }) }) }));
import { createSupabaseBackend } from "../src/lib/backend/supabase";
import { readPhoto } from "../src/lib/photo-read";
import { optimizePhoto } from "../src/lib/photo-image";
import type { SessionUser, UploadPhotoInput } from "../src/lib/types";
const actor: SessionUser = { id: "user", name: "User", email: "test@example.test", role: "manager", active: true, storeIds: ["store"] };
const backend = createSupabaseBackend();
let input: UploadPhotoInput;
beforeEach(async () => {
  vi.clearAllMocks(); s.task.status = "pending"; s.count = 0; s.insertError = null; s.missing = false; s.deleteError = null;
  s.createdAt = new Date().toISOString();
  s.put.mockResolvedValue(undefined); s.remove.mockResolvedValue(undefined); s.audit.mockResolvedValue({ error: null });
  const buffer = await sharp({ create: { width: 20, height: 12, channels: 3, background: "red" } }).png().toBuffer();
  input = { buffer, sizeBytes: 1, mimeType: "fake/type", originalName: "fake.jpg", width: 999, height: 999 };
});
it("decodes bytes, records actual optimized metadata and never preserves originals", async () => {
  input.original = { buffer: Buffer.from("discard"), sizeBytes: 7, mimeType: "text/plain" };
  const photo = await backend.uploadPhoto(actor, "task", input);
  expect(photo.mimeType).toBe("image/webp"); expect(photo.sizeBytes).toBeGreaterThan(1);
  expect(photo.storagePath).toMatch(/^lojas\/store\/\d{4}\/\d{2}\/\d{2}\/task\/.*\.webp$/);
  expect(photo.url).toBe(`/api/photos/${photo.id}`); expect(s.put).toHaveBeenCalledTimes(1);
  expect(s.insert).toHaveBeenCalledWith("task_photos", expect.objectContaining({ width: 20, height: 12, is_original: false }));
});
it("denies other stores, invisible tasks, completed tasks and exhausted/unknown counts before R2", async () => {
  await expect(backend.uploadPhoto({ ...actor, storeIds: [] }, "task", input)).rejects.toThrow("loja");
  s.missing = true; await expect(backend.uploadPhoto(actor, "task", input)).rejects.toThrow("permissão"); s.missing = false;
  s.task.status = "completed"; await expect(backend.uploadPhoto(actor, "task", input)).rejects.toThrow("concluída"); s.task.status = "pending";
  s.count = 5; await expect(backend.uploadPhoto(actor, "task", input)).rejects.toThrow("Limite");
  s.count = null; await expect(backend.uploadPhoto(actor, "task", input)).rejects.toThrow("limite"); expect(s.put).not.toHaveBeenCalled();
});
it("rejects disguised and oversized images", async () => {
  await expect(optimizePhoto({ ...input, buffer: Buffer.from("not an image") })).rejects.toThrow();
  await expect(optimizePhoto({ ...input, buffer: Buffer.alloc(10 * 1024 * 1024 + 1), sizeBytes: 1 })).rejects.toThrow("10 MB");
});
it("compensates metadata failure and does not insert after R2 upload failure", async () => {
  s.insertError = { message: "database failed" };
  await expect(backend.uploadPhoto(actor, "task", input)).rejects.toThrow("database failed");
  expect(s.remove).toHaveBeenCalledWith(s.put.mock.calls[0][0]);
  s.insert.mockClear(); s.put.mockRejectedValue(new Error("R2 failed"));
  await expect(backend.uploadPhoto(actor, "task", input)).rejects.toThrow("R2 failed"); expect(s.insert).not.toHaveBeenCalled();
});
it("restricts deletion to admin and stops metadata removal when R2 fails", async () => {
  await expect(backend.deletePhoto(actor, "photo")).rejects.toThrow("gerente comercial");
  s.remove.mockRejectedValue(new Error("R2 delete failed"));
  await expect(backend.deletePhoto({ ...actor, role: "admin" }, "photo")).rejects.toThrow("R2 delete failed");
  expect(s.audit).not.toHaveBeenCalled();
});
it("requires shop access on every proxy read and sends no-store image responses", async () => {
  await expect(readPhoto({ ...actor, storeIds: [] }, "photo")).rejects.toThrow("loja"); expect(s.get).not.toHaveBeenCalled();
  s.get.mockResolvedValue(new Response("image"));
  const response = await readPhoto(actor, "photo");
  expect(response.headers.get("Cache-Control")).toBe("private, no-store"); expect(response.headers.get("Content-Type")).toBe("image/webp");
});
it("returns 410 for expired evidence and 404 for invisible or missing objects", async () => {
  s.createdAt = "2020-01-01T00:00:00Z";
  expect((await readPhoto(actor, "photo")).status).toBe(410); expect(s.get).not.toHaveBeenCalled();
  s.createdAt = new Date().toISOString(); s.get.mockResolvedValue(null);
  expect((await readPhoto(actor, "photo")).status).toBe(404);
  s.missing = true; expect((await readPhoto(actor, "photo")).status).toBe(404);
});
it("deletes in R2 before the atomic metadata/audit RPC", async () => {
  await backend.deletePhoto({ ...actor, role: "admin" }, "photo");
  expect(s.remove).toHaveBeenCalledWith("key"); expect(s.audit).toHaveBeenCalledWith("delete_r2_photo", { p_id: "photo" });
  expect(s.remove.mock.invocationCallOrder[0]).toBeLessThan(s.audit.mock.invocationCallOrder[0]);
});
