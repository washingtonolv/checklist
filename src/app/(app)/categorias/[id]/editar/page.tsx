import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@/components/ui/illustrated-icons";
import { requireAdmin } from "@/lib/auth-server";
import { getBackend } from "@/lib/backend";
import { Card, PageHeader } from "@/components/ui";
import { CategoryForm } from "@/components/forms/CategoryForm";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({ params: rawParams }: { params: Promise<{ id: string }> }) {
  const params = await rawParams;
  const user = await requireAdmin();
  const categories = await getBackend().listCategories(user);
  const category = categories.find((item) => item.id === params.id);
  if (!category) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/categorias" className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-ink/70 hover:text-ink">
        <ArrowLeft className="h-4 w-4" />
        Voltar para categorias
      </Link>
      <PageHeader eyebrow="Edição" title={category.name} subtitle="Atualize a descrição, a ordem e o status da categoria." />
      <Card className="p-5 sm:p-6">
        <CategoryForm category={category} />
      </Card>
    </div>
  );
}

