"use client";

import Link from "next/link";
import { FormExperience } from "./FormExperience";
import { useFormState, useFormStatus } from "react-dom";
import { Save } from "@/components/ui/illustrated-icons";
import { saveStoreAction } from "@/actions/stores";
import { initialActionState } from "@/actions/state";
import { Alert } from "@/components/ui";
import type { Store } from "@/lib/types";

function Submit({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending} aria-busy={pending}>
      <Save className="h-4 w-4" />
      {pending ? "Salvando..." : editing ? "Salvar alterações" : "Cadastrar loja"}
    </button>
  );
}

export function StoreForm({
  store,
  managers,
  supervisors
}: {
  store?: Store;
  managers: { id: string; name: string }[];
  supervisors: { id: string; name: string }[];
}) {
  const [state, action] = useFormState(saveStoreAction, initialActionState);
  const editing = Boolean(store);

  return (
    <FormExperience action={action} className="space-y-5">
      {store ? <input type="hidden" name="id" value={store.id} /> : null}
      {state?.error ? <Alert tone="error">{state.error}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="label">Nome da loja *</label>
          <input id="name" name="name" required defaultValue={store?.name} className="input" placeholder="D&D Centro" />
        </div>
        <div>
          <label htmlFor="code" className="label">Código / identificação *</label>
          <input id="code" name="code" required defaultValue={store?.code} className="input" placeholder="LOJA-001" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="managerId" className="label">Gerente responsável</label>
          <select id="managerId" name="managerId" defaultValue={store?.managerId ?? ""} className="input">
            <option value="">Sem gerente vinculado</option>
            {managers.map((manager) => (
              <option key={manager.id} value={manager.id}>{manager.name}</option>
            ))}
          </select>
          <p className="hint">O gerente visualiza somente esta loja.</p>
        </div>
        <div>
          <label className="label">Status da unidade</label>
          <label className="flex h-[42px] cursor-pointer items-center gap-3 rounded-xl border border-ink/20 bg-surface px-3.5">
            <input type="checkbox" name="active" defaultChecked={store?.active ?? true} className="h-4 w-4 accent-brand" />
            <span className="text-sm font-semibold text-ink/75">Loja ativa</span>
          </label>
          <p className="hint">Lojas inativas não geram novas atividades.</p>
        </div>
      </div>

      <div>
        <p className="label">Supervisores responsáveis</p>
        {supervisors.length ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {supervisors.map((supervisor) => (
              <label key={supervisor.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink/15 bg-surface px-3.5 py-2.5 hover:border-turquesa">
                <input
                  type="checkbox"
                  name="supervisorIds"
                  value={supervisor.id}
                  defaultChecked={store?.supervisors.some((item) => item.id === supervisor.id)}
                  className="h-4 w-4 accent-brand"
                />
                <span className="text-sm text-ink/75">{supervisor.name}</span>
              </label>
            ))}
          </div>
        ) : (
          <Alert tone="info">Cadastre supervisores no módulo de usuários antes de vincular lojas.</Alert>
        )}
        <p className="hint">O supervisor visualiza todas as lojas marcadas acima.</p>
      </div>

      <div className="form-actions flex flex-wrap items-center justify-end gap-2 border-t border-ink/10 pt-4">
        <Link href="/lojas" className="btn-ghost">Cancelar</Link>
        <Submit editing={editing} />
      </div>
    </FormExperience>
  );
}

