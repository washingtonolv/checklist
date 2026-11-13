"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, Trash2, X, ZoomIn } from "@/components/ui/illustrated-icons";
import { toast } from "sonner";
import { deletePhotoAction } from "@/actions/tasks";
import type { TaskPhoto } from "@/lib/types";
import { formatDateTime } from "@/lib/dates";
import { cn, formatBytes } from "@/lib/utils";

export function PhotoGallery({
  photos,
  canDelete = false,
  columns = 3,
  emptyMessage = "Nenhuma foto anexada."
}: {
  photos: TaskPhoto[];
  canDelete?: boolean;
  columns?: 2 | 3 | 4;
  emptyMessage?: string;
}) {
  const [selected, setSelected] = useState<TaskPhoto | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (!photos.length) {
    return <p className="text-sm text-ink/70">{emptyMessage}</p>;
  }

  const grid = {
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-4"
  }[columns];

  function remove(photo: TaskPhoto) {
    if (!window.confirm("Remover esta evidência? A ação será registrada na auditoria.")) return;
    startTransition(async () => {
      const result = await deletePhotoAction(photo.id);
      if (result.ok) {
        toast.success(result.message ?? "Foto removida.");
        setSelected(null);
        router.refresh();
      } else {
        toast.error(result.error ?? "Não foi possível remover a foto.");
      }
    });
  }

  return (
    <>
      <div className={cn("grid gap-3", grid)}>
        {photos.map((photo) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setSelected(photo)}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-ink/10 bg-turquesa/5 text-left"
          >
            {photo.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo.url}
                alt={`Evidência de ${formatDateTime(photo.createdAt)}`}
                loading="lazy"
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
              />
            ) : (
              <span className="flex h-full items-center justify-center text-xs text-ink/70">{photo.expired ? "Evidência expirada" : "Prévia indisponível"}</span>
            )}
            <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-pink/80 to-transparent px-2.5 pb-2 pt-6 text-[10px] font-semibold text-white">
              <span className="truncate">{photo.isOriginal ? "Original" : "Otimizada"}</span>
              <ZoomIn className="h-3.5 w-3.5" />
            </span>
          </button>
        ))}
      </div>

      {selected ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-pink/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Visualização da evidência"
          onClick={() => setSelected(null)}
        >
          <div className="max-h-[92vh] w-full max-w-4xl overflow-auto rounded-2xl bg-surface shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-3 border-b border-ink/10 px-4 py-3">
              <div>
                <p className="text-sm font-bold text-ink">Evidência fotográfica</p>
                <p className="text-[11px] text-ink/70">
                  {formatDateTime(selected.createdAt)} · {formatBytes(selected.sizeBytes)} · {selected.uploadedByName}
                </p>
              </div>
              <button
                type="button"
                className="rounded-lg p-2 text-ink/70 hover:bg-pink/5 hover:text-ink"
                onClick={() => setSelected(null)}
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="bg-turquesa/5 p-3">
              {selected.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selected.url} alt="Evidência ampliada" className="mx-auto max-h-[68vh] w-auto rounded-xl object-contain" />
              ) : (
                <p className="p-10 text-center text-sm text-ink/70">{selected.expired ? "Evidência expirada." : "Prévia indisponível."}</p>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 px-4 py-3">
              {selected.url ? (
                <a href={selected.url} target="_blank" rel="noreferrer" className="btn-ghost btn-sm">
                  <Download className="h-4 w-4" />
                  Abrir original
                </a>
              ) : null}
              {canDelete ? (
                <button type="button" className="btn-danger btn-sm" onClick={() => remove(selected)} disabled={pending}>
                  <Trash2 className="h-4 w-4" />
                  {pending ? "Removendo..." : "Remover evidência"}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

