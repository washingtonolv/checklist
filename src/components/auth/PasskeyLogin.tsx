"use client";

import { useEffect, useState } from "react";
import { finishPasskeyLoginAction } from "@/actions/passkeys";
import { getPasskeyClient, supportsPasskeys } from "@/lib/supabase/browser";
import { passkeyErrorMessage, safePasskeyNext } from "@/lib/passkeys";

export function PasskeyLogin({ next }: { next: string }) {
  const [supported, setSupported] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => setSupported(supportsPasskeys()), []);
  if (!supported) return null;

  async function signIn() {
    setBusy(true);
    setMessage("");
    try {
      const { error } = await getPasskeyClient().auth.signInWithPasskey();
      if (error) throw error;
      const result = await finishPasskeyLoginAction(next);
      if (!result.ok) { setMessage(result.error ?? "Entre com sua senha."); return; }
      // A full navigation reads the newly persisted cookies on the server.
      window.location.assign(safePasskeyNext(result.next ?? "/painel"));
    } catch (error) {
      setMessage(passkeyErrorMessage(error));
    } finally { setBusy(false); }
  }

  return <div className="mt-5 border-t border-line pt-5">
    <button type="button" className="btn-secondary w-full rounded-full py-3" onClick={signIn} disabled={busy} aria-busy={busy}>
      {busy ? "Aguardando confirmação..." : "Entrar com biometria ou chave de acesso"}
    </button>
    <p className="mt-2 text-center text-xs text-ink/65">Já cadastrou uma chave no seu perfil? Use a digital, o rosto ou o desbloqueio do aparelho.</p>
    {message ? <p role="status" className="mt-3 text-sm text-ink/80">{message}</p> : null}
  </div>;
}
