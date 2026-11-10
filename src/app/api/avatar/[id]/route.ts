import { NextResponse } from "next/server";
import sharp from "sharp";
import { requireUser } from "@/lib/auth-server";
import { isLocalMode } from "@/lib/backend";
import { getDb, mutateDb } from "@/lib/backend/local/db";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const headers = { "Cache-Control": "private, no-store" };
export async function GET(_request: Request, { params }: { params: { id: string } }) {
 const actor = await requireUser();
 if (actor.id !== params.id && actor.role !== "admin") return new Response(null,{status:403,headers});
 let avatar: unknown;
 if (isLocalMode()) avatar=(await getDb()).users.find(u=>u.id===params.id)?.avatar;
 else {
   const { data, error } = actor.id === params.id ? await createSupabaseServerClient().auth.getUser() : await createSupabaseAdminClient().auth.admin.getUserById(params.id);
   if(error) return new Response(null,{status:404,headers});
   avatar=data.user?.user_metadata?.profile_photo;
 }
 if(typeof avatar!=="string" || !/^data:image\/webp;base64,[A-Za-z0-9+/=]+$/.test(avatar) || avatar.length>12000) return new Response(null,{status:404,headers});
 return new Response(Buffer.from(avatar.split(",")[1],"base64"),{headers:{...headers,"Content-Type":"image/webp","X-Content-Type-Options":"nosniff"}});
}
export async function POST(request: Request, { params }: { params: { id: string } }) {
 const actor=await requireUser();
 if(actor.id!==params.id) return NextResponse.json({error:"Você só pode alterar sua própria foto."},{status:403});
 try {
  const form=await request.formData();
  let avatar: string | null=null;
  if(form.get("remove")!=="true") {
   const file=form.get("photo");
   if(!(file instanceof File) || !["image/jpeg","image/png","image/webp"].includes(file.type) || file.size===0 || file.size>5*1024*1024) throw new Error("Escolha uma foto JPG, PNG ou WebP de até 5 MB.");
   const bytes=await sharp(Buffer.from(await file.arrayBuffer()),{limitInputPixels:24000000,animated:false}).rotate().resize(96,96,{fit:"cover"}).webp({quality:55}).toBuffer();
   if(bytes.length>8000) throw new Error("Não foi possível reduzir esta foto. Escolha outra imagem.");
   avatar=`data:image/webp;base64,${bytes.toString("base64")}`;
  }
  if(isLocalMode()) await mutateDb(db=>{const user=db.users.find(u=>u.id===actor.id);if(!user) throw new Error("Usuário não encontrado."); user.avatar=avatar;});
  else {const {error}=await createSupabaseServerClient().auth.updateUser({data:{profile_photo:avatar}});if(error) throw new Error("Não foi possível salvar sua foto. Tente novamente.");}
  return NextResponse.json({ok:true});
 } catch {return NextResponse.json({error:"Não foi possível salvar. Use uma foto JPG, PNG ou WebP de até 5 MB e tente novamente."},{status:400});}
}
