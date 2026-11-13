import { beforeEach, expect, it, vi } from "vitest";
const s = vi.hoisted(() => ({ info: vi.fn(), transform: vi.fn(), output: vi.fn(), bucket: { put: vi.fn(), get: vi.fn(), delete: vi.fn() } }));
vi.mock("@opennextjs/cloudflare", () => ({ getCloudflareContext: () => ({ env: { PHOTOS_BUCKET: s.bucket, IMAGES: { info: s.info, input: () => ({ transform: s.transform }) } } }) }));
import { optimizePhoto, optimizeAvatar } from "../src/lib/photo-image.worker";
import { createPhotoObjectStore } from "../src/lib/photo-store";
beforeEach(() => {
  vi.clearAllMocks(); vi.unstubAllEnvs(); s.transform.mockReturnValue({ output: s.output });
  s.info.mockReset().mockResolvedValueOnce({ format: "image/png", width: 200, height: 100 }).mockResolvedValue({ format: "image/webp", width: 200, height: 100 });
  s.output.mockResolvedValue({ response: () => new Response(new Uint8Array([1,2,3])) });
});
it("uses decoded Images metadata, strips metadata and stores WebP without originals", async () => {
  const photo = await optimizePhoto({ buffer: Buffer.from("input"), mimeType: "fake", sizeBytes: 1, originalName: "file" });
  expect(photo).toMatchObject({ mimeType: "image/webp", width: 200, height: 100, sizeBytes: 3 });
  expect(s.transform).toHaveBeenCalledWith(expect.objectContaining({ width: 1600, height: 1600, metadata: "none" }));
  expect(s.output).toHaveBeenCalledWith({ format: "image/webp", quality: 65, anim: false });
});
it("rejects invalid formats, decoded pixel bombs, bad output and oversized input", async () => {
  const input = { buffer: Buffer.from("input"), mimeType: "image/png", sizeBytes: 1, originalName: "file" };
  s.info.mockReset().mockResolvedValue({ format: "image/svg+xml", width: 10, height: 10 }); await expect(optimizePhoto(input)).rejects.toThrow("inválida");
  s.info.mockResolvedValue({ format: "image/png", width: 10000, height: 10000 }); await expect(optimizePhoto(input)).rejects.toThrow("inválida");
  await expect(optimizePhoto({ ...input, buffer: Buffer.alloc(10 * 1024 * 1024 + 1) })).rejects.toThrow("limite");
  s.info.mockResolvedValueOnce({ format: "image/png", width: 10, height: 10 });
  s.output.mockResolvedValue({ response: () => new Response("bad", { status: 500 }) }); await expect(optimizePhoto(input)).rejects.toThrow("otimizar");
});
it("resizes avatars and uses the R2 binding without S3 credentials in Workers", async () => {
  s.info.mockReset().mockResolvedValueOnce({ format: "image/png", width: 100, height: 100 }).mockResolvedValue({ format: "image/webp", width: 96, height: 96 });
  expect((await optimizeAvatar(Buffer.from("input"))).length).toBe(3);
  expect(s.transform).toHaveBeenCalledWith(expect.objectContaining({ width: 96, height: 96, fit: "cover" }));
  vi.stubEnv("CLOUDFLARE_WORKERS", "true"); vi.stubEnv("PHOTO_ENV", "cloudflare-preview"); vi.stubEnv("VERCEL_ENV", "");
  vi.stubEnv("PREVIEW_SUPABASE_URL", "https://isolated.example"); vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://isolated.example");
  await createPhotoObjectStore().put("key", new Uint8Array([1])); expect(s.bucket.put).toHaveBeenCalled();
  vi.unstubAllEnvs();
});
