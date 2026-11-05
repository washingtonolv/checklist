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
  templateSchema
} from "@/lib/validation";
import { safeErrorMessage } from "@/lib/utils";
import type { ActionState } from "./state";

function zodMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Dados inválidos.";
}

export async function saveTemplateAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireAdmin();
  const id = formString(formData.get("id"));
  const parsed = templateSchema.safeParse({
    title: formString(formData.get("title")),
    description: formString(formData.get("description")),
    categoryId: formString(formData.get("categoryId")),
    recurrence: formString(formData.get("recurrence")),
    dueTime: formString(formData.get("dueTime")) || "18:00",
    onceDueDate: formString(formData.get("onceDueDate")) || null,
    photoRequirement: formString(formData.get("photoRequirement")),
    active: parseBoolean(formData.get("active")),
    storeIds: formStringArray(formData, "storeIds")
  });
  if (!parsed.success) return { ok: false, error: zodMessage(parsed.error) };
  try {
    const backend = getBackend();
    const input = { ...parsed.data, onceDueDate: parsed.data.onceDueDate ?? null };
    if (id) await backend.updateTemplate(actor, id, input);
    else await backend.createTemplate(actor, input);
  } catch (error) {
    return { ok: false, error: safeErrorMessage(error, "Não foi possível salvar o modelo de tarefa.") };
  }
  revalidatePath("/modelos");
  revalidatePath("/atividades");
  revalidatePath("/painel");
  redirect(`/modelos?sucesso=${encodeURIComponent(id ? "Modelo atualizado." : "Modelo criado.")}`);
}

export async function generateTasksAction(): Promise<ActionState> {
  const actor = await requireAdmin();
  try {
    const created = await getBackend().ensureGenerated(actor);
    revalidatePath("/atividades");
    revalidatePath("/painel");
    return {
      ok: true,
      message: created > 0 ? `${created} atividade(s) gerada(s).` : "Nenhuma atividade nova para gerar agora."
    };
  } catch (error) {
    return { ok: false, error: safeErrorMessage(error, "Não foi possível gerar as atividades.") };
  }
}

