// Local-only runtime harness. Never configured as the app Worker entrypoint.
import { transformWorkerImage } from "../../src/lib/photo-image.worker";
import { bindingPhotoStore, type PhotoBucket } from "../../src/lib/photo-store";
import type { ImageBinding } from "../../src/lib/cloudflare";
export default {
  async fetch(request: Request, env: { IMAGES: ImageBinding; PHOTOS_BUCKET: PhotoBucket }) {
    if (request.method !== "POST") return new Response("local fixture");
    try {
      const image = await transformWorkerImage(new Uint8Array(await request.arrayBuffer()), new URL(request.url).pathname === "/avatar", env.IMAGES);
      const store = bindingPhotoStore(env.PHOTOS_BUCKET);
      const key = "lojas/11111111-1111-1111-1111-111111111111/2026/11/12/22222222-2222-2222-2222-222222222222/33333333-3333-3333-3333-333333333333.webp";
      await store.put(key, image.buffer);
      const response = await store.get(key);
      if (!response || (await response.arrayBuffer()).byteLength !== image.sizeBytes) throw new Error("R2 roundtrip failed");
      await store.delete(key);
      if (await store.get(key)) throw new Error("R2 delete failed");
      return Response.json({ width: image.width, height: image.height, mimeType: image.mimeType, sizeBytes: image.sizeBytes });
    } catch (error) { return Response.json({ error: String(error) }, { status: 400 }); }
  }
};
