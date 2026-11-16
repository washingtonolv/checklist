"use client";

import { useCallback, useEffect, useState } from "react";
import { verifyPasskeyAccountAction } from "@/actions/passkeys";
import { getPasskeyClient, supportsPasskeys } from "@/lib/supabase/browser";
import { passkeyErrorMessage } from "@/lib/passkeys";

type Key = { id: string; friendly_name?: string | null; created_at: string };

export function ProfilePasskeys() {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [keys, setKeys] = useState<Key[]>([]);
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState("");
  const [removeId, setRemoveId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await getPasskeyClient().auth.passkey.list();
    if (error) throw error;
    setKeys(data ?? []);
  }, []);

  useEffect(() => {
    const available = supportsPasskeys();
    setSupported(available);
    if (!available) { setBusy(false); return; }
    let mounted = true;
    load().catch(error => { if (mounted) setMessage(passkeyErrorMessage(error)); })
      .finally(() => { if (mounted) setBusy(false); });
    return () => { mounted = false; };
  }, [load]);

  async function register() {
    setBusy(true); setMessage("");
    try {
      const account = await verifyPasskeyAccountAction();
      if (!account.ok) { setMessage(account.error!); return; }
      const { error } = await getPasskeyClient().auth.registerPasskey();
      if (error) throw error;
      await load();
      setMessage("Chave cadastrada! No próximo acesso, você poderá entrar com a biometria ou o desbloqueio do aparelho.");
    } catch (error) { setMessage(passkeyErrorMessage(error)); }
    finally { setBusy(false); }
  }

  async function remove(id: string) {
    setBusy(true); setMessage("");
    try {
      const { error } = await getPasskeyClient().auth.passkey.delete({ passkeyId: id });
      if (error) throw error;
      setKeys(current => current.filter(key => key.id !== id));
      setRemoveId(null);
      setMessage("Chave removida desta conta. Sua senha continua funcionando.");
    } catch (error) { setMessage(passkeyErrorMessage(error)); }
    finally { setBusy(false); }
  }

  return <div className="space-y-4">
    <p className="text-sm text-ink/70">Entre com a digital, o reconhecimento facial ou o PIN do aparelho. Sua biometria fica no dispositivo. A senha continua disponível como alternativa.</p>
    {supported === false ? <p role="status" className="text-sm text-ink/70">Abra o app da Cloudflare em um navegador compatível com chaves de acesso. Você pode continuar usando sua senha.</p> : null}
    {supported ? <>
      <button type="button" className="btn-primary" disabled={busy} onClick={register} aria-busy={busy}>{busy ? "Aguarde..." : "Ativar biometria / cadastrar chave"}</button>
      <p className="text-xs text-ink/65">O aparelho pedirá sua confirmação. Cadastre apenas em um aparelho ou gerenciador de senhas de sua confiança.</p>
      <ul className="space-y-2" aria-label="Suas chaves de acesso">
        {keys.map(key => <li key={key.id} className="rounded-xl border border-line p-3 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><p className="font-semibold">{key.friendly_name || "Chave de acesso"}</p><p className="text-xs text-ink/65">Cadastrada em {new Date(key.created_at).toLocaleDateString("pt-BR")}</p></div>
            <button type="button" className="btn-secondary" disabled={busy} onClick={() => setRemoveId(key.id)}>Remover</button>
          </div>
          {removeId === key.id ? <div className="mt-3 space-y-2" role="group" aria-label="Confirmar remoção">
            <p>Remover esta chave? Para usá-la novamente, será necessário cadastrá-la. Você continuará podendo entrar com sua senha.</p>
            <div className="flex flex-wrap gap-2"><button type="button" className="btn-secondary" disabled={busy} onClick={() => setRemoveId(null)}>Cancelar</button><button type="button" className="btn-primary" disabled={busy} onClick={() => remove(key.id)}>Confirmar remoção</button></div>
          </div> : null}
        </li>)}
      </ul>
      {!busy && !keys.length ? <p className="text-sm text-ink/65">Nenhuma chave cadastrada ainda.</p> : null}
    </> : null}
    {message ? <p role="status" className="text-sm text-ink/80">{message}</p> : null}
  </div>;
}
