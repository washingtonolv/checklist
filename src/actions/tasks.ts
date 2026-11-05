"use server";

import { revalidatePath } from "next/cache";
import { getBackend } from "@/lib/backend";
import { requireUser } from "@/lib/auth-server";
import { completeTaskSchema, observationSchema } from "@/lib/validation";
import { safeErrorMessage } from "@/lib/utils";
import type { TaskPhoto } from "@/lib/types";
import type { ActionState } from "./state";

function revalidateTask(taskId: string): void {
  revalidatePath(`/atividades/${taskId}`);
  revalidatePath("/atividades");
  revalidatePath("/painel");
  revalidatePath("/historico");
  revalidatePath("/relatorios");
}

export async function startTaskAction(taskId: string): Promise<ActionState> {
  const actor = await requireUser();
  try {
    await getBackend().startTask(actor, taskId);
    revalidateTask(taskId);
    return { ok: true, message: "Atividade iniciada." };
  } catch (error) {
    return { ok: false, error: safeErrorMessage(error) };
  }
}

export async function completeTaskAction(taskId: string, formData: FormData): Promise<ActionState> {
  const actor = await requireUser();
  const parsed = completeTaskSchema.safeParse({
    observation: String(formData.get("observation") ?? "")
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  try {
    await getBackend().completeTask(actor, taskId, parsed.data.observation);
    revalidateTask(taskId);
    return { ok: true, message: "Atividade concluída com sucesso." };
  } catch (error) {
    return { ok: false, error: safeErrorMessage(error) };
  }
}

export async function requestCorrectionAction(taskId: string, note: string): Promise<ActionState> {
  const actor = await requireUser();
  if (note.trim().length < 3) return { ok: false, error: "Descreva o motivo da correção." };
  try {
    await getBackend().requestCorrection(actor, taskId, note.trim());
    revalidateTask(taskId);
    return { ok: true, message: "Correção solicitada ao responsável." };
  } catch (error) {
    return { ok: false, error: safeErrorMessage(error) };
  }
}

export async function rejectTaskAction(taskId: string, note: string): Promise<ActionState> {
  const actor = await requireUser();
  if (note.trim().length < 3) return { ok: false, error: "Descreva o motivo da reprovação." };
  try {
    await getBackend().rejectTask(actor, taskId, note.trim());
    revalidateTask(taskId);
    return { ok: true, message: "Atividade reprovada." };
  } catch (error) {
    return { ok: false, error: safeErrorMessage(error) };
  }
}

export async function approveTaskAction(taskId: string, note: string): Promise<ActionState> {
  const actor = await requireUser();
  try {
    await getBackend().approveTask(actor, taskId, note.trim());
    revalidateTask(taskId);
    return { ok: true, message: "Execução aprovada." };
  } catch (error) {
    return { ok: false, error: safeErrorMessage(error) };
  }
}

export async function reopenTaskAction(taskId: string, note: string): Promise<ActionState> {
  const actor = await requireUser();
  try {
    await getBackend().reopenTask(actor, taskId, note.trim());
    revalidateTask(taskId);
    return { ok: true, message: "Atividade reaberta." };
  } catch (error) {
    return { ok: false, error: safeErrorMessage(error) };
  }
}

export async function addObservationAction(taskId: string, content: string): Promise<ActionState> {
  const actor = await requireUser();
  const parsed = observationSchema.safeParse({ content });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  try {
    await getBackend().addObservation(actor, taskId, parsed.data.content);
    revalidateTask(taskId);
    return { ok: true, message: "Observação registrada." };
  } catch (error) {
    return { ok: false, error: safeErrorMessage(error) };
  }
}

export async function uploadPhotoAction(
  taskId: string,
  formData: FormData
): Promise<ActionState & { photo?: TaskPhoto }> {
  const actor = await requireUser();
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Selecione uma imagem para enviar." };
  }
  const original = formData.get("original");
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    let originalInput: { buffer: Buffer; mimeType: string; sizeBytes: number } | undefined;
    if (original instanceof File && original.size > 0) {
      originalInput = {
        buffer: Buffer.from(await original.arrayBuffer()),
        mimeType: original.type || "image/jpeg",
        sizeBytes: original.size
      };
    }
    const photo = await getBackend().uploadPhoto(actor, taskId, {
      buffer,
      mimeType: file.type || "image/webp",
      originalName: file.name,
      sizeBytes: file.size,
      width: Number(formData.get("width")) || undefined,
      height: Number(formData.get("height")) || undefined,
      original: originalInput
    });
    revalidateTask(taskId);
    return { ok: true, message: "Foto enviada.", photo };
  } catch (error) {
    return { ok: false, error: safeErrorMessage(error, "Não foi possível enviar a foto.") };
  }
}

export async function deletePhotoAction(photoId: string): Promise<ActionState> {
  const actor = await requireUser();
  try {
    await getBackend().deletePhoto(actor, photoId);
    revalidatePath("/atividades");
    revalidatePath("/painel");
    revalidatePath("/relatorios");
    revalidatePath("/historico");
    return { ok: true, message: "Foto removida." };
  } catch (error) {
    return { ok: false, error: safeErrorMessage(error) };
  }
}

