import { beforeEach, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ user: null as any, listStores: vi.fn() }));
vi.mock("../src/lib/backend", () => ({ getBackend: () => ({ auth: { getSession: async () => state.user }, listStores: state.listStores }) }));
vi.mock("next/navigation", () => ({ redirect: (path: string) => { throw new Error(`redirect:${path}`); } }));
vi.mock("../src/components/ui/illustrated-icons", () => ({ Activity: () => null, Filter: () => null, History: () => null, ScrollText: () => null, ShieldCheck: () => null }));
vi.mock("../src/components/ui", () => ({ Card: () => null, CardHeader: () => null, EmptyState: () => null, PageHeader: () => null }));
import HistoryPage from "../src/app/(app)/historico/page";
import { requireAdmin } from "../src/lib/auth-server";
import { NAV_ITEMS } from "../src/lib/constants";

beforeEach(() => { vi.clearAllMocks(); state.user = { id: "user", role: "admin", active: true }; });
it.each(["manager", "supervisor"])("blocks direct history access for %s before querying history data", async role => {
  state.user.role = role;
  await expect(HistoryPage({ searchParams: Promise.resolve({}) })).rejects.toThrow("redirect:/painel");
  expect(state.listStores).not.toHaveBeenCalled();
  expect(NAV_ITEMS.filter(item => (item.roles as readonly string[]).includes(role)).some(item => item.href === "/historico")).toBe(false);
});
it("allows administrators and keeps their history navigation", async () => {
  await expect(requireAdmin()).resolves.toBe(state.user);
  expect(NAV_ITEMS.find(item => item.href === "/historico")?.roles).toEqual(["admin"]);
});
it("requires a login before opening history", async () => {
  state.user = null;
  await expect(HistoryPage({ searchParams: Promise.resolve({}) })).rejects.toThrow("redirect:/login");
  expect(state.listStores).not.toHaveBeenCalled();
});
