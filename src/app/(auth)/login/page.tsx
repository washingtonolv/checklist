import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({
  searchParams: rawParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const searchParams = await rawParams;
  const next = searchParams.next?.startsWith("/") ? searchParams.next : "/painel";
  return (
    <LoginForm
      next={next}
      demoCredentials={[]}
    />
  );
}

