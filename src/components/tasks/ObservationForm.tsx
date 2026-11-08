"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageSquarePlus } from "@/components/ui/illustrated-icons";
import { toast } from "sonner";
import { addObservationAction } from "@/actions/tasks";

export function ObservationForm({ taskId }: { taskId: string }) {
  const [content, setContent] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function submit() {
    if (content.trim().length < 2) {
      toast.error("Escreva uma observação.");
      return;
    }
    startTransition(async () => {
      const result = await addObservationAction(taskId, content);
      if (result.ok) {
        toast.success(result.message ?? "Observação registrada.");
        setContent("");
        router.refresh();
      } else {
        toast.error(result.error ?? "Não foi possível registrar a observação.");
      }
    });
  }

  return (
    <div className="space-y-2">
      <label htmlFor="observation" className="label">
        Nova observação
      </label>
      <textarea
        id="observation"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows={3}
        className="input resize-y"
        placeholder="Registre uma orientação, pendência ou acompanhamento..."
      />
      <button type="button" className="btn-ghost btn-sm" onClick={submit} disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquarePlus className="h-4 w-4" />}
        {pending ? "Registrando..." : "Registrar observação"}
      </button>
    </div>
  );
}

