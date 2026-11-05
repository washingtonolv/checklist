import { NextResponse } from "next/server";
import { isLocalMode } from "@/lib/backend";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "checklist-operacional-dd",
    mode: isLocalMode() ? "local" : "supabase",
    timestamp: new Date().toISOString()
  });
}

