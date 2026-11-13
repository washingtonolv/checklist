import { ArrowLeft } from "@/components/ui/illustrated-icons";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-server";
import { getBackend } from "@/lib/backend";
import { Card, PageHeader } from "@/components/ui";
import { StoreForm } from "@/components/forms/StoreForm";

export const dynamic = "force-dynamic";

export default async function EditStorePage({ params: rawParams }: { params: Promise<{ id: string }> }) {
  const params = await rawParams;
  const user = await requireAdmin();
  const backend = getBackend();
  const store = await backend.getStore(user, params.id);
  if (!store) notFound();
  const users = await backend.listUsers(user);
  const managers = users.filter((person) => person.role === "manager").map((person) => ({ id: person.id, name: person.name }));
  const supervisors = users.filter((person) => person.role === "supervisor").map((person) => ({ id: person.id, name: person.name }));

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={`/lojas/${store.id}`} className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-ink/70 hover:text-ink">
        <ArrowLeft className="h-4 w-4" />
        Voltar para a loja
      </Link>
      <PageHeader eyebrow={store.code} title={`Editar ${store.name}`} subtitle="Atualize os dados da unidade, gerente e supervisores." />
      <Card className="p-5 sm:p-6">
        <StoreForm store={store} managers={managers} supervisors={supervisors} />
      </Card>
    </div>
  );
}

