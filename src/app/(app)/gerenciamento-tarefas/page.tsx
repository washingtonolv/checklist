import Link from "next/link";
import { requireAdmin } from "@/lib/auth-server";
import { PageHeader } from "@/components/ui";
import { TemplatesPanel } from "@/components/management/TemplatesPanel";
import { CategoriesPanel } from "@/components/management/CategoriesPanel";
export const dynamic = "force-dynamic";
export default async function TaskManagementPage({ searchParams: rawParams }: { searchParams: Promise<{ aba?: string; sucesso?: string }> }) {
  const searchParams = await rawParams;
  await requireAdmin();
  const filters = searchParams as typeof searchParams & { categorias?: string; categoria?: string };
  const categoriesOpen = filters.categorias === "abertas" || searchParams.aba === "categorias";
  return <div>
    <PageHeader title="Gerenciamento de Tarefas" subtitle="Cadastre modelos de tarefa e organize-os por categoria." actions={<Link href="/modelos/novo" className="btn-primary">Novo modelo</Link>} />
    <div className="mb-5 border-b border-ink/15 pb-3">
      <h2 className="text-sm font-semibold text-ink">Modelos de tarefa</h2>
    </div>
    <details key={categoriesOpen ? "open" : "closed"} open={categoriesOpen} id="categorias" className="mb-6 rounded-2xl border border-ink/15 bg-surface p-4">
      <summary className="cursor-pointer text-sm font-semibold text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">Gerenciar categorias</summary>
      <div className="mt-4">
        <p className="mb-4 text-xs text-ink/70">Crie, edite e organize as categorias dos modelos. Arquivar uma categoria a retira dos novos cadastros; seus modelos mantêm o próprio status. A exclusão é permitida somente sem vínculos ou histórico.</p>
        <CategoriesPanel searchParams={{}} />
      </div>
    </details>
    <p className="mb-5 text-xs text-ink/70">Arquivar um modelo interrompe novas gerações e mantém as atividades existentes. A exclusão é permitida somente sem vínculos ou histórico.</p>
    <TemplatesPanel searchParams={filters} />
  </div>;
}
