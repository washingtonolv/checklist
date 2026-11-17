import Link from "next/link";
import { requireAdmin } from "@/lib/auth-server";
import { PageHeader } from "@/components/ui";
import { TemplatesPanel } from "@/components/management/TemplatesPanel";
import { CategoriesPanel } from "@/components/management/CategoriesPanel";
export const dynamic = "force-dynamic";
export default async function TaskManagementPage({ searchParams }: { searchParams: { aba?: string; sucesso?: string } }) {
  await requireAdmin();
  const categories = searchParams.aba === "categorias";
  return <div>
    <PageHeader title="Gerenciamento de Tarefas" subtitle="Cadastre e organize seus modelos e categorias." actions={!categories ? <Link href="/modelos/novo" className="btn-primary">Novo modelo</Link> : undefined} />
    <nav aria-label="Abas de gerenciamento" className="mb-5 flex gap-2 border-b border-ink/15 pb-3">
      <Link href="/gerenciamento-tarefas?aba=modelos" aria-current={!categories ? "page" : undefined} className={!categories ? "btn-primary" : "btn-secondary"}>Modelos de Tarefas</Link>
      <Link href="/gerenciamento-tarefas?aba=categorias" aria-current={categories ? "page" : undefined} className={categories ? "btn-primary" : "btn-secondary"}>Categorias</Link>
    </nav>
    <p className="mb-5 text-xs text-ink/70">Arquivar um modelo interrompe novas gerações e mantém as atividades existentes. Arquivar uma categoria apenas a retira dos novos cadastros; seus modelos continuam com o próprio status. A exclusão é permitida somente sem vínculos ou histórico.</p>
    {categories ? <CategoriesPanel searchParams={searchParams} /> : <TemplatesPanel searchParams={searchParams} />}
  </div>;
}
