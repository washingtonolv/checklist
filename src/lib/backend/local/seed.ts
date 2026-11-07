import fs from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import bcrypt from "bcryptjs";
import sharp from "sharp";
import { DEFAULT_CATEGORIES, DEFAULT_TEMPLATES } from "../../constants";
import { addDays, periodForRecurrence, toDateKey } from "../../dates";
import type { TaskStatus } from "../../types";
import type {
  LocalAudit,
  LocalCategory,
  LocalDb,
  LocalExecution,
  LocalObservation,
  LocalPhoto,
  LocalStore,
  LocalTask,
  LocalTemplate,
  LocalUser
} from "./db";
import { nowIso, uploadsDir } from "./db";

const DEMO_PASSWORD = "Dd@2026!";

function isoAt(dateKey: string, hour: number, minute: number): string {
  return new Date(`${dateKey}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`).toISOString();
}

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (char) => {
    const map: Record<string, string> = { "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" };
    return map[char];
  });
}

async function evidenceBuffer(storeName: string): Promise<Buffer> {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="960" height="720">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#12D9EF"/>
          <stop offset="100%" stop-color="#891745"/>
        </linearGradient>
      </defs>
      <rect width="960" height="720" fill="url(#g)"/>
      <rect x="48" y="48" width="864" height="624" rx="32" fill="#FFFFFF" fill-opacity="0.94"/>
      <text x="96" y="180" font-family="Segoe UI, Arial" font-size="34" font-weight="700" fill="#891745">EVIDÊNCIA DEMONSTRATIVA</text>
      <text x="96" y="240" font-family="Segoe UI, Arial" font-size="24" fill="#891745" opacity="0.75">${escapeXml(storeName)}</text>
      <text x="96" y="320" font-family="Segoe UI, Arial" font-size="22" fill="#891745" opacity="0.7">Imagem gerada automaticamente para testes do modo local.</text>
      <text x="96" y="360" font-family="Segoe UI, Arial" font-size="22" fill="#891745" opacity="0.7">Substitua por fotos reais ao usar o Supabase.</text>
      <rect x="96" y="430" width="360" height="16" rx="8" fill="#12D9EF"/>
      <rect x="96" y="466" width="250" height="16" rx="8" fill="#891745" fill-opacity="0.55"/>
      <rect x="96" y="502" width="300" height="16" rx="8" fill="#12D9EF" fill-opacity="0.55"/>
      <text x="96" y="620" font-family="Segoe UI, Arial" font-size="18" fill="#891745" opacity="0.55">CHECKLIST OPERACIONAL D&amp;D</text>
    </svg>`;
  return sharp(Buffer.from(svg)).jpeg({ quality: 68, mozjpeg: true }).toBuffer();
}

export async function createSeedDb(dir: string): Promise<LocalDb> {
  fs.mkdirSync(dir, { recursive: true });
  fs.mkdirSync(path.join(dir, "uploads"), { recursive: true });

  // Stable fixture identities across serverless preview instances; mutations still use random IDs.
  let fixture = 0;
  const fixtureId = () => {
    const hex = createHash("sha256").update(`dd-preview-${fixture++}`).digest("hex");
    return `${hex.slice(0,8)}-${hex.slice(8,12)}-4${hex.slice(13,16)}-8${hex.slice(17,20)}-${hex.slice(20,32)}`;
  };
  const createdAt = nowIso();
  const passwordHash = bcrypt.hashSync(DEMO_PASSWORD, 10);

  const storeIds = [fixtureId(), fixtureId(), fixtureId()];
  const admin: LocalUser = {
    id: fixtureId(),
    name: "Gerente Comercial D&D",
    email: "admin@dd.local",
    passwordHash,
    role: "admin",
    active: true,
    createdAt
  };
  const supervisor1: LocalUser = {
    id: fixtureId(),
    name: "Supervisora Regional",
    email: "supervisor@dd.local",
    passwordHash,
    role: "supervisor",
    active: true,
    createdAt
  };
  const supervisor2: LocalUser = {
    id: fixtureId(),
    name: "Supervisor de Operações",
    email: "supervisor2@dd.local",
    passwordHash,
    role: "supervisor",
    active: true,
    createdAt
  };
  const manager1: LocalUser = {
    id: fixtureId(),
    name: "Gerente Loja Centro",
    email: "gerente@dd.local",
    passwordHash,
    role: "manager",
    active: true,
    createdAt
  };
  const manager2: LocalUser = {
    id: fixtureId(),
    name: "Gerente Loja Shopping",
    email: "gerente2@dd.local",
    passwordHash,
    role: "manager",
    active: true,
    createdAt
  };
  const manager3: LocalUser = {
    id: fixtureId(),
    name: "Gerente Loja Matriz",
    email: "gerente3@dd.local",
    passwordHash,
    role: "manager",
    active: true,
    createdAt
  };
  const users = [admin, supervisor1, supervisor2, manager1, manager2, manager3];

  const stores: LocalStore[] = [
    {
      id: storeIds[0],
      name: "D&D Centro",
      code: "LOJA-001",
      active: true,
      managerId: manager1.id,
      supervisorIds: [supervisor1.id],
      createdAt
    },
    {
      id: storeIds[1],
      name: "D&D Shopping",
      code: "LOJA-002",
      active: true,
      managerId: manager2.id,
      supervisorIds: [supervisor1.id, supervisor2.id],
      createdAt
    },
    {
      id: storeIds[2],
      name: "D&D Matriz",
      code: "LOJA-003",
      active: true,
      managerId: manager3.id,
      supervisorIds: [supervisor1.id, supervisor2.id],
      createdAt
    }
  ];

  const categories: LocalCategory[] = DEFAULT_CATEGORIES.map((category) => ({
    id: fixtureId(),
    name: category.name,
    description: category.description,
    active: true,
    sortOrder: category.sortOrder
  }));

  const today = new Date();
  const templates: LocalTemplate[] = DEFAULT_TEMPLATES.map((template) => {
    const category = categories.find((item) => item.name === template.category);
    if (!category) throw new Error(`Categoria não encontrada no seed: ${template.category}`);
    return {
      id: fixtureId(),
      title: template.title,
      description: template.description,
      categoryId: category.id,
      recurrence: template.recurrence,
      dueTime: template.dueTime,
      onceDueDate: template.recurrence === "once" ? toDateKey(today) : null,
      photoRequirement: template.photoRequirement,
      active: true,
      storeIds: [...storeIds],
      createdAt
    };
  });

  const tasks: LocalTask[] = [];
  const photos: LocalPhoto[] = [];
  const executions: LocalExecution[] = [];
  const observations: LocalObservation[] = [];
  const audit: LocalAudit[] = [];

  const buffers = new Map<string, Buffer>();
  for (const store of stores) {
    buffers.set(store.id, await evidenceBuffer(store.name));
  }

  const taskKeys = new Set<string>();
  const days = 10;

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = addDays(today, -offset);
    const dateKey = toDateKey(date);

    for (let templateIndex = 0; templateIndex < templates.length; templateIndex += 1) {
      const template = templates[templateIndex];
      const period = periodForRecurrence(template.recurrence, date);
      if (template.recurrence === "once" && template.onceDueDate !== dateKey) continue;

      for (let storeIndex = 0; storeIndex < stores.length; storeIndex += 1) {
        const store = stores[storeIndex];
        const key = `${template.id}|${store.id}|${period.periodKey}`;
        if (taskKeys.has(key)) continue;
        taskKeys.add(key);

        const hash = offset * 17 + templateIndex * 7 + storeIndex * 5;
        const isPast = period.dueDate < toDateKey(today);
        const isToday = period.dueDate === toDateKey(today);
        let status: TaskStatus = "pending";
        if (isPast) {
          const mod = hash % 11;
          if (mod === 0) status = "correction_requested";
          else if (mod === 1) status = "rejected";
          else if (mod === 2) status = "in_progress";
          else if (mod === 3) status = "pending";
          else status = "completed";
        } else if (isToday) {
          const mod = hash % 5;
          status = mod === 0 ? "pending" : mod === 1 ? "in_progress" : mod === 4 ? "pending" : "completed";
        }

        const manager = users.find((user) => user.id === store.managerId);
        const taskId = fixtureId();
        const completedAt =
          status === "completed" || status === "correction_requested" || status === "rejected"
            ? isoAt(period.dueDate, 14 + (hash % 3), (hash * 7) % 60)
            : null;
        const approvedAt =
          status === "completed" && hash % 2 === 0
            ? isoAt(period.dueDate, 17, (hash * 3) % 60)
            : null;

        const task: LocalTask = {
          id: taskId,
          templateId: template.id,
          storeId: store.id,
          title: template.title,
          description: template.description,
          categoryId: template.categoryId,
          recurrence: template.recurrence,
          periodKey: period.periodKey,
          dueDate: period.dueDate,
          dueTime: template.dueTime,
          status,
          photoRequirement: template.photoRequirement,
          completedAt,
          completedById: completedAt ? manager?.id ?? supervisor1.id : null,
          approvedAt,
          approvedById: approvedAt ? supervisor1.id : null,
          observation:
            status === "correction_requested"
              ? "Ajustar a organização e reenviar a evidência fotográfica."
              : status === "rejected"
                ? "Execução reprovada: atividade não atende ao padrão da marca."
                : hash % 7 === 0
                  ? "Execução realizada conforme o padrão operacional."
                  : "",
          createdAt: isoAt(dateKey, 8, 0),
          updatedAt: completedAt ?? isoAt(dateKey, 8, 0)
        };
        tasks.push(task);

        if (completedAt) {
          const executor = manager?.id ?? supervisor1.id;
          executions.push({
            id: fixtureId(),
            taskId,
            action: "started",
            note: "",
            userId: executor,
            previousStatus: "pending",
            newStatus: "in_progress",
            createdAt: isoAt(period.dueDate, 13, 0)
          });
          executions.push({
            id: fixtureId(),
            taskId,
            action: "completed",
            note: task.observation || "Atividade concluída.",
            userId: executor,
            previousStatus: "in_progress",
            newStatus: "completed",
            createdAt: completedAt
          });
          audit.push({
            id: fixtureId(),
            actorId: executor,
            action: "task.completed",
            entityType: "task",
            entityId: taskId,
            details: { store: store.name, title: task.title },
            createdAt: completedAt
          });
          if (status === "correction_requested") {
            executions.push({
              id: fixtureId(),
              taskId,
              action: "correction_requested",
              note: "Ajustar a organização e reenviar a evidência fotográfica.",
              userId: supervisor1.id,
              previousStatus: "completed",
              newStatus: "correction_requested",
              createdAt: isoAt(period.dueDate, 17, 10)
            });
          }
          if (status === "rejected") {
            executions.push({
              id: fixtureId(),
              taskId,
              action: "rejected",
              note: "Execução reprovada: atividade não atende ao padrão da marca.",
              userId: supervisor1.id,
              previousStatus: "completed",
              newStatus: "rejected",
              createdAt: isoAt(period.dueDate, 17, 20)
            });
          }
          if (approvedAt) {
            executions.push({
              id: fixtureId(),
              taskId,
              action: "approved",
              note: "Execução aprovada pela supervisão.",
              userId: supervisor1.id,
              previousStatus: "completed",
              newStatus: "completed",
              createdAt: approvedAt
            });
          }

          if (template.photoRequirement !== "none" && (template.photoRequirement === "required" || hash % 2 === 0)) {
            const photoId = fixtureId();
            const relativePath = `${store.id}/${taskId}/${photoId}.jpg`;
            const absolute = path.join(uploadsDir(), relativePath);
            fs.mkdirSync(path.dirname(absolute), { recursive: true });
            const buffer = buffers.get(store.id)!;
            fs.writeFileSync(absolute, buffer);
            photos.push({
              id: photoId,
              taskId,
              storagePath: relativePath,
              mimeType: "image/jpeg",
              sizeBytes: buffer.length,
              width: 960,
              height: 720,
              isOriginal: false,
              uploadedById: executor,
              createdAt: completedAt
            });
            executions.push({
              id: fixtureId(),
              taskId,
              action: "photo_added",
              note: "Evidência fotográfica anexada.",
              userId: executor,
              previousStatus: null,
              newStatus: null,
              createdAt: completedAt
            });
          }
        }

        if (hash % 9 === 0) {
          observations.push({
            id: fixtureId(),
            taskId,
            userId: supervisor1.id,
            content: "Acompanhamento da supervisão: manter o padrão durante a semana.",
            createdAt: isoAt(period.dueDate, 16, 30)
          });
        }
      }
    }
  }

  return {
    version: 1,
    users,
    stores,
    categories,
    templates,
    tasks,
    photos,
    executions,
    observations,
    audit,
    passwordResets: []
  };
}

