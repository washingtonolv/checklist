import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth-server";
import { getBackend } from "@/lib/backend";
import { Card, PageHeader } from "@/components/ui";
import { UserForm } from "@/components/forms/UserForm";

export const dynamic = "force-dynamic";

export default async function EditUserPage({ params }: { params: { id: string } }) {
  const user = await requireAdmin();
  const backend = getBackend();
  const [account, stores] = await Promise.all([
    backend.getUser(user, params.id),
    backend.listStores(user)
  ]);
  if (!account) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/usuarios" className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-ink/70 hover:text-ink">
        <ArrowLeft className="h-4 w-4" />
        Voltar para usuários
      </Link>
      <PageHeader
        eyebrow="Edição"
        title={account.name}
        subtitle="Atualize os dados de acesso, o perfil e as lojas vinculadas."
      />
      <Card className="p-5 sm:p-6">
        <UserForm user={account} stores={stores.map((store) => ({ id: store.id, name: store.name }))} />
      </Card>
    </div>
  );
}

