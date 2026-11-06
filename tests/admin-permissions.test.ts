import { describe, it, expect, vi } from "vitest";
vi.mock("../src/lib/supabase/server", () => ({ createSupabaseServerClient: vi.fn() }));
vi.mock("../src/lib/supabase/admin", () => ({ createSupabaseAdminClient: vi.fn() }));
import { createSupabaseBackend } from "../src/lib/backend/supabase";
import { createSupabaseAdminClient } from "../src/lib/supabase/admin";
import { GENERAL_ADMIN_ID, assertGeneralAdmin } from "../src/lib/access";
import type { SessionUser, UserInput } from "../src/lib/types";
const secondary: SessionUser = { id: "00000000-0000-4000-8000-000000000001", name: "Admin", email: "test@example.com", role: "admin", active: true, storeIds: [] };
const input: UserInput = { name: "New", email: "new@example.com", password: "test-password", role: "admin", active: true, storeIds: [] };
describe("exclusive general administrator permissions", () => {
  it("rejects creation of an administrator before accessing privileged credentials", async () => {
    vi.mocked(createSupabaseAdminClient).mockClear();
    await expect(createSupabaseBackend().createUser(secondary, input)).rejects.toThrow("Administrador Geral");
    expect(createSupabaseAdminClient).not.toHaveBeenCalled();
  });
  it("does not grant owner powers to a second administrator or matching email", () => {
    expect(() => assertGeneralAdmin({...secondary, email:"washingtonolv@gmail.com"})).toThrow();
  });
  it("requires the owner to remain active and an administrator", () => {
    expect(() => assertGeneralAdmin({...secondary,id:GENERAL_ADMIN_ID})).not.toThrow();
    expect(() => assertGeneralAdmin({...secondary,id:GENERAL_ADMIN_ID,active:false})).toThrow();
    expect(() => assertGeneralAdmin({...secondary,id:GENERAL_ADMIN_ID,role:"manager"})).toThrow();
  });
});
