"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { KeyRound } from "@/components/ui/material-icons";
import { resetPasswordAction } from "@/actions/auth";
import { initialActionState } from "@/actions/state";
import { Alert } from "@/components/ui";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full py-3" disabled={pending}>
      <KeyRound className="h-4 w-4" />
      {pending ? "Salvando..." : "Definir nova senha"}
    </button>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action] = useFormState(resetPasswordAction, initialActionState);
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-ink/70">Segurança</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Criar nova senha</h1>
      <p className="mt-2 text-sm text-ink/70">Use no mínimo 8 caracteres e não compartilhe sua senha.</p>

      <div className="mt-6 space-y-4">
        {state?.error ? <Alert tone="error">{state.error}</Alert> : null}
        {state.message ? (
          <Alert tone="success">
            <p>{state.message}</p>
            <Link href="/login" className="link mt-2 inline-block">
              Ir para o login
            </Link>
          </Alert>
        ) : (
          <form action={action} className="space-y-4">
            <input type="hidden" name="token" value={token} />
            <div>
              <label htmlFor="password" className="label">
                Nova senha
              </label>
              <input id="password" name="password" type="password" required minLength={8} className="input" autoComplete="new-password" />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="label">
                Confirmar nova senha
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                className="input"
                autoComplete="new-password"
              />
            </div>
            <Submit />
          </form>
        )}
        {!state.message ? (
          <p className="text-center text-sm text-ink/70">
            <Link href="/login" className="link">
              Voltar para o login
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}

