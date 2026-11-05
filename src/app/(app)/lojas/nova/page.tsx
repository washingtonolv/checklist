import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth-server";
import { getBackend } from "@/lib/backend";
import { Card, PageHeader } from "@/components/ui";
import { StoreForm } from "@/components/forms/StoreForm";

export const dynamic = "force-dynamic";

export default async function NewStorePage() {
  const user = await requireAdmin();
  const users = await getBackend().listUsers(user);
  const managers = users.filter((person) => person.role === "manager").map((person) => ({ id: person.id, name: person.name }));
  const supervisors = users.filter((person) => person.role === "supervisor").map((person) => ({ id: person.id, name: person.name }));

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/lojas" className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-pink/55 hover:text-pink">
        <ArrowLeft className="h-4 w-4" />
        Voltar para lojas
      </Link>
      <PageHeader eyebrow="Cadastro" title="Nova loja" subtitle="Cadastre a unidade, defina o gerente e os supervisores responsáveis." />
      <Card className="p-5 sm:p-6">
        <StoreForm managers={managers} supervisors={supervisors} />
      </Card>
    </div>
  );
}

