"use server";

import { getBackend } from "@/lib/backend";
import { passkeysEnabled, safePasskeyNext } from "@/lib/passkeys";

export async function verifyPasskeyAccountAction() {
  if (!passkeysEnabled()) return { ok: false, error: "O acesso por biometria está desativado." };
  const backend = getBackend();
  // Resolve the active application profile using getUser + RLS, exactly as password login does.
  const user = await backend.auth.getSession();
  if (!user) {
    await backend.auth.signOut();
    return { ok: false, error: "Conta indisponível ou sessão expirada. Entre com sua senha ou procure o administrador." };
  }
  return { ok: true };
}

export async function finishPasskeyLoginAction(next: string) {
  const result = await verifyPasskeyAccountAction();
  return { ...result, next: result.ok ? safePasskeyNext(next) : undefined };
}
