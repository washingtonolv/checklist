"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Play,
  RotateCcw,
  Send,
  ThumbsUp,
  XCircle
} from "@/components/ui/material-icons";
import { toast } from "sonner";
import {
  approveTaskAction,
  completeTaskAction,
  rejectTaskAction,
  reopenTaskAction,
  requestCorrectionAction,
  startTaskAction
} from "@/actions/tasks";
import type { TaskStatus } from "@/lib/types";
import { Alert } from "@/components/ui";

type Mode = "complete" | "correction" | "reject" | "approve" | "reopen" | null;

export function TaskActions({
  taskId,
  status,
  photoCount,
  photoRequired,
  canReview,
  approved
}: {
  taskId: string;
  status: TaskStatus;
  photoCount: number;
  photoRequired: boolean;
  canReview: boolean;
  approved: boolean;
}) {
  const [mode, setMode] = useState<Mode>(null);
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const needsPhoto = photoRequired && photoCount === 0;

  function run(action: () => Promise<{ ok: boolean; error?: string; message?: string }>) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast.success(result.message ?? "Ação concluída.");
        setMode(null);
        setNote("");
        router.refresh();
      } else {
        toast.error(result.error ?? "Não foi possível concluir a ação.");
      }
    });
  }

  function complete() {
    const formData = new FormData();
    formData.set("observation", note);
    run(() => completeTaskAction(taskId, formData));
  }

  function submitReview() {
    if (mode === "correction") run(() => requestCorrectionAction(taskId, note));
    if (mode === "reject") run(() => rejectTaskAction(taskId, note));
    if (mode === "approve") run(() => approveTaskAction(taskId, note));
    if (mode === "reopen") run(() => reopenTaskAction(taskId, note));
  }

  const noteLabel =
    mode === "correction"
      ? "Descreva o que precisa ser corrigido"
      : mode === "reject"
        ? "Motivo da reprovação"
        : mode === "approve"
          ? "Comentário da aprovação (opcional)"
          : "Observação da reabertura (opcional)";

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold">{status === "completed" ? approved ? "3 de 3 · Revisão concluída" : "2 de 3 · Aguardando revisão" : "1 de 3 · Executar e anexar evidências"}</p>
      {status !== "completed" ? (
        <>
          {status === "pending" ? (
            <button
              type="button"
              className="btn-secondary w-full"
              onClick={() => run(() => startTaskAction(taskId))}
              disabled={pending}
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Iniciar atividade
            </button>
          ) : null}
          <button
            type="button"
            className={mode ? "btn-secondary w-full" : "btn-primary w-full"}
            onClick={() => setMode(mode === "complete" ? null : "complete")}
            disabled={pending || needsPhoto}
          >
            <CheckCircle2 className="h-4 w-4" />
            Concluir atividade
          </button>
          {needsPhoto ? (
            <Alert tone="error">
              Esta atividade exige pelo menos uma foto. A conclusão ficará bloqueada até o envio da evidência.
            </Alert>
          ) : null}
        </>
      ) : (
        <div className="rounded-xl border border-ink/15 bg-turquesa/5 p-3">
          <p className="flex items-center gap-2 text-sm font-bold text-ink">
            <CheckCircle2 className="h-4 w-4" />
            Atividade concluída
          </p>
          <p className="mt-1 text-xs text-ink/70">
            {approved ? "Execução aprovada pela supervisão." : "Aguardando revisão da supervisão."}
          </p>
        </div>
      )}

      {canReview && status !== "pending" ? (
        <div className="space-y-2 border-t border-ink/10 pt-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-ink/70">Revisão da supervisão</p>
          <div className="grid grid-cols-2 gap-2">
            {status === "completed" && !approved ? (
              <button type="button" className="btn-secondary btn-sm" onClick={() => setMode(mode === "approve" ? null : "approve")} disabled={pending}>
                <ThumbsUp className="h-4 w-4" />
                Aprovar
              </button>
            ) : null}
            {status === "completed" ? (
              <button type="button" className="btn-ghost btn-sm" onClick={() => setMode(mode === "correction" ? null : "correction")} disabled={pending}>
                <RotateCcw className="h-4 w-4" />
                Correção
              </button>
            ) : null}
            {status === "completed" ? (
              <button type="button" className="btn-danger btn-sm" onClick={() => setMode(mode === "reject" ? null : "reject")} disabled={pending}>
                <XCircle className="h-4 w-4" />
                Reprovar
              </button>
            ) : null}
            <button type="button" className="btn-ghost btn-sm" onClick={() => setMode(mode === "reopen" ? null : "reopen")} disabled={pending}>
              <RotateCcw className="h-4 w-4" />
              Reabrir
            </button>
          </div>
        </div>
      ) : null}

      {mode ? (
        <div className="rounded-xl border border-turquesa bg-turquesa/5 p-3">
          <label className="label" htmlFor="task-action-note">
            {mode === "complete" ? "Observação da conclusão (opcional)" : noteLabel}
          </label>
          <textarea
            id="task-action-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            className="input resize-y"
            placeholder={mode === "complete" ? "Descreva como a atividade foi executada..." : "Escreva o motivo..."}
          />
          {mode === "complete" ? (
            <button type="button" className="btn-primary mt-2 w-full" onClick={complete} disabled={pending || needsPhoto}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {pending ? "Concluindo..." : needsPhoto ? "Anexe a foto obrigatória" : "Confirmar conclusão"}
            </button>
          ) : (
            <div className="mt-2 flex gap-2">
              <button type="button" className="btn-ghost btn-sm flex-1" onClick={() => setMode(null)} disabled={pending}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn-primary btn-sm flex-1"
                onClick={submitReview}
                disabled={pending || ((mode === "correction" || mode === "reject") && note.trim().length < 3)}
              >
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Confirmar
              </button>
            </div>
          )}
        </div>
      ) : null}

      {canReview && status === "pending" ? (
        <p className="flex items-start gap-2 rounded-xl border border-dashed border-ink/20 p-3 text-xs text-ink/70">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          A revisão fica disponível após a execução da atividade pela loja.
        </p>
      ) : null}
    </div>
  );
}

