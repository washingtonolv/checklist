import { ArrowLeft } from "@/components/ui/illustrated-icons";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth-server";
import { getBackend } from "@/lib/backend";
import { Card, PageHeader } from "@/components/ui";
import { StoreForm } from "@/components/forms/StoreForm";

export const dynamic = "force-dynamic";

export default async function NewStorePage({ searchParams: rawParams }: { searchParams: Promise<{ regiao?: string; tipo?: string }> }) {
  const searchParams = await rawParams;
  const initialRegion = searchParams.regiao === "nordeste" ? "nordeste" : "rio_de_janeiro";
  const initialOperationType = initialRegion === "rio_de_janeiro" && searchParams.tipo === "franquia_natura" ? "franquia_natura" : "dd_multimarcas";
  const user = await requireAdmin();
  const users = await getBackend().listUsers(user);
  const managers = users.filter((person) => person.role === "manager").map((person) => ({ id: person.id, name: person.name }));
  const supervisors = users.filter((person) => person.role === "supervisor").map((person) => ({ id: person.id, name: person.name }));

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={`/lojas?regiao=${initialRegion}&tipo=${initialOperationType}`} className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-ink/70 hover:text-ink">
        <ArrowLeft className="h-4 w-4" />
        Voltar para lojas
      </Link>
      <PageHeader eyebrow="Cadastro" title="Nova loja" subtitle="Cadastre a unidade, defina o gerente e os supervisores responsáveis." />
      <Card className="p-5 sm:p-6">
        <StoreForm initialRegion={initialRegion} initialOperationType={initialOperationType} managers={managers} supervisors={supervisors} />
      </Card>
    </div>
  );
}

