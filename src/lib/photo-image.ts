import sharp from "sharp";
import type { UploadPhotoInput } from "./types";

export async function optimizePhoto(input: UploadPhotoInput) {
  // Trust decoded bytes, never client dimensions, MIME, or size.
  if (!input.buffer.length || input.buffer.length > 10 * 1024 * 1024) throw new Error("Limite de imagem: 10 MB.");
  const image = sharp(input.buffer, { limitInputPixels: 24000000, animated: false, failOn: "warning" });
  const metadata = await image.metadata();
  if (!["jpeg", "png", "webp"].includes(metadata.format ?? "") || (metadata.pages ?? 1) > 1) throw new Error("Imagem inválida. Envie JPEG, PNG ou WebP estático.");
  const { data, info } = await image.rotate().resize(1600, 1600, { fit: "inside", withoutEnlargement: true }).webp({ quality: 65 }).toBuffer({ resolveWithObject: true });
  if (data.length > 1024 * 1024) throw new Error("Imagem otimizada excede 1 MB.");
  return { buffer: data, sizeBytes: data.length, mimeType: "image/webp", width: info.width, height: info.height };
}
