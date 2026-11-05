import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { isLocalMode } from "@/lib/backend";
import { DEMO_CREDENTIALS } from "@/lib/constants";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage({
  searchParams
}: {
  searchParams: { next?: string };
}) {
  const next = searchParams.next?.startsWith("/") ? searchParams.next : "/painel";
  return (
    <LoginForm
      next={next}
      demoCredentials={isLocalMode() ? DEMO_CREDENTIALS : []}
    />
  );
}

