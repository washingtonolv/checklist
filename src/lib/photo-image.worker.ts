import { requireWorkerBindings, type ImageBinding } from "./cloudflare";
import type { UploadPhotoInput } from "./types";

function stream(bytes: Uint8Array): ReadableStream<Uint8Array> {
  return new ReadableStream({ start(controller) { controller.enqueue(bytes); controller.close(); } });
}
export async function transformWorkerImage(bytes: Uint8Array, avatar = false, images?: ImageBinding) {
  if (!bytes.length || bytes.length > (avatar ? 5 : 10) * 1024 * 1024) throw new Error("Imagem excede o limite de tamanho.");
  const IMAGES = images ?? requireWorkerBindings().IMAGES!;
  const info = await IMAGES!.info(stream(bytes));
  if (!["image/jpeg", "image/png", "image/webp"].includes(info.format) ||
      !Number.isInteger(info.width) || !Number.isInteger(info.height) || info.width < 1 || info.height < 1 || info.width * info.height > 24000000) {
    throw new Error("Imagem inválida. Envie JPEG, PNG ou WebP de até 24 milhões de pixels.");
  }
  const size = avatar ? 96 : 1600;
  const response = (await IMAGES!.input(stream(bytes)).transform({ width: size, height: size, fit: avatar ? "cover" : "scale-down", metadata: "none" })
    .output({ format: "image/webp", quality: avatar ? 55 : 65, anim: false })).response();
  if (!response.ok) throw new Error("Não foi possível otimizar a imagem.");
  const buffer = Buffer.from(await response.arrayBuffer());
  if (!buffer.length || buffer.length > (avatar ? 8000 : 1024 * 1024)) throw new Error("Imagem otimizada excede o limite.");
  const result = await IMAGES!.info(stream(buffer));
  if (result.format !== "image/webp" || result.width > size || result.height > size) throw new Error("Resposta de imagem inválida.");
  return { buffer, sizeBytes: buffer.length, mimeType: "image/webp", width: result.width, height: result.height };
}
export function optimizePhoto(input: UploadPhotoInput) { return transformWorkerImage(input.buffer); }
export async function optimizeAvatar(bytes: Buffer) { return (await transformWorkerImage(bytes, true)).buffer; }
