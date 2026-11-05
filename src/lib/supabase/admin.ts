import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "./config";

export function createSupabaseAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY não configurada. Ela é necessária para criar usuários e executar rotinas administrativas."
    );
  }
  return createClient(supabaseUrl(), serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

