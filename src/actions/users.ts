"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getBackend } from "@/lib/backend";
import { requireAdmin } from "@/lib/auth-server";
import {
  formString,
  formStringArray,
  parseBoolean,
  userCreateSchema,
  userUpdateSchema
} from "@/lib/validation";
import { safeErrorMessage } from "@/lib/utils";
import type { ActionState } from "./state";

function zodMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Dados inválidos.";
}

export async function saveUserAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireAdmin();
  const id = formString(formData.get("id"));
  const raw = {
    name: formString(formData.get("name")),
    email: formString(formData.get("email")),
    password: formString(formData.get("password")),
    role: formString(formData.get("role")),
    active: parseBoolean(formData.get("active")),
    storeIds: formStringArray(formData, "storeIds")
  };
  const parsed = id
    ? userUpdateSchema.safeParse({ ...raw, password: raw.password || undefined })
    : userCreateSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: zodMessage(parsed.error) };
  try {
    const backend = getBackend();
    if (id) {
      await backend.updateUser(actor, id, parsed.data);
    } else {
      if (!parsed.data.password) return { ok: false, error: "Informe a senha inicial." };
      await backend.createUser(actor, parsed.data);
    }
  } catch (error) {
    return { ok: false, error: safeErrorMessage(error, "Não foi possível salvar o usuário.") };
  }
  revalidatePath("/usuarios");
  revalidatePath("/lojas");
  redirect(`/usuarios?sucesso=${encodeURIComponent(id ? "Usuário atualizado com sucesso." : "Usuário cadastrado com sucesso.")}`);
}

