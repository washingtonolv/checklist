import { AwsClient } from "aws4fetch";
import { requireWorkerBindings } from "./cloudflare";

export const RETENTION_MS = 90 * 24 * 60 * 60 * 1000;
export function photoExpired(createdAt: string, now = Date.now()): boolean {
  const created = Date.parse(createdAt);
  return !Number.isFinite(created) || now >= created + RETENTION_MS;
}

export interface PhotoObjectStore {
  put(key: string, bytes: Uint8Array): Promise<void>;
  get(key: string): Promise<Response | null>;
  delete(key: string): Promise<void>;
}

// Structural interface also permits a Workers R2 binding without Node dependencies.
export interface PhotoBucket {
  put(key: string, bytes: Uint8Array, options: { httpMetadata: { contentType: string } }): Promise<unknown>;
  get(key: string): Promise<{ body: ReadableStream } | null>;
  delete(key: string): Promise<void>;
}
export function bindingPhotoStore(bucket: PhotoBucket): PhotoObjectStore {
  return {
    async put(key, bytes) { await bucket.put(key, bytes, { httpMetadata: { contentType: "image/webp" } }); },
    async get(key) { const obj = await bucket.get(key); return obj ? new Response(obj.body) : null; },
    async delete(key) { await bucket.delete(key); }
  };
}

export function assertPhotoEnvironment(): void {
  if (!["cloudflare-preview", "cloudflare"].includes(process.env.PHOTO_ENV ?? "") || process.env.VERCEL_ENV) {
    throw new Error("Fotos R2 disponíveis somente no ambiente Cloudflare autorizado.");
  }
  const expected = process.env.PHOTO_ENV === "cloudflare" ? process.env.SUPABASE_ALLOWED_URL : process.env.PREVIEW_SUPABASE_URL;
  if (!expected || expected !== process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Configure e confira o destino Supabase autorizado.");
  }
}

export function createPhotoObjectStore(): PhotoObjectStore {
  assertPhotoEnvironment();
  if (process.env.CLOUDFLARE_WORKERS === "true") {
    return bindingPhotoStore(requireWorkerBindings().PHOTOS_BUCKET!);
  }
  const { R2_ACCOUNT_ID: account, R2_BUCKET: bucket, R2_ACCESS_KEY_ID: accessKeyId, R2_SECRET_ACCESS_KEY: secretAccessKey } = process.env;
  if (!account || !/^[a-f0-9]{32}$/.test(account) || !bucket || !/^[a-z0-9-]+$/.test(bucket) || !accessKeyId || !secretAccessKey) {
    throw new Error("Configure o bucket R2 privado de teste e suas credenciais de servidor.");
  }
  const client = new AwsClient({ accessKeyId, secretAccessKey, service: "s3", region: "auto", retries: 2 });
  async function request(key: string, method: string, bytes?: Uint8Array) {
    if (!/^lojas\/[a-f0-9-]+\/\d{4}\/\d{2}\/\d{2}\/[a-f0-9-]+\/[a-f0-9-]+\.webp$/.test(key)) throw new Error("Chave R2 inválida.");
    const url = `https://${account}.r2.cloudflarestorage.com/${bucket}/${key}`;
    const response = await client.fetch(url, {
      method, body: bytes, headers: method === "PUT" ? { "Content-Type": "image/webp" } : {},
      cache: "no-store", signal: AbortSignal.timeout(30000)
    });
    if (method === "GET" && response.status === 404) return null;
    if (!response.ok) throw new Error(`Falha R2 (${response.status}).`);
    return response;
  }
  return {
    async put(key, bytes) { await request(key, "PUT", bytes); },
    get(key) { return request(key, "GET"); },
    async delete(key) { await request(key, "DELETE"); }
  };
}
