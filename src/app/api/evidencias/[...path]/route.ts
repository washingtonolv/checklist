import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import { canAccessStore } from "@/lib/access";
import { getBackend, isLocalMode } from "@/lib/backend";
import { getDb, uploadsDir } from "@/lib/backend/local/db";

export const dynamic = "force-dynamic";

function safeSegments(segments: string[]): boolean {
  return segments.every(
    (segment) =>
      Boolean(segment) &&
      segment !== "." &&
      segment !== ".." &&
      !segment.includes("\\") &&
      !segment.includes("/") &&
      !segment.includes("\0")
  );
}

export async function GET(_request: NextRequest, { params }: { params: { path: string[] } }) {
  if (!isLocalMode()) {
    return new NextResponse("Not found", { status: 404 });
  }

  const actor = await getBackend().auth.getSession();
  if (!actor) {
    return new NextResponse("Não autorizado.", { status: 401 });
  }

  const segments = params.path ?? [];
  if (!segments.length || !safeSegments(segments)) {
    return new NextResponse("Caminho inválido.", { status: 400 });
  }

  const storagePath = segments.join("/");
  const db = await getDb();
  const photo = db.photos.find((item) => item.storagePath === storagePath);
  if (!photo) {
    return new NextResponse("Evidência não encontrada.", { status: 404 });
  }

  const task = db.tasks.find((item) => item.id === photo.taskId);
  if (!task || !canAccessStore(actor, task.storeId)) {
    return new NextResponse("Acesso negado.", { status: 403 });
  }

  const base = path.resolve(uploadsDir());
  const absolute = path.resolve(base, storagePath);
  if (absolute !== base && !absolute.startsWith(`${base}${path.sep}`)) {
    return new NextResponse("Caminho inválido.", { status: 400 });
  }

  try {
    const data = await fs.readFile(absolute);
    return new NextResponse(new Uint8Array(data), {
      status: 200,
      headers: {
        "Content-Type": photo.mimeType,
        "Content-Length": String(data.byteLength),
        "Cache-Control": "private, max-age=3600",
        "X-Content-Type-Options": "nosniff"
      }
    });
  } catch {
    return new NextResponse("Evidência não encontrada.", { status: 404 });
  }
}

