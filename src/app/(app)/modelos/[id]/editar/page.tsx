import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth-server";
import { getBackend } from "@/lib/backend";
import { Card, PageHeader } from "@/components/ui";
import { TemplateForm } from "@/components/forms/TemplateForm";
import type { TaskTemplate } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditTemplatePage({ params }: { params: { id: string } }) {
  const user = await requireAdmin();
  const backend = getBackend();
  let template: TaskTemplate | null = null;
  try {
    template = await backend.getTemplate(user, params.id);
  } catch {
    template = null;
  }
  if (!template) notFound();

  const [categories, stores] = await Promise.all([backend.listCategories(user), backend.listStores(user)]);

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/modelos" className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-pink/55 hover:text-pink">
        <ArrowLeft className="h-4 w-4" />
        Voltar para modelos
      </Link>
      <PageHeader
        eyebrow="Edição"
        title={template.title}
        subtitle="Ajuste a periodicidade, o prazo, as lojas e a regra de evidência. As atividades já geradas mantêm o histórico."
      />
      <Card className="p-5 sm:p-6">
        <TemplateForm template={template} categories={categories} stores={stores} />
      </Card>
    </div>
  );
}

