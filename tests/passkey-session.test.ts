import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { expect, it, vi } from "vitest";

it("persists a passkey-issued session in SSR cookies and lets the server verify it", async () => {
  const id = "00000000-0000-4000-8000-000000000001";
  const user = { id, aud: "authenticated", role: "authenticated", email: "test@example.invalid", app_metadata: {}, user_metadata: {}, created_at: "2026-01-01T00:00:00Z" };
  const jwt = `${Buffer.from(JSON.stringify({ alg: "HS256" })).toString("base64url")}.${Buffer.from(JSON.stringify({ sub: id, exp: Math.floor(Date.now() / 1000) + 3600 })).toString("base64url")}.test-signature`;
  const jar = new Map<string, string>();
  const cookies = {
    getAll: () => Array.from(jar, ([name, value]) => ({ name, value })),
    setAll: (values: { name: string; value: string }[]) => values.forEach(({ name, value }) => jar.set(name, value))
  };
  // No network or hosted account: exercise the real pinned SDK/cookie adapter.
  const fetchMock = vi.fn(async () => new Response(JSON.stringify(user), { headers: { "Content-Type": "application/json" } }));
  const browser = createBrowserClient("https://test-project.supabase.co", "public-test-key", {
    isSingleton: false, cookies, global: { fetch: fetchMock },
    auth: { autoRefreshToken: false, detectSessionInUrl: false, experimental: { passkey: true } }
  });
  const { error } = await browser.auth.setSession({ access_token: jwt, refresh_token: "test-refresh" });
  expect(error).toBeNull();
  expect(Array.from(jar.keys()).some(name => name.includes("auth-token"))).toBe(true);
  const server = createServerClient("https://test-project.supabase.co", "public-test-key", { cookies, global: { fetch: fetchMock } });
  const verified = await server.auth.getUser();
  expect(verified.error).toBeNull();
  expect(verified.data.user?.id).toBe(id);
  expect(fetchMock).toHaveBeenCalled();
  await browser.auth.stopAutoRefresh();
});
