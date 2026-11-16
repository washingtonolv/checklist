import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { passkeyErrorMessage, passkeysEnabled, safePasskeyNext } from "../src/lib/passkeys";
import { supportsPasskeys } from "../src/lib/supabase/browser";

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("Cloudflare-only passkeys", () => {
  it("requires explicit runtime activation and never enables Vercel", () => {
    vi.stubEnv("PASSKEYS_ENABLED", "true");
    vi.stubEnv("PHOTO_ENV", "cloudflare");
    vi.stubEnv("VERCEL_ENV", "");
    expect(passkeysEnabled()).toBe(true);
    vi.stubEnv("VERCEL_ENV", "production");
    expect(passkeysEnabled()).toBe(false);
    vi.stubEnv("VERCEL_ENV", "");
    vi.stubEnv("PHOTO_ENV", "cloudflare-preview");
    expect(passkeysEnabled()).toBe(false);
    vi.stubEnv("PHOTO_ENV", "cloudflare");
    vi.stubEnv("PASSKEYS_ENABLED", "false");
    expect(passkeysEnabled()).toBe(false);
  });

  it("requires WebAuthn, HTTPS and the exact registered origin", () => {
    expect(supportsPasskeys()).toBe(false);
    const browser = { isSecureContext: true, location: { origin: "https://checklist-dd.checklist-operacional-dd.workers.dev" }, PublicKeyCredential: class {} };
    vi.stubGlobal("window", browser);
    vi.stubGlobal("navigator", { credentials: {} });
    expect(supportsPasskeys()).toBe(true);
    browser.location.origin = "https://checklist-rosy-eight.vercel.app";
    expect(supportsPasskeys()).toBe(false);
    browser.location.origin = "https://checklist-dd.checklist-operacional-dd.workers.dev";
    browser.isSecureContext = false;
    expect(supportsPasskeys()).toBe(false);
  });

  it.each(["https://evil.example", "//evil.example", "/\\evil.example", "/\n/evil.example", "javascript:alert(1)"])("blocks unsafe post-login destination %s", next => {
    expect(safePasskeyNext(next)).toBe("/painel");
  });
  it("preserves internal destinations", () => expect(safePasskeyNext("/atividades?status=pendente")).toBe("/atividades?status=pendente"));
  it("keeps password fallback clear after cancellation or a disabled provider", () => {
    expect(passkeyErrorMessage({ name: "NotAllowedError" })).toContain("senha");
    expect(passkeyErrorMessage({ code: "passkey_disabled" })).toContain("senha");
    expect(passkeyErrorMessage(new Error("secret server details"))).not.toContain("secret");
  });
});

const auth = vi.hoisted(() => ({ getSession: vi.fn(), signOut: vi.fn() }));
vi.mock("@/lib/backend", () => ({ getBackend: () => ({ auth }) }));
import { finishPasskeyLoginAction, verifyPasskeyAccountAction } from "../src/actions/passkeys";

describe("passkey application authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("PASSKEYS_ENABLED", "true");
    vi.stubEnv("PHOTO_ENV", "cloudflare");
    vi.stubEnv("VERCEL_ENV", "");
  });
  it("rejects absent/inactive profiles and clears the new auth session", async () => {
    auth.getSession.mockResolvedValue(null);
    const result = await finishPasskeyLoginAction("/painel");
    expect(result.ok).toBe(false);
    expect(result.next).toBeUndefined();
    expect(auth.signOut).toHaveBeenCalledOnce();
  });
  it("accepts the existing profile authorization path and normalizes navigation", async () => {
    auth.getSession.mockResolvedValue({ id: "manager", role: "manager", active: true });
    expect(await finishPasskeyLoginAction("//evil.example")).toEqual({ ok: true, next: "/painel" });
    expect(auth.signOut).not.toHaveBeenCalled();
  });
  it("does not access auth when disabled", async () => {
    vi.stubEnv("PASSKEYS_ENABLED", "false");
    expect((await verifyPasskeyAccountAction()).ok).toBe(false);
    expect(auth.getSession).not.toHaveBeenCalled();
  });
});
