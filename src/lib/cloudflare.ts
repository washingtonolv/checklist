import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { PhotoBucket } from "./photo-store";

export interface ImageInfo { format: string; width: number; height: number; }
interface ImageHandle {
  transform(options: Record<string, unknown>): ImageHandle;
  output(options: { format: string; quality: number; anim: boolean }): Promise<{ response(): Response }>;
}
export interface ImageBinding {
  info(stream: ReadableStream<Uint8Array>): Promise<ImageInfo>;
  input(stream: ReadableStream<Uint8Array>): ImageHandle;
}
interface WorkerBindings { PHOTOS_BUCKET?: PhotoBucket; IMAGES?: ImageBinding }
export function requireWorkerBindings(): WorkerBindings {
  // Read from the current request context; never keep bindings or sessions globally.
  const env = getCloudflareContext().env as unknown as WorkerBindings;
  if (!env.PHOTOS_BUCKET || !env.IMAGES) throw new Error("Configure PHOTOS_BUCKET e IMAGES no Worker de teste.");
  return env;
}
