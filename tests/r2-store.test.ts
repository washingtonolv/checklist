import { afterEach, expect, it, vi } from "vitest";
import { assertPhotoEnvironment, bindingPhotoStore, photoExpired, RETENTION_MS } from "../src/lib/photo-store";
afterEach(() => vi.unstubAllEnvs());
it("expires exactly at 90 days and fails closed on invalid timestamps", () => {
  const date = "2026-01-01T00:00:00Z"; const start = Date.parse(date);
  expect(photoExpired(date, start + RETENTION_MS - 1)).toBe(false);
  expect(photoExpired(date, start + RETENTION_MS)).toBe(true); expect(photoExpired("invalid")).toBe(true);
});
it("blocks Vercel, unset and mismatched preview configuration", () => {
  expect(assertPhotoEnvironment).toThrow(); vi.stubEnv("PHOTO_ENV", "cloudflare-preview");
  vi.stubEnv("PREVIEW_SUPABASE_URL", "https://isolated.example"); vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://isolated.example");
  vi.stubEnv("VERCEL_ENV", "production"); expect(assertPhotoEnvironment).toThrow();
  vi.stubEnv("VERCEL_ENV", ""); expect(assertPhotoEnvironment).not.toThrow();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://other.example"); expect(assertPhotoEnvironment).toThrow();
});
it("adapts private R2 bindings and propagates storage failures", async () => {
  const bucket = { put: vi.fn(), get: vi.fn().mockResolvedValue(null), delete: vi.fn() };
  const store = bindingPhotoStore(bucket); await store.put("key", new Uint8Array([1]));
  expect(bucket.put).toHaveBeenCalledWith("key", expect.any(Uint8Array), { httpMetadata: { contentType: "image/webp" } });
  expect(await store.get("missing")).toBeNull();
  bucket.delete.mockRejectedValue(new Error("denied")); await expect(store.delete("key")).rejects.toThrow("denied");
});
