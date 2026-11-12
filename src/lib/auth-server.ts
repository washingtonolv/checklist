import { redirect } from "next/navigation";
import { cache } from "react";
import { getBackend } from "./backend";
import type { Role, SessionUser } from "./types";

// Deduplicate layout/page lookups only within the current server render.
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  return getBackend().auth.getSession();
});

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

