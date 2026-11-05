import { redirect } from "next/navigation";
import { getBackend } from "./backend";
import type { Role, SessionUser } from "./types";

export async function getSessionUser(): Promise<SessionUser | null> {
  return getBackend().auth.getSession();
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/painel");
  return user;
}

export async function requireRoles(roles: Role[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/painel");
  return user;
}

