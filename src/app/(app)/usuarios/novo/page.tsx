import Link from "next/link";
import { isGeneralAdmin } from "@/lib/access";
import { ArrowLeft } from "@/components/ui/material-icons";
import { requireAdmin } from "@/lib/auth-server";
import { getBackend } from "@/lib/backend";
import { Card, PageHeader } from "@/components/ui";
import { UserForm } from "@/components/forms/UserForm";

export const dynamic = "force-dynamic";

export default async function NewUserPage() {
  const user = await requireAdmin();
  const stores = await getBackend().listStores(user);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/usuarios" className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-ink/70 hover:text-ink">
        <ArrowLeft className="h-4 w-4" />
        Voltar para usuários
      </Link>
      <PageHeader
        eyebrow="Cadastro"
        title="Novo usuário"
        subtitle="Defina o perfil de acesso e vincule o responsável às lojas da rede."
      />
      <Card className="p-5 sm:p-6">
        <UserForm canManageAdmins={isGeneralAdmin(user)} stores={stores.map((store) => ({ id: store.id, name: store.name }))} />
      </Card>
    </div>
  );
}

