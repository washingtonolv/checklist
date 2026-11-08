import { AppShell } from "@/components/layout/AppShell";
import { requireUser } from "@/lib/auth-server";
import { isLocalMode } from "@/lib/backend";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <AppShell user={user} demoMode={isLocalMode()}>
      {children}
    </AppShell>
  );
}

