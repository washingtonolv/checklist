import { beforeEach, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ getUser: vi.fn(), from: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: () => ({ auth: { getUser: state.getUser }, from: state.from }) }));
vi.mock("@/lib/supabase/admin", () => ({ createSupabaseAdminClient: vi.fn() }));
import { createSupabaseBackend } from "../src/lib/backend/supabase";
beforeEach(() => { state.getUser.mockReset(); state.from.mockReset(); });
const profile = { id: "fixture", name: "Fixture", email: "fixture@example.test", role: "manager", active: true };

it("starts profile and RLS-scoped store lookups together after verifying the user", async () => {
  state.getUser.mockResolvedValue({ data: { user: { id: profile.id } } });
  let resolveProfile!: (value: unknown) => void;
  const profileResult = new Promise(resolve => { resolveProfile = resolve; });
  state.from.mockImplementation((table: string) => ({ select: () => ({ eq: () => table === "profiles" ? { maybeSingle: () => profileResult } : Promise.resolve({ data: [{ id: "allowed-store" }] }) }) }));
  const session = createSupabaseBackend().auth.getSession();
  await vi.waitFor(() => expect(state.from).toHaveBeenCalledWith("stores"));
  resolveProfile({ data: profile });
  expect(await session).toEqual({ ...profile, storeIds: ["allowed-store"] });
});

it("still rejects inactive profiles", async () => {
  state.getUser.mockResolvedValue({ data: { user: { id: profile.id } } });
  state.from.mockImplementation((table: string) => ({ select: () => ({ eq: () => table === "profiles" ? { maybeSingle: async () => ({ data: { ...profile, active: false } }) } : Promise.resolve({ data: [] }) }) }));
  expect(await createSupabaseBackend().auth.getSession()).toBeNull();
});

it("does not query profile or stores without an authenticated user", async () => {
  state.getUser.mockResolvedValue({ data: { user: null } });
  expect(await createSupabaseBackend().auth.getSession()).toBeNull();
  expect(state.from).not.toHaveBeenCalled();
});
