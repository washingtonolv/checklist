import { isSupabaseConfigured } from "../supabase/config";
import { assertPhotoEnvironment } from "../photo-store";
import type { Backend } from "./types";
import { createSupabaseBackend } from "./supabase";

// Stateless backend; never a filesystem/demo fallback in the Workers branch.
const backend = createSupabaseBackend();
export function getBackend(): Backend {
  assertPhotoEnvironment();
  if (!isSupabaseConfigured()) throw new Error("Configure Supabase de teste; backend local indisponível.");
  return backend;
}
export function isLocalMode(): boolean { return false; }
export type { Backend };
