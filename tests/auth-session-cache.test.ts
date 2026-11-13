import { afterEach, beforeEach, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  react: require("next/dist/compiled/react/react.react-server"),
  getSession: vi.fn()
}));
vi.mock("react", () => ({ cache: state.react.cache }));
vi.mock("@/lib/backend", () => ({ getBackend: () => ({ auth: { getSession: state.getSession } }) }));
vi.mock("next/navigation", () => ({ redirect: (path: string) => { throw new Error(`redirect:${path}`); } }));
import { getSessionUser, requireAdmin, requireUser } from "../src/lib/auth-server";

// Use Next's real React cache with a fresh server-render cache scope each time.
function startRender() {
  const values = new Map();
  state.react.__SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE.A = {
    getCacheForType(factory: () => unknown) {
      if (!values.has(factory)) values.set(factory, factory());
      return values.get(factory);
    }
  };
}
beforeEach(() => { state.getSession.mockReset(); startRender(); });
afterEach(() => { state.react.__SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE.A = null; });
const manager = { id: "manager-a", name: "Manager", email: "manager@example.test", role: "manager", active: true, storeIds: ["store-a"] };

it("shares one verified session lookup between layout and page within a render", async () => {
  state.getSession.mockResolvedValue(manager);
  const users = await Promise.all([requireUser(), requireUser(), getSessionUser()]);
  expect(users).toEqual([manager, manager, manager]);
  expect(state.getSession).toHaveBeenCalledTimes(1);
});

it("does not share a signed-in user's session with another request or after logout", async () => {
  state.getSession.mockResolvedValueOnce(manager).mockResolvedValueOnce(null);
  expect(await requireUser()).toEqual(manager);
  startRender();
  await expect(requireUser()).rejects.toThrow("redirect:/login");
  expect(state.getSession).toHaveBeenCalledTimes(2);
});

it("still rejects a non-admin even when their session is already cached", async () => {
  state.getSession.mockResolvedValue(manager);
  await requireUser();
  await expect(requireAdmin()).rejects.toThrow("redirect:/painel");
  expect(state.getSession).toHaveBeenCalledTimes(1);
});
