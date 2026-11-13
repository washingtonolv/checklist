import { expirePhotos } from "@/lib/photo-retention";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  const secret = process.env.PHOTO_RETENTION_CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return new Response(null, { status: 401 });
  try { return Response.json({ expired: await expirePhotos() }); }
  catch { return Response.json({ error: "Falha na expiração; repetir rotina e verificar logs." }, { status: 500 }); }
}
