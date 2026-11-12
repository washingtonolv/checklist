import Link from "next/link";
import { CalendarClock, Camera, CheckCircle2, ListChecks, Pencil, Plus, Store } from "@/components/ui/illustrated-icons";
import { requireAdmin } from "@/lib/auth-server";
import { getBackend } from "@/lib/backend";
import { PHOTO_LABELS, RECURRENCE_LABELS } from "@/lib/constants";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { Alert } from "@/components/ui";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TemplatesPage({
  searchParams
}: {
  searchParams: { sucesso?: string };
}) {
  const user = await requireAdmin();
  const backend = getBackend();
  const [templates, categories] = await Promise.all([backend.listTemplates(user), backend.listCategories(user)]);
  const grouped = categories
    .map((category) => ({
      category,
      templates: templates.filter((template) => template.categoryId === category.id)
    }))
    .filter((group) => group.templates.length > 0);
  const uncategorized = templates.filter((template) => !categories.some((category) => category.id === template.categoryId));

  return (
    <div>
      <PageHeader
        title="Modelos de tarefas"
        subtitle="Defina as atividades recorrentes, os prazos, as lojas participantes e a regra de evidência."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/categorias" className="btn-ghost">
              Categorias
            </Link>
            <Link href="/modelos/novo" className="btn-primary">
              <Plus className="h-4 w-4" />
              Novo modelo
            </Link>
          </div>
        }
      />

      {searchParams.sucesso ? (
        <div className="mb-5">
          <Alert tone="success">
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />{searchParams.sucesso}</span>
          </Alert>
        </div>
      ) : null}

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Summary label="Modelos cadastrados" value={templates.length} />
        <Summary label="Modelos ativos" value={templates.filter((template) => template.active).length} />
        <Summary label="Com foto obrigatória" value={templates.filter((template) => template.photoRequirement === "required").length} />
      </div>

      {templates.length ? (
        <div className="space-y-6">
          {[...grouped, ...(uncategorized.length ? [{ category: { id: "sem-categoria", name: "Sem categoria", description: "" }, templates: uncategorized }] : [])].map((group) => (
            <Card key={group.category.id}>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 bg-turquesa/5 px-5 py-3">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">{group.category.name}</h2>
                  <p className="text-[11px] text-ink/70">{group.templates.length} modelo(s)</p>
                </div>
              </div>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Atividade</th>
                      <th>Periodicidade</th>
                      <th>Prazo</th>
                      <th>Evidência</th>
                      <th>Lojas</th>
                      <th>Status</th>
                      <th className="text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.templates.map((template) => (
                      <tr key={template.id}>
                        <td>
                          <p className="font-bold text-ink">{template.title}</p>
                          <p className="max-w-[320px] text-[11px] text-ink/70">{template.description || "Sem descrição."}</p>
                        </td>
                        <td>
                          <span className="badge border border-turquesa/50 bg-turquesa/10 text-ink">
                            <CalendarClock className="h-3.5 w-3.5" />
                            {RECURRENCE_LABELS[template.recurrence]}
                          </span>
                        </td>
                        <td className="text-xs text-ink/65">
                          {template.recurrence === "once" && template.onceDueDate ? template.onceDueDate : template.dueTime}
                        </td>
                        <td>
                          <span className={cn("badge", template.photoRequirement === "required" ? "bg-pink text-white" : "border border-ink/15 bg-surface text-ink/65")}>
                            <Camera className="h-3.5 w-3.5" />
                            {PHOTO_LABELS[template.photoRequirement]}
                          </span>
                        </td>
                        <td>
                          <div className="flex max-w-[220px] flex-wrap gap-1">
                            {template.storeNames.slice(0, 3).map((name) => (
                              <span key={name} className="badge bg-turquesa/15 text-ink">
                                <Store className="h-3 w-3" />
                                {name}
                              </span>
                            ))}
                            {template.storeNames.length > 3 ? (
                              <span className="badge border border-ink/15 text-ink/70">+{template.storeNames.length - 3}</span>
                            ) : null}
                          </div>
                        </td>
                        <td>
                          <span className={cn("badge", template.active ? "bg-pink text-white" : "border border-ink/20 bg-surface text-ink/70")}>
                            {template.active ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                        <td>
                          <div className="flex justify-end">
                            <Link href={`/modelos/${template.id}/editar`} className="btn-secondary btn-sm">
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
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={<ListChecks className="h-6 w-6" />}
            title="Nenhum modelo de tarefa"
            description="Crie as rotinas recorrentes que serão geradas automaticamente para as lojas."
            action={<Link href="/modelos/novo" className="btn-primary">Criar modelo</Link>}
          />
        </Card>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-ink/15 px-4 py-3 text-[11px] text-ink/70">
        <Camera className="h-4 w-4" />
        A geração automática evita duplicidades por loja, modelo e período (diário, semanal, mensal ou pontual).
      </div>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <div className="card flex items-center justify-between gap-3 p-4">
      <span className="text-xs font-semibold text-ink/70">{label}</span>
      <span className="text-2xl font-semibold text-ink">{value}</span>
    </div>
  );
}

