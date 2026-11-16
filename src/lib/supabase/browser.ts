"use client";

import { createBrowserClient } from "@supabase/ssr";
import { PASSKEY_ORIGIN } from "@/lib/passkeys";

export function supportsPasskeys(): boolean {
  return typeof window !== "undefined" && window.isSecureContext && window.location.origin === PASSKEY_ORIGIN &&
    typeof window.PublicKeyCredential !== "undefined" && Boolean(navigator.credentials);
}

export function getPasskeyClient() {
  if (!supportsPasskeys()) throw new Error("Passkeys unavailable on this origin/browser");
  // Use the same cookie storage as password login and the server middleware.
  // Never use service-role credentials or localStorage for the session.
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { experimental: { passkey: true } } }
  );
}
