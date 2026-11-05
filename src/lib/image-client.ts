"use client";

export interface CompressedImage {
  file: File;
  original: File;
  width: number;
  height: number;
}

const MAX_SOURCE_MB = 20;
const MAX_DIMENSION = 1600;
const QUALITY = 0.82;

async function loadBitmap(file: File): Promise<{ width: number; height: number; draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void; close: () => void }> {
  if ("createImageBitmap" in window) {
    const bitmap = await createImageBitmap(file);
    return {
      width: bitmap.width,
      height: bitmap.height,
      draw: (ctx, w, h) => ctx.drawImage(bitmap, 0, 0, w, h),
      close: () => bitmap.close()
    };
  }
  const url = URL.createObjectURL(file);
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    img.src = url;
  });
  return {
    width: image.naturalWidth,
    height: image.naturalHeight,
    draw: (ctx, w, h) => ctx.drawImage(image, 0, 0, w, h),
    close: () => URL.revokeObjectURL(url)
  };
}

export async function compressImage(file: File): Promise<CompressedImage> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Selecione um arquivo de imagem.");
  }
  if (file.size > MAX_SOURCE_MB * 1024 * 1024) {
    throw new Error(`A imagem original ultrapassa ${MAX_SOURCE_MB} MB.`);
  }
  const bitmap = await loadBitmap(file);
  try {
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Seu navegador não suporta o processamento de imagens.");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    bitmap.draw(ctx, width, height);
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((value) => resolve(value), "image/webp", QUALITY);
    });
    if (!blob) throw new Error("Não foi possível otimizar a imagem.");
    const name = file.name.replace(/\.[^.]+$/, "") || "evidencia";
    const optimized = new File([blob], `${name}.webp`, { type: "image/webp", lastModified: Date.now() });
    return { file: optimized, original: file, width, height };
  } finally {
    bitmap.close();
  }
}

