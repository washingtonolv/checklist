import { NextResponse } from "next/server";
import { assertPhotoEnvironment } from "@/lib/photo-store";
import { todayKey } from "@/lib/dates";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
  }

  try {
    assertPhotoEnvironment();
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.rpc("generate_task_instances", { p_today: todayKey() });
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, mode: "supabase", created: Number(data ?? 0), date: todayKey() });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Falha ao gerar atividades." },
      { status: 500 }
    );
  }
}

