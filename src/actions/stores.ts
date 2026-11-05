"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getBackend } from "@/lib/backend";
import { requireAdmin } from "@/lib/auth-server";
import { formString, formStringArray, parseBoolean, storeSchema } from "@/lib/validation";
import { safeErrorMessage } from "@/lib/utils";
import type { ActionState } from "./state";

function zodMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Dados inválidos.";
}

export async function saveStoreAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireAdmin();
  const id = formString(formData.get("id"));
  const parsed = storeSchema.safeParse({
    name: formString(formData.get("name")),
    code: formString(formData.get("code")),
    managerId: formString(formData.get("managerId")) || null,
    supervisorIds: formStringArray(formData, "supervisorIds"),
    active: parseBoolean(formData.get("active"))
  });
  if (!parsed.success) return { ok: false, error: zodMessage(parsed.error) };
  try {
    const backend = getBackend();
    if (id) {
      await backend.updateStore(actor, id, parsed.data);
    } else {
      await backend.createStore(actor, parsed.data);
    }
  } catch (error) {
    return { ok: false, error: safeErrorMessage(error, "Não foi possível salvar a loja.") };
  }
  revalidatePath("/lojas");
  revalidatePath("/painel");
  revalidatePath("/usuarios");
  redirect(`/lojas?sucesso=${encodeURIComponent(id ? "Loja atualizada com sucesso." : "Loja cadastrada com sucesso.")}`);
}

