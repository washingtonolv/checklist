import { isSupabaseConfigured } from "../supabase/config";
import type { Backend } from "./types";
import { createLocalBackend } from "./local";
import { createSupabaseBackend } from "./supabase";

let instance: Backend | null = null;

export function getBackend(): Backend {
  if (!instance) {
    instance = isSupabaseConfigured() ? createSupabaseBackend() : createLocalBackend();
  }
  return instance;
}

export function isLocalMode(): boolean {
  return !isSupabaseConfigured();
}

export type { Backend };

