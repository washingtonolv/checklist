import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import type { SessionUser } from "../../types";
import { getDb, mutateDb, newId } from "./db";
import {
  LOCAL_SESSION_COOKIE,
  createLocalSessionToken,
  verifyLocalSessionToken
} from "./session";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export async function localSignIn(email: string, password: string): Promise<SessionUser> {
  const db = await getDb();
  const user = db.users.find((item) => item.email.toLowerCase() === normalizeEmail(email));
  if (!user || !user.active || !verifyPassword(password, user.passwordHash)) {
    throw new Error("E-mail ou senha inválidos.");
  }
  const token = await createLocalSessionToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  });
  cookies().set(LOCAL_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE
  });
  return await localSessionUser(user.id);
}

async function localSessionUser(userId: string): Promise<SessionUser> {
  const db = await getDb();
  const user = db.users.find((item) => item.id === userId);
  if (!user || !user.active) throw new Error("Sessão inválida.");
  const storeIds = db.stores
    .filter((store) => store.active && (store.managerId === user.id || store.supervisorIds.includes(user.id)))
    .map((store) => store.id);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active,
    storeIds: user.role === "admin" ? db.stores.filter((store) => store.active).map((store) => store.id) : storeIds
  };
}

export async function getLocalSession(): Promise<SessionUser | null> {
  const token = cookies().get(LOCAL_SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifyLocalSessionToken(token);
  if (!payload) return null;
  try {
    return await localSessionUser(payload.sub);
  } catch {
    return null;
  }
}

export async function localSignOut(): Promise<void> {
  cookies().delete(LOCAL_SESSION_COOKIE);
}

export async function localRequestPasswordReset(email: string): Promise<{ resetUrl?: string }> {
  const normalized = normalizeEmail(email);
  const db = await getDb();
  const user = db.users.find((item) => item.email.toLowerCase() === normalized && item.active);
  if (!user) return {};
  const token = newId().replace(/-/g, "");
  await mutateDb((current) => {
    current.passwordResets = current.passwordResets.filter((item) => item.userId !== user.id || item.used);
    current.passwordResets.push({
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
      used: false
    });
  });
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return { resetUrl: `${base}/redefinir-senha?token=${token}` };
}

export async function localResetPassword(token: string, newPassword: string): Promise<void> {
  await mutateDb((db) => {
    const reset = db.passwordResets.find((item) => item.token === token && !item.used);
    if (!reset) throw new Error("Link de recuperação inválido ou já utilizado.");
    if (new Date(reset.expiresAt).getTime() < Date.now()) {
      throw new Error("Link de recuperação expirado. Solicite um novo.");
    }
    const user = db.users.find((item) => item.id === reset.userId);
    if (!user) throw new Error("Usuário não encontrado.");
    user.passwordHash = hashPassword(newPassword);
    reset.used = true;
  });
}

export async function localUpdatePassword(newPassword: string): Promise<void> {
  const session = await getLocalSession();
  if (!session) throw new Error("Sessão expirada. Entre novamente.");
  await mutateDb((db) => {
    const user = db.users.find((item) => item.id === session.id);
    if (!user) throw new Error("Usuário não encontrado.");
    user.passwordHash = hashPassword(newPassword);
  });
}

