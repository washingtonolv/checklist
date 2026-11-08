import Link from "next/link";
import { ArrowLeft } from "@/components/ui/illustrated-icons";
import { requireAdmin } from "@/lib/auth-server";
import { getBackend } from "@/lib/backend";
import { Alert, Card, PageHeader } from "@/components/ui";
import { TemplateForm } from "@/components/forms/TemplateForm";

export const dynamic = "force-dynamic";

export default async function NewTemplatePage() {
  const user = await requireAdmin();
  const backend = getBackend();
  const [categories, stores] = await Promise.all([backend.listCategories(user), backend.listStores(user)]);

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/modelos" className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-ink/70 hover:text-ink">
        <ArrowLeft className="h-4 w-4" />
        Voltar para modelos
      </Link>
      <PageHeader
        eyebrow="Novo modelo"
        title="Criar atividade recorrente"
        subtitle="A atividade será gerada automaticamente para as lojas selecionadas, respeitando a periodicidade."
      />
      {categories.length && stores.length ? (
        <Card className="p-5 sm:p-6">
          <TemplateForm categories={categories} stores={stores} />
        </Card>
      ) : (
        <Card>
          <div className="p-6">
            <Alert tone="info">
              Para criar um modelo, cadastre pelo menos uma categoria e uma loja ativa.
              <span className="mt-3 flex flex-wrap gap-2">
                <Link href="/categorias" className="btn-secondary btn-sm">Cadastrar categoria</Link>
                <Link href="/lojas/nova" className="btn-ghost btn-sm">Cadastrar loja</Link>
              </span>
            </Alert>
          </div>
        </Card>
      )}
    </div>
  );
}

