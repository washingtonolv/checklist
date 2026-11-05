"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getBackend, isLocalMode } from "@/lib/backend";
import { loginSchema, newPasswordSchema, resetRequestSchema } from "@/lib/validation";
import { safeErrorMessage } from "@/lib/utils";
import type { ActionState } from "./state";

function zodMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Dados inválidos.";
}

function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/painel";
}

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });
  if (!parsed.success) return { ok: false, error: zodMessage(parsed.error) };
  try {
    await getBackend().auth.signIn(parsed.data.email, parsed.data.password);
  } catch (error) {
    return { ok: false, error: safeErrorMessage(error, "E-mail ou senha inválidos.") };
  }
  redirect(safeNext(formData.get("next")));
}

export async function logoutAction(): Promise<void> {
  await getBackend().auth.signOut();
  redirect("/login");
}

export async function requestPasswordResetAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = resetRequestSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { ok: false, error: zodMessage(parsed.error) };
  try {
    const result = await getBackend().auth.requestPasswordReset(parsed.data.email);
    return {
      ok: true,
      message: isLocalMode()
        ? "Solicitação registrada. No modo local, use o link abaixo para redefinir a senha."
        : "Se o e-mail estiver cadastrado, enviaremos as instruções de recuperação.",
      resetUrl: result.resetUrl
    };
  } catch (error) {
    return { ok: false, error: safeErrorMessage(error, "Não foi possível solicitar a recuperação.") };
  }
}

export async function resetPasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = newPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword")
  });
  if (!parsed.success) return { ok: false, error: zodMessage(parsed.error) };
  const token = String(formData.get("token") ?? "");
  try {
    if (isLocalMode()) {
      if (!token) return { ok: false, error: "Link de recuperação inválido." };
      await getBackend().auth.resetPasswordWithToken(token, parsed.data.password);
    } else {
      await getBackend().auth.updatePassword(parsed.data.password);
    }
    return { ok: true, message: "Senha atualizada. Você já pode entrar com a nova senha." };
  } catch (error) {
    return { ok: false, error: safeErrorMessage(error, "Não foi possível atualizar a senha.") };
  }
}

export async function updatePasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = newPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword")
  });
  if (!parsed.success) return { ok: false, error: zodMessage(parsed.error) };
  try {
    await getBackend().auth.updatePassword(parsed.data.password);
    return { ok: true, message: "Senha atualizada com sucesso." };
  } catch (error) {
    return { ok: false, error: safeErrorMessage(error, "Não foi possível atualizar a senha.") };
  }
}

