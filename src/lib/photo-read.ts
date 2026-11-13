import { assertStoreAccess } from "./access";
import type { SessionUser } from "./types";
import { createSupabaseServerClient } from "./supabase/server";
import { createPhotoObjectStore, photoExpired } from "./photo-store";

export async function readPhoto(actor: SessionUser, id: string): Promise<Response> {
  const headers = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };
  const db = createSupabaseServerClient();
  const { data: photo, error } = await db.from("task_photos")
    .select("storage_path,created_at,task:task_instances!task_photos_task_id_fkey(store_id)").eq("id", id).maybeSingle();
  if (error) throw new Error("Falha ao consultar evidência.");
  if (!photo) return new Response(null, { status: 404, headers });
  const task = Array.isArray(photo.task) ? photo.task[0] : photo.task;
  if (!task) return new Response(null, { status: 404, headers });
  assertStoreAccess(actor, task.store_id);
  if (photoExpired(photo.created_at)) return new Response("Evidência expirada", { status: 410, headers });
  const object = await createPhotoObjectStore().get(photo.storage_path);
  if (!object) return new Response(null, { status: 404, headers });
  return new Response(object.body, { headers: { ...headers, "Content-Type": "image/webp", "Content-Disposition": "inline" } });
}
