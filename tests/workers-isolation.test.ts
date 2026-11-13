import { afterEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { updateSession } from "../src/lib/supabase/middleware";
import { supabaseUrl } from "../src/lib/supabase/config";
afterEach(() => vi.unstubAllEnvs());
it("redirects protected pages and never authenticates a local demo cookie", async () => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", ""); vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
  const response = await updateSession(new NextRequest("http://localhost/painel", { headers: { cookie: "dd_session=forged-demo-token" } }));
  expect(response.status).toBe(307); expect(response.headers.get("location")).toContain("/login?next=%2Fpainel");
});
it("lets photo APIs and cron enforce their own session/bearer checks instead of redirecting", async () => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", ""); vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
  for (const path of ["/api/photos/id", "/api/cron/photos", "/login"]) {
    const response = await updateSession(new NextRequest(`http://localhost${path}`));
    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
  }
});
it("blocks mismatched Supabase destinations and any Vercel runtime in the isolated environment", () => {
  vi.stubEnv("PHOTO_ENV", "cloudflare-preview"); vi.stubEnv("VERCEL_ENV", "");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://isolated.example"); vi.stubEnv("PREVIEW_SUPABASE_URL", "https://other.example");
  expect(supabaseUrl).toThrow("teste Cloudflare");
  vi.stubEnv("PREVIEW_SUPABASE_URL", "https://isolated.example"); expect(supabaseUrl()).toBe("https://isolated.example");
  vi.stubEnv("VERCEL_ENV", "production"); expect(supabaseUrl).toThrow("teste Cloudflare");
});
