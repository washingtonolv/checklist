import Link from "next/link";
import { CheckCircle2, FolderTree, Layers, ListChecks, Pencil } from "lucide-react";
import { requireAdmin } from "@/lib/auth-server";
import { getBackend } from "@/lib/backend";
import { Card, CardHeader, EmptyState, PageHeader } from "@/components/ui";
import { Alert } from "@/components/ui";
import { CategoryForm } from "@/components/forms/CategoryForm";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CategoriesPage({
  searchParams
}: {
  searchParams: { sucesso?: string };
}) {
  const user = await requireAdmin();
  const categories = await getBackend().listCategories(user);

  return (
    <div>
      <PageHeader
        eyebrow="Estrutura dos checklists"
        title="Categorias"
        subtitle="Organize as rotinas operacionais em grupos claros para a execução das lojas."
      />

      {searchParams.sucesso ? (
        <div className="mb-5">
          <Alert tone="success">
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />{searchParams.sucesso}</span>
          </Alert>
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader
            title="Categorias cadastradas"
            description={`${categories.length} categoria(s) na estrutura atual`}
            icon={<FolderTree className="h-4 w-4" />}
            action={<Link href="/modelos" className="btn-ghost btn-sm"><ListChecks className="h-4 w-4" />Ver modelos</Link>}
          />
          {categories.length ? (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Categoria</th>
                    <th>Descrição</th>
                    <th>Modelos</th>
                    <th>Ordem</th>
                    <th>Status</th>
                    <th className="text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td>
                        <div className="flex items-center gap-2 font-bold text-ink">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-turquesa/15">
                            <Layers className="h-4 w-4" />
                          </span>
                          {category.name}
                        </div>
                      </td>
                      <td className="max-w-[280px] text-xs text-ink/70">{category.description || "—"}</td>
                      <td><span className="badge bg-turquesa/15 text-ink">{category.templateCount ?? 0}</span></td>
                      <td className="text-xs text-ink/70">{category.sortOrder}</td>
                      <td>
                        <span className={cn("badge", category.active ? "bg-pink text-white" : "border border-ink/20 bg-surface text-ink/70")}>
                          {category.active ? "Ativa" : "Inativa"}
                        </span>
                      </td>
                      <td>
                        <div className="flex justify-end">
                          <Link href={`/categorias/${category.id}/editar`} className="btn-secondary btn-sm">
                            <Pencil className="h-3.5 w-3.5" />
                            Editar
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={<FolderTree className="h-6 w-6" />}
              title="Nenhuma categoria cadastrada"
              description="Crie a primeira categoria para organizar os modelos de tarefas."
            />
          )}
        </Card>

        <Card>
          <CardHeader title="Nova categoria" description="Crie um agrupamento de rotinas" icon={<FolderTree className="h-4 w-4" />} />
          <div className="p-5">
            <CategoryForm />
          </div>
        </Card>
      </div>
    </div>
  );
}

