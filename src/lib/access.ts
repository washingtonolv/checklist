import type { SessionUser } from "./types";

export function canAccessStore(actor: SessionUser, storeId: string): boolean {
  if (actor.role === "admin") return true;
  return actor.storeIds.includes(storeId);
}

export function assertStoreAccess(actor: SessionUser, storeId: string): void {
  if (!canAccessStore(actor, storeId)) {
    throw new Error("Você não tem permissão para acessar esta loja.");
  }
}

export function assertAdmin(actor: SessionUser): void {
  if (actor.role !== "admin") {
    throw new Error("Somente a gerente comercial pode executar esta ação.");
  }
}

export function assertSupervisorOrAdmin(actor: SessionUser): void {
  if (actor.role !== "admin" && actor.role !== "supervisor") {
    throw new Error("Somente supervisores e a gerente comercial podem executar esta ação.");
  }
}

export function canReview(actor: SessionUser): boolean {
  return actor.role === "admin" || actor.role === "supervisor";
}


// Immutable application owner, bound to the verified Supabase Auth identity.
export const GENERAL_ADMIN_ID = "313596fc-5730-42e6-a8fd-a694d2ef5832";
export function isGeneralAdmin(actor: SessionUser): boolean {
  return actor.id === GENERAL_ADMIN_ID && actor.role === "admin" && actor.active;
}
export function assertGeneralAdmin(actor: SessionUser): void {
  if (!isGeneralAdmin(actor)) throw new Error("Somente o Administrador Geral pode executar esta ação.");
}
