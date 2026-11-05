"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { generateTasksAction } from "@/actions/templates";

export function GenerateTasksButton() {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      className="btn-ghost btn-sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await generateTasksAction();
          if (result.ok) {
            toast.success(result.message ?? "Atividades geradas.");
            router.refresh();
          } else {
            toast.error(result.error ?? "Não foi possível gerar as atividades.");
          }
        })
      }
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
      Gerar tarefas
    </button>
  );
}

