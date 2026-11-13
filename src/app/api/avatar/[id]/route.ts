import { NextResponse } from "next/server";
import { optimizeAvatar } from "@/lib/photo-image";
import { requireUser } from "@/lib/auth-server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const headers = { "Cache-Control": "private, no-store" };
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, { params }: Context) {
  const actor = await requireUser();
  const { id } = await params;
  if (actor.id !== id && actor.role !== "admin") return new Response(null, { status: 403, headers });
  const { data, error } = actor.id === id
    ? await (await createSupabaseServerClient()).auth.getUser()
    : await createSupabaseAdminClient().auth.admin.getUserById(id);
  if (error) return new Response(null, { status: 404, headers });
  const avatar: unknown = data.user?.user_metadata?.profile_photo;
  if (typeof avatar !== "string" || !/^data:image\/webp;base64,[A-Za-z0-9+/=]+$/.test(avatar) || avatar.length > 12000) return new Response(null, { status: 404, headers });
  return new Response(Buffer.from(avatar.split(",")[1], "base64"), { headers: { ...headers, "Content-Type": "image/webp", "X-Content-Type-Options": "nosniff" } });
}
export async function POST(request: Request, { params }: Context) {
  const actor = await requireUser();
  if (actor.id !== (await params).id) return NextResponse.json({ error: "Você só pode alterar sua própria foto." }, { status: 403 });
  try {
    const form = await request.formData();
    let avatar: string | null = null;
    if (form.get("remove") !== "true") {
      const file = form.get("photo");
      if (!(file instanceof File) || !["image/jpeg", "image/png", "image/webp"].includes(file.type) || !file.size || file.size > 5 * 1024 * 1024) throw new Error("Imagem inválida.");
      const bytes = await optimizeAvatar(Buffer.from(await file.arrayBuffer()));
      if (bytes.length > 8000) throw new Error("Imagem muito grande.");
      avatar = `data:image/webp;base64,${bytes.toString("base64")}`;
    }
    const { error } = await (await createSupabaseServerClient()).auth.updateUser({ data: { profile_photo: avatar } });
    if (error) throw new Error("Não foi possível salvar sua foto.");
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Não foi possível salvar. Use uma foto JPG, PNG ou WebP de até 5 MB e tente novamente." }, { status: 400 }); }
}
