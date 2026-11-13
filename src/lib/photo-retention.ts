import { createSupabaseAdminClient } from "./supabase/admin";
import { assertPhotoEnvironment, createPhotoObjectStore, RETENTION_MS } from "./photo-store";

export async function expirePhotos(now = Date.now()) {
  assertPhotoEnvironment();
  const db = createSupabaseAdminClient();
  const store = createPhotoObjectStore();
  // Bounded batches; subsequent invocations resume unprocessed rows.
  const { data, error } = await db.from("r2_task_photos").select("id,storage_path")
    .is("expired_at", null).lte("created_at", new Date(now - RETENTION_MS).toISOString()).order("created_at").limit(200);
  if (error) throw error;
  let expired = 0;
  for (const photo of data ?? []) {
    await store.delete(photo.storage_path); // R2 DELETE is idempotent, including lifecycle deletions.
    const result = await db.rpc("expire_r2_photo", { p_id: photo.id });
    if (result.error) throw result.error;
    expired++;
  }
  return expired;
}
