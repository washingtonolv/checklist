"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, ImagePlus, Loader2, Trash2, UploadCloud } from "@/components/ui/material-icons";
import { toast } from "sonner";
import { uploadPhotoAction } from "@/actions/tasks";
import { compressImage, type CompressedImage } from "@/lib/image-client";
import { MAX_PHOTO_MB, MAX_PHOTOS_PER_TASK } from "@/lib/constants";
import { formatBytes } from "@/lib/utils";

interface Preview {
  compressed: CompressedImage;
  previewUrl: string;
}

export function PhotoUploader({
  taskId,
  photoCount,
  required
}: {
  taskId: string;
  photoCount: number;
  required: boolean;
}) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const remaining = Math.max(0, MAX_PHOTOS_PER_TASK - photoCount);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    setError("");
    const files = Array.from(fileList).slice(0, remaining);
    if (!files.length) {
      setError(`Limite de ${MAX_PHOTOS_PER_TASK} fotos por atividade atingido.`);
      return;
    }
    try {
      const next: Preview[] = [];
      for (const file of files) {
        if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
          throw new Error(`${file.name}: a imagem ultrapassa ${MAX_PHOTO_MB} MB.`);
        }
        const compressed = await compressImage(file);
        next.push({ compressed, previewUrl: URL.createObjectURL(compressed.file) });
      }
      setPreviews((current) => [...current, ...next]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível preparar a imagem.");
    } finally {
      if (cameraRef.current) cameraRef.current.value = "";
      if (galleryRef.current) galleryRef.current.value = "";
    }
  }

  function removePreview(index: number) {
    setPreviews((current) => {
      const copy = [...current];
      URL.revokeObjectURL(copy[index].previewUrl);
      copy.splice(index, 1);
      return copy;
    });
  }

  async function uploadAll() {
    if (!previews.length) return;
    setUploading(true);
    setError("");
    let success = 0;
    try {
      for (const preview of previews) {
        const formData = new FormData();
        formData.set("photo", preview.compressed.file);
        formData.set("width", String(preview.compressed.width));
        formData.set("height", String(preview.compressed.height));
        if (process.env.NEXT_PUBLIC_PRESERVE_ORIGINALS === "true") {
          formData.set("original", preview.compressed.original);
        }
        const result = await uploadPhotoAction(taskId, formData);
        if (!result.ok) {
          toast.error(result.error ?? "Falha ao enviar a foto.");
        } else {
          success += 1;
        }
      }
      if (success > 0) {
        toast.success(`${success} foto(s) enviada(s) com sucesso.`);
        previews.forEach((preview) => URL.revokeObjectURL(preview.previewUrl));
        setPreviews([]);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar as fotos.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold text-ink/65">
          {photoCount} de {MAX_PHOTOS_PER_TASK} fotos · limite {MAX_PHOTO_MB} MB por imagem
        </p>
        {required && photoCount === 0 ? (
          <span className="badge border border-ink bg-pink/5 text-ink">Foto obrigatória</span>
        ) : null}
      </div>

      {remaining > 0 ? (
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-secondary btn-sm" onClick={() => cameraRef.current?.click()} disabled={uploading}>
            <Camera className="h-4 w-4" />
            Tirar foto
          </button>
          <button type="button" className="btn-ghost btn-sm" onClick={() => galleryRef.current?.click()} disabled={uploading}>
            <ImagePlus className="h-4 w-4" />
            Escolher da galeria
          </button>
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(event) => handleFiles(event.target.files)}
          />
          <input
            ref={galleryRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => handleFiles(event.target.files)}
          />
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-ink/20 px-3 py-2 text-xs text-ink/70">
          Limite de fotos atingido para esta atividade.
        </p>
      )}

      {error ? <p className="rounded-lg border border-ink/30 bg-pink/5 px-3 py-2 text-xs text-ink">{error}</p> : null}

      {previews.length ? (
        <div className="space-y-3 rounded-xl border border-ink/10 bg-turquesa/5 p-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {previews.map((preview, index) => (
              <div key={preview.previewUrl} className="group relative overflow-hidden rounded-lg border border-ink/10 bg-surface">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview.previewUrl} alt="Prévia da foto" className="aspect-[4/3] w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePreview(index)}
                  className="absolute right-1 top-1 rounded-full bg-surface/90 p-1 text-ink shadow hover:bg-pink hover:text-white"
                  aria-label="Remover prévia"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <p className="truncate px-2 py-1 text-[10px] text-ink/70">{formatBytes(preview.compressed.file.size)}</p>
              </div>
            ))}
          </div>
          <button type="button" className="btn-primary btn-sm w-full" onClick={uploadAll} disabled={uploading}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
            {uploading ? "Enviando evidências..." : `Enviar ${previews.length} foto(s)`}
          </button>
        </div>
      ) : null}
    </div>
  );
}

