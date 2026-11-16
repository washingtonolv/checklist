import { beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const state = vi.hoisted(() => ({ user: null as null | { id: string }, refresh: false }));
vi.mock("@supabase/ssr", () => ({
  createServerClient: (_url: string, _key: string, options: { cookies: { setAll: Function } }) => ({
    auth: { getUser: async () => {
      if (state.refresh) options.cookies.setAll([{ name: "sb-test-auth-token", value: "refreshed-test-session", options: { path: "/", sameSite: "lax" } }], { "Cache-Control": "private, no-store" });
      return { data: { user: state.user } };
    } }
  })
}));
import { updateSession } from "../src/lib/supabase/middleware";

beforeEach(() => {
  state.user = null; state.refresh = false;
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "public-test");
  vi.stubEnv("PHOTO_ENV", "test");
});

it("preserves refreshed session cookies when redirecting a signed-in user from login", async () => {
  state.user = { id: "test-user" }; state.refresh = true;
  const response = await updateSession(new NextRequest("https://app.example/login"));
  expect(response.headers.get("location")).toBe("https://app.example/painel");
  expect(response.cookies.get("sb-test-auth-token")?.value).toBe("refreshed-test-session");
  expect(response.headers.get("cache-control")).toContain("no-store");
});

it("keeps anonymous login available and protected pages behind authentication", async () => {
  const login = await updateSession(new NextRequest("https://app.example/login"));
  expect(login.status).toBe(200);
  const profile = await updateSession(new NextRequest("https://app.example/perfil"));
  expect(profile.status).toBe(307);
  expect(profile.headers.get("location")).toContain("/login?next=%2Fperfil");
});

it("does not allow a shared cache to store authenticated HTML", async () => {
  state.user = { id: "test-user" };
  const response = await updateSession(new NextRequest("https://app.example/perfil"));
  expect(response.headers.get("cache-control")).toContain("private");
  expect(response.headers.get("cache-control")).toContain("no-store");
  expect(response.headers.get("x-frame-options")).toBe("DENY");
});
