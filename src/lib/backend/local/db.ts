import fs from "node:fs";
import path from "node:path";
import type { PhotoRequirement, Recurrence, Role, TaskStatus } from "../../types";

export interface LocalUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  active: boolean;
  createdAt: string;
}

export interface LocalStore {
  id: string;
  name: string;
  code: string;
  active: boolean;
  managerId: string | null;
  supervisorIds: string[];
  createdAt: string;
}

export interface LocalCategory {
  id: string;
  name: string;
  description: string;
  active: boolean;
  sortOrder: number;
}

export interface LocalTemplate {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  recurrence: Recurrence;
  dueTime: string;
  onceDueDate: string | null;
  photoRequirement: PhotoRequirement;
  active: boolean;
  storeIds: string[];
  createdAt: string;
}

export interface LocalTask {
  id: string;
  templateId: string;
  storeId: string;
  title: string;
  description: string;
  categoryId: string;
  recurrence: Recurrence;
  periodKey: string;
  dueDate: string;
  dueTime: string;
  status: TaskStatus;
  photoRequirement: PhotoRequirement;
  completedAt: string | null;
  completedById: string | null;
  approvedAt: string | null;
  approvedById: string | null;
  observation: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocalPhoto {
  id: string;
  taskId: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  isOriginal: boolean;
  uploadedById: string;
  createdAt: string;
}

export interface LocalExecution {
  id: string;
  taskId: string;
  action: string;
  note: string;
  userId: string;
  previousStatus: TaskStatus | null;
  newStatus: TaskStatus | null;
  createdAt: string;
}

export interface LocalObservation {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface LocalAudit {
  id: string;
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, unknown>;
  createdAt: string;
}

export interface LocalPasswordReset {
  token: string;
  userId: string;
  expiresAt: string;
  used: boolean;
}

export interface LocalDb {
  version: number;
  users: LocalUser[];
  stores: LocalStore[];
  categories: LocalCategory[];
  templates: LocalTemplate[];
  tasks: LocalTask[];
  photos: LocalPhoto[];
  executions: LocalExecution[];
  observations: LocalObservation[];
  audit: LocalAudit[];
  passwordResets: LocalPasswordReset[];
}

const globalDb = globalThis as unknown as {
  __ddLocalDb?: { dir: string; promise: Promise<LocalDb> };
  __ddWriteQueue?: Promise<unknown>;
};

export function localDataDir(): string {
  return path.resolve(process.cwd(), (process.env.VERCEL_ENV === "preview" ? "/tmp/dd-ux-preview" : process.env.LOCAL_DATA_DIR) || ".local");
}

export function uploadsDir(): string {
  return path.join(localDataDir(), "uploads");
}

export async function getDb(): Promise<LocalDb> {
  const dir = localDataDir();
  if (globalDb.__ddLocalDb && globalDb.__ddLocalDb.dir === dir) {
    return globalDb.__ddLocalDb.promise;
  }
  const promise = loadOrCreate(dir);
  globalDb.__ddLocalDb = { dir, promise };
  return promise;
}

async function loadOrCreate(dir: string): Promise<LocalDb> {
  const file = path.join(dir, "data.json");
  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file, "utf8")) as LocalDb;
  }
  const { createSeedDb } = await import("./seed");
  const db = await createSeedDb(dir);
  await saveDb(db);
  return db;
}

export async function saveDb(db: LocalDb): Promise<void> {
  const dir = localDataDir();
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "data.json");
  const temp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(db, null, 2), "utf8");
  fs.renameSync(temp, file);
}

export function mutateDb<T>(fn: (db: LocalDb) => T | Promise<T>): Promise<T> {
  const previous = globalDb.__ddWriteQueue ?? Promise.resolve();
  const next = previous.then(async () => {
    const db = await getDb();
    const result = await fn(db);
    await saveDb(db);
    return result;
  });
  globalDb.__ddWriteQueue = next.catch(() => undefined);
  return next;
}

export function newId(): string {
  return crypto.randomUUID();
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function resetLocalDbCacheForTests(): void {
  globalDb.__ddLocalDb = undefined;
  globalDb.__ddWriteQueue = undefined;
}

