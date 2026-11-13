import { afterEach, expect, it, vi } from "vitest";
const s = vi.hoisted(() => ({ fetch: vi.fn(), config: vi.fn() }));
vi.mock("aws4fetch", () => ({ AwsClient: class { constructor(config: unknown) { s.config(config); } fetch = s.fetch; } }));
import { createPhotoObjectStore } from "../src/lib/photo-store";
afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });
it("uses the private R2 S3 endpoint with server credentials and propagates failures", async () => {
  vi.stubEnv("PHOTO_ENV", "cloudflare-preview"); vi.stubEnv("VERCEL_ENV", "");
  vi.stubEnv("PREVIEW_SUPABASE_URL", "https://isolated.example"); vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://isolated.example");
  vi.stubEnv("R2_ACCOUNT_ID", "a".repeat(32)); vi.stubEnv("R2_BUCKET", "isolated-photos");
  vi.stubEnv("R2_ACCESS_KEY_ID", "test-access"); vi.stubEnv("R2_SECRET_ACCESS_KEY", "test-secret");
  const store = createPhotoObjectStore();
  const key = "lojas/11111111-1111-1111-1111-111111111111/2026/11/12/22222222-2222-2222-2222-222222222222/33333333-3333-3333-3333-333333333333.webp";
  s.fetch.mockResolvedValue(new Response(null)); await store.put(key,new Uint8Array([1]));
  expect(s.config).toHaveBeenCalledWith(expect.objectContaining({ service:"s3",region:"auto",accessKeyId:"test-access" }));
  expect(s.fetch).toHaveBeenCalledWith(`https://${"a".repeat(32)}.r2.cloudflarestorage.com/isolated-photos/${key}`,expect.objectContaining({method:"PUT",cache:"no-store",headers:{"Content-Type":"image/webp"}}));
  s.fetch.mockResolvedValue(new Response(null,{status:404})); expect(await store.get(key)).toBeNull();
  s.fetch.mockResolvedValue(new Response(null,{status:503})); await expect(store.delete(key)).rejects.toThrow("503");
  await expect(store.get("../../bad")).rejects.toThrow("inválida");
});
