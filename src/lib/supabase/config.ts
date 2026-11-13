export function isSupabaseConfigured(): boolean {
  if (process.env.VERCEL_ENV === "preview") return false;
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith("http")
  );
}

export function supabaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!value) throw new Error("NEXT_PUBLIC_SUPABASE_URL não configurada.");
  const expected = process.env.PHOTO_ENV === "cloudflare" ? process.env.SUPABASE_ALLOWED_URL : process.env.PREVIEW_SUPABASE_URL;
  if (["cloudflare-preview", "cloudflare"].includes(process.env.PHOTO_ENV ?? "") && (process.env.VERCEL_ENV || expected !== value)) {
    throw new Error("O projeto Supabase deve ser explicitamente autorizado para o ambiente Cloudflare.");
  }
  return value;
}

export function supabaseAnonKey(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!value) throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY não configurada.");
  return value;
}

