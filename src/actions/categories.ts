"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getBackend } from "@/lib/backend";
import { requireAdmin } from "@/lib/auth-server";
import { categorySchema, formString, parseBoolean } from "@/lib/validation";
import { safeErrorMessage } from "@/lib/utils";
import type { ActionState } from "./state";

function zodMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Dados inválidos.";
}

export async function saveCategoryAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireAdmin();
  const id = formString(formData.get("id"));
  const parsed = categorySchema.safeParse({
    name: formString(formData.get("name")),
    description: formString(formData.get("description")),
    active: parseBoolean(formData.get("active")),
    sortOrder: formString(formData.get("sortOrder")) || "0"
  });
  if (!parsed.success) return { ok: false, error: zodMessage(parsed.error) };
  try {
    const backend = getBackend();
    if (id) await backend.updateCategory(actor, id, parsed.data);
    else await backend.createCategory(actor, parsed.data);
  } catch (error) {
    return { ok: false, error: safeErrorMessage(error, "Não foi possível salvar a categoria.") };
  }
  revalidatePath("/categorias");
  revalidatePath("/gerenciamento-tarefas");
  revalidatePath("/modelos");
  redirect(`/gerenciamento-tarefas?aba=modelos&categorias=abertas&sucesso=${encodeURIComponent(id ? "Categoria atualizada." : "Categoria criada.")}`);
}


export async function createInlineCategoryAction(formData: FormData): Promise<{ category?: import("@/lib/types").Category; error?: string }> {
  const actor = await requireAdmin();
  const parsed = categorySchema.safeParse({ name: formString(formData.get("name")), description: "", active: true, sortOrder: 0 });
  if (!parsed.success) return { error: zodMessage(parsed.error) };
  try {
    const category = await getBackend().createCategory(actor, parsed.data);
    revalidatePath("/gerenciamento-tarefas");
    return { category };
  } catch (error) {
    return { error: safeErrorMessage(error, "Não foi possível criar a categoria.") };
  }
}
