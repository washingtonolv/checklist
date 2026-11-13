import { createSupabaseBackend } from "@/lib/backend/supabase";
import { readPhoto } from "@/lib/photo-read";
import { assertPhotoEnvironment } from "@/lib/photo-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const headers = { "Cache-Control": "private, no-store" };
  try {
    assertPhotoEnvironment();
    const actor = await createSupabaseBackend().auth.getSession();
    if (!actor) return new Response(null, { status: 401, headers });
    return await readPhoto(actor, (await params).id);
  } catch {
    return new Response(null, { status: 403, headers });
  }
}
