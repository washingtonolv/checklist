"use client";

import Link from "next/link";
import { FormExperience } from "./FormExperience";
import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Save, ShieldCheck } from "@/components/ui/illustrated-icons";
import { saveUserAction } from "@/actions/users";
import { initialActionState } from "@/actions/state";
import { Alert } from "@/components/ui";
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/lib/constants";
import type { UserAccount } from "@/lib/types";

function Submit({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending} aria-busy={pending}>
      <Save className="h-4 w-4" />
      {pending ? "Salvando..." : editing ? "Salvar alterações" : "Cadastrar usuário"}
    </button>
  );
}

export function UserForm({
  user,
  stores,
  canManageAdmins = false
}: {
  user?: UserAccount;
  canManageAdmins?: boolean;
  stores: { id: string; name: string }[];
}) {
  const [state, action] = useFormState(saveUserAction, initialActionState);
  const [role, setRole] = useState<"admin" | "supervisor" | "manager">(user?.role ?? "manager");
  const editing = Boolean(user);
  const selectedStoreIds = user?.storeIds ?? [];

  return (
    <FormExperience action={action} className="space-y-5">
      {user ? <input type="hidden" name="id" value={user.id} /> : null}
      {state?.error ? <Alert tone="error">{state.error}</Alert> : null}

      <div>
        <label htmlFor="username" className="label">Nome de usuário *</label>
        <input id="username" name="username" required minLength={3} maxLength={40} pattern="[a-zA-Z0-9_.\-]{3,40}" defaultValue={user?.username ?? ""} className="input" autoComplete="off" autoCapitalize="none" spellCheck={false} placeholder="Ex.: maria.silva" />
        <p className="hint">A pessoa poderá entrar com este usuário ou com o e-mail, usando a mesma senha. Não use espaços ou acentos.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="label">Nome completo *</label>
          <input id="name" name="name" autoComplete="name" required defaultValue={user?.name} className="input" placeholder="Nome do responsável" />
        </div>
        <div>
          <label htmlFor="email" className="label">E-mail de acesso *</label>
          <input id="email" name="email" type="email" required defaultValue={user?.email} className="input" placeholder="nome@empresa.com" autoComplete="email" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="role" className="label">Perfil de acesso *</label>
          <select
            id="role"
            name="role"
            className="input"
            value={role}
            onChange={(event) => setRole(event.target.value as "admin" | "supervisor" | "manager")}
          >
            {canManageAdmins ? <option value="admin">Administrador</option> : null}
            <option value="supervisor">{ROLE_LABELS.supervisor}</option>
            <option value="manager">{ROLE_LABELS.manager}</option>
          </select>
          <p className="hint">{ROLE_DESCRIPTIONS[role]}</p>
        </div>
        <div>
          <label htmlFor="password" className="label">{editing ? "Nova senha (opcional)" : "Senha inicial *"}</label>
          <input
            id="password"
            name="password"
            type="password"
            required={!editing}
            minLength={8}
            className="input"
            placeholder={editing ? "Deixe em branco para manter" : "No mínimo 8 caracteres"}
            autoComplete="new-password"
          />
          <p className="hint">A senha nunca é exibida após o cadastro.</p>
        </div>
      </div>

      <div>
        <p className="label">Lojas vinculadas {role === "manager" ? "*" : ""}</p>
        {role === "admin" ? <p className="hint">Acesso a todas as lojas. Somente o Administrador Geral pode remover usuários ou criar administradores.</p> : stores.length ? (
          role === "manager" ? (
            <select name="storeIds" aria-label="Loja do gerente" className="input" defaultValue={selectedStoreIds[0] ?? ""} required>
              <option value="">Selecione a loja do gerente</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>{store.name}</option>
              ))}
            </select>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {stores.map((store) => (
                <label key={store.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink/15 bg-surface px-3.5 py-2.5 hover:border-turquesa">
                  <input
                    type="checkbox"
                    name="storeIds"
                    value={store.id}
                    defaultChecked={selectedStoreIds.includes(store.id)}
                    className="h-4 w-4 accent-brand"
                  />
                  <span className="text-sm text-ink/75">{store.name}</span>
                </label>
              ))}
            </div>
          )
        ) : (
          <Alert tone="info">Cadastre uma loja antes de vincular o usuário.</Alert>
        )}
        <p className="hint">
          {role === "manager"
            ? "O gerente de loja pode ser vinculado a apenas uma unidade."
            : "O supervisor visualiza todas as lojas marcadas acima."}
        </p>
      </div>

      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink/15 bg-surface px-3.5 py-2.5">
        <input type="checkbox" name="active" defaultChecked={user?.active ?? true} className="h-4 w-4 accent-brand" />
        <span className="flex items-center gap-2 text-sm font-semibold text-ink/75">
          <ShieldCheck className="h-4 w-4 text-ink/70" />
          Usuário ativo
        </span>
      </label>

      <div className="form-actions flex flex-wrap items-center justify-end gap-2 border-t border-ink/10 pt-4">
        <Link href="/usuarios" className="btn-ghost">Cancelar</Link>
        <Submit editing={editing} />
      </div>
    </FormExperience>
  );
}

