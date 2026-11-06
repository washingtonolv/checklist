"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { Mail } from "@/components/ui/material-icons";
import { requestPasswordResetAction } from "@/actions/auth";
import { initialActionState } from "@/actions/state";
import { Alert } from "@/components/ui";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full py-3" disabled={pending}>
      <Mail className="h-4 w-4" />
      {pending ? "Enviando..." : "Solicitar recuperação"}
    </button>
  );
}

export function ForgotPasswordForm() {
  const [state, action] = useFormState(requestPasswordResetAction, initialActionState);
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-ink/70">Recuperação de acesso</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Esqueceu a senha?</h1>
      <p className="mt-2 text-sm text-ink/70">
        Informe seu e-mail. Enviaremos as instruções para criar uma nova senha.
      </p>

      <div className="mt-6 space-y-4">
        {state?.error ? <Alert tone="error">{state.error}</Alert> : null}
        {state.message ? (
          <Alert tone="success">
            <p>{state.message}</p>
            {state.resetUrl ? (
              <Link href={state.resetUrl} className="link mt-2 inline-block break-all">
                Abrir link de redefinição
              </Link>
            ) : null}
          </Alert>
        ) : null}

        <form action={action} className="space-y-4">
          <div>
            <label htmlFor="email" className="label">
              E-mail
            </label>
            <input id="email" name="email" type="email" required className="input" placeholder="seu.nome@dd.com.br" />
          </div>
          <Submit />
        </form>

        <p className="text-center text-sm text-ink/70">
          <Link href="/login" className="link">
            Voltar para o login
          </Link>
        </p>
      </div>
    </div>
  );
}

