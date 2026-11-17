"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-server";
import { getBackend } from "@/lib/backend";
import { safeErrorMessage } from "@/lib/utils";
import { z } from "zod";
import type { ActionState } from "./state";
const mutation = z.object({ id: z.string().uuid(), kind: z.enum(["template", "category"]), operation: z.enum(["archive", "restore", "delete"]), confirmed: z.literal("yes") });
export async function manageRecordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireAdmin();
  const parsed = mutation.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: "Confirme a ação e tente novamente." };
  const { id, kind, operation } = parsed.data;
  try {
    const backend = getBackend();
    if (operation === "delete") {
      if (kind === "template") await backend.deleteTemplate(actor, id);
      else await backend.deleteCategory(actor, id);
    } else if (kind === "template") await backend.setTemplateActive(actor, id, operation === "restore");
    else await backend.setCategoryActive(actor, id, operation === "restore");
  } catch (error) {
    return { ok: false, error: safeErrorMessage(error, "Não foi possível concluir a ação.") };
  }
  for (const path of ["/gerenciamento-tarefas", "/modelos", "/categorias", "/atividades", "/painel"]) revalidatePath(path);
  return { ok: true, message: operation === "delete" ? "Registro excluído." : operation === "archive" ? "Registro arquivado." : "Registro restaurado." };
}
