import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { isLocalMode } from "@/lib/backend";
import { getSessionUser } from "@/lib/auth-server";
import { Alert } from "@/components/ui";

export const metadata: Metadata = { title: "Redefinir senha" };

export default async function ResetPasswordPage({
  searchParams
}: {
  searchParams: { token?: string };
}) {
  const local = isLocalMode();
  const token = searchParams.token ?? "";
  const session = local ? null : await getSessionUser();
  const valid = local ? Boolean(token) : Boolean(session);

  if (!valid) {
    return (
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-pink/45">Segurança</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-pink">Link inválido ou expirado</h1>
        <div className="mt-5">
          <Alert tone="error">
            Solicite um novo link de recuperação para redefinir sua senha.
          </Alert>
        </div>
        <p className="mt-5 text-sm text-pink/60">
          <Link href="/recuperar-senha" className="link">
            Solicitar novo link
          </Link>
        </p>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}

