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

