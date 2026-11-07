import { afterEach, expect, it, vi } from "vitest";
import { isSupabaseConfigured } from "../src/lib/supabase/config";
import { localDataDir } from "../src/lib/backend/local/db";
afterEach(() => vi.unstubAllEnvs());
it("isolates Vercel previews even with inherited production connection values", () => {
  vi.stubEnv("VERCEL_ENV", "preview");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-public");
  vi.stubEnv("LOCAL_DATA_DIR", "/production/path");
  expect(isSupabaseConfigured()).toBe(false);
  expect(localDataDir()).toBe("/tmp/dd-ux-preview");
});
it("keeps configured production on Supabase", () => {
  vi.stubEnv("VERCEL_ENV", "production");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-public");
  expect(isSupabaseConfigured()).toBe(true);
});
