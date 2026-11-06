"use client";

import { useFormState, useFormStatus } from "react-dom";
import { KeyRound } from "@/components/ui/material-icons";
import { updatePasswordAction } from "@/actions/auth";
import { initialActionState } from "@/actions/state";
import { Alert } from "@/components/ui";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      <KeyRound className="h-4 w-4" />
      {pending ? "Salvando..." : "Atualizar senha"}
    </button>
  );
}

export function ProfilePasswordForm() {
  const [state, action] = useFormState(updatePasswordAction, initialActionState);
  return (
    <form action={action} className="space-y-4">
      {state?.error ? <Alert tone="error">{state.error}</Alert> : null}
      {state.message ? <Alert tone="success">{state.message}</Alert> : null}
      <div>
        <label htmlFor="password" className="label">Nova senha *</label>
        <input id="password" name="password" type="password" required minLength={8} className="input" autoComplete="new-password" />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="label">Confirmar nova senha *</label>
        <input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} className="input" autoComplete="new-password" />
      </div>
      <p className="hint">Use no mínimo 8 caracteres. A senha é armazenada com hash e nunca é exibida.</p>
      <Submit />
    </form>
  );
}

