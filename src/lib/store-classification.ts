import type { StoreOperationType, StoreRegion } from "./types";
export const STORE_REGIONS: Record<StoreRegion, string> = { rio_de_janeiro: "Rio de Janeiro", nordeste: "Nordeste" };
export const STORE_OPERATION_TYPES: Record<StoreOperationType, string> = { dd_multimarcas: "D&D Multimarcas", franquia_natura: "Franquias Natura" };
export function assertStoreClassification(region: StoreRegion, operationType: StoreOperationType): void {
  if (!Object.prototype.hasOwnProperty.call(STORE_REGIONS, region) || !Object.prototype.hasOwnProperty.call(STORE_OPERATION_TYPES, operationType) || (region === "nordeste" && operationType !== "dd_multimarcas")) {
    throw new Error("Selecione uma região e um tipo de loja válidos. No Nordeste, selecione D&D Multimarcas.");
  }
}
