import { NextResponse } from "next/server";
import { getBackend, isLocalMode } from "@/lib/backend";
import { todayKey } from "@/lib/dates";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
  }

  try {
    if (isLocalMode()) {
      const created = await getBackend().ensureGenerated({
        id: "system",
        name: "Sistema",
        email: "system@local",
        role: "admin",
        active: true,
        storeIds: []
      });
      return NextResponse.json({ ok: true, mode: "local", created, date: todayKey() });
    }

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

