export const PASSKEY_ORIGIN = "https://checklist-dd.checklist-operacional-dd.workers.dev";

// Runtime opt-in only for the isolated Cloudflare deployment.
export function passkeysEnabled(): boolean {
  return process.env.PASSKEYS_ENABLED === "true" && process.env.PHOTO_ENV === "cloudflare" && !process.env.VERCEL_ENV;
}

export function safePasskeyNext(next: string): string {
  // Reject protocol-relative URLs, backslashes and control characters before navigation.
  return next.startsWith("/") && !next.startsWith("//") && !/[\\\u0000-\u001f\u007f]/.test(next) ? next : "/painel";
}

export function passkeyErrorMessage(error: unknown): string {
  const value = error as { name?: string; code?: string } | null;
  if (value?.name === "NotAllowedError" || value?.name === "AbortError" || value?.code === "webauthn_not_allowed") {
    return "A confirmação foi cancelada ou expirou. Tente novamente ou entre com sua senha.";
  }
  if (value?.code === "passkey_disabled") return "O acesso por biometria ainda não está disponível. Use sua senha.";
  if (value?.code === "webauthn_credential_exists" || value?.name === "InvalidStateError") return "Esta chave já está cadastrada na sua conta.";
  if (value?.code === "too_many_passkeys") return "Você atingiu o limite de chaves. Remova uma chave antiga antes de cadastrar outra.";
  if (value?.name === "SecurityError") return "Abra o endereço da Cloudflare em um navegador compatível para usar sua chave.";
  return "Não foi possível concluir. Tente novamente ou use sua senha de acesso.";
}
