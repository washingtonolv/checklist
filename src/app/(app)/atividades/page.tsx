import Link from "next/link";
import { AlertTriangle, CalendarClock, Camera, CheckCircle2, ClipboardList, Filter, Search } from "@/components/ui/illustrated-icons";
import { requireUser } from "@/lib/auth-server";
import { getBackend } from "@/lib/backend";
import { STATUS_LABELS, STATUS_ORDER } from "@/lib/constants";
import { dueLabel, formatDateTime, isOverdue, monthRange } from "@/lib/dates";
import type { TaskFilters, TaskStatus } from "@/lib/types";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { PhotoBadge, StatusBadge } from "@/components/ui/badges";
import { GenerateTasksButton } from "@/components/tasks/GenerateTasksButton";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function statusFrom(value: string | undefined): TaskStatus | "" {
  return value && STATUS_ORDER.includes(value as TaskStatus) ? (value as TaskStatus) : "";
}

export default async function TasksPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const user = await requireUser();
  const backend = getBackend();
  const range = monthRange();
  const filters: TaskFilters = {
    storeId: typeof searchParams.storeId === "string" ? searchParams.storeId : "",
    categoryId: typeof searchParams.categoryId === "string" ? searchParams.categoryId : "",
    status: statusFrom(typeof searchParams.status === "string" ? searchParams.status : undefined),
    from: typeof searchParams.from === "string" && searchParams.from ? searchParams.from : range.from,
    to: typeof searchParams.to === "string" && searchParams.to ? searchParams.to : range.to,
    search: typeof searchParams.search === "string" ? searchParams.search : ""
  };

  if (user.role === "admin") {
    try {
      await backend.ensureGenerated(user);
    } catch {
      // cron é a fonte principal em produção
    }
  }

  const [stores, categories, tasks] = await Promise.all([
    backend.listStores(user),
    backend.listCategories(user),
    backend.listTasks(user, filters)
  ]);

  const tabParams = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) tabParams.set(key, String(value));
  }

  function tabHref(status: TaskStatus | "") {
    const params = new URLSearchParams(tabParams);
    if (status) params.set("status", status);
    else params.delete("status");
    return `/atividades?${params.toString()}`;
  }

  return (
    <div>
      <PageHeader
        title="Atividades"
        subtitle="Execute, acompanhe e revise as rotinas das lojas com evidências fotográficas."
        actions={user.role === "admin" ? <GenerateTasksButton /> : null}
      />

      <Card className="pill-filters mb-4 p-3">
        <form key={JSON.stringify(filters)} method="get" action="/atividades" className="grid gap-2 md:grid-cols-2 xl:grid-cols-6">
          <input type="hidden" name="status" value={filters.status} />
          <div className="xl:col-span-2">
            <label className="label" htmlFor="search">Buscar atividade</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/70" />
              <input id="search" name="search" defaultValue={filters.search} className="input pl-9" placeholder="Nome da atividade..." />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="storeId">Loja</label>
            <select id="storeId" name="storeId" defaultValue={filters.storeId} className="input">
              <option value="">Loja</option>
              {stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="categoryId">Categoria</label>
            <select id="categoryId" name="categoryId" defaultValue={filters.categoryId} className="input">
              <option value="">Categoria</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="from">De</label>
            <input id="from" name="from" type="date" defaultValue={filters.from} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="to">Até</label>
            <input id="to" name="to" type="date" defaultValue={filters.to} className="input" />
          </div>
          <div className="flex items-end gap-2 xl:col-span-6">
            <button type="submit" className="btn-primary btn-sm">
              <Filter className="h-4 w-4" />
              Filtrar
            </button>
            <Link href="/atividades" className="btn-ghost btn-sm">Limpar</Link>
            <span className="ml-auto text-xs text-ink/70">{tasks.length} atividade(s) no período</span>
          </div>
        </form>
      </Card>

      <nav aria-label="Filtrar atividades por status" className="mb-5 flex flex-wrap gap-2">
        <Link
          href={tabHref("")}
          aria-current={!filters.status ? "page" : undefined}
          className={cn("inline-flex min-h-11 items-center justify-center rounded-full border px-3 py-2 text-xs font-semibold", !filters.status ? "border-ink bg-pink text-white" : "border-ink/15 bg-surface text-ink/65 hover:border-turquesa")}
        >
          Todas
        </Link>
        {STATUS_ORDER.map((status) => (
          <Link
            key={status}
            href={tabHref(status)}
            aria-current={filters.status === status ? "page" : undefined}
            className={cn("inline-flex min-h-11 items-center justify-center rounded-full border px-3 py-2 text-xs font-semibold", filters.status === status ? "border-ink bg-pink text-white" : "border-ink/15 bg-surface text-ink/65 hover:border-turquesa")}
          >
            {STATUS_LABELS[status]}
          </Link>
        ))}
      </nav>

      {tasks.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tasks.map((task) => {
            const overdue = isOverdue(task);
            return (
              <Link
                key={task.id}
                href={`/atividades/${task.id}`}
                className={cn(
                  "card group flex min-w-0 flex-col break-words p-5 transition hover:-translate-y-0.5 hover:border-turquesa hover:shadow-soft",
                  overdue && task.status !== "completed" ? "border-ink/40" : ""
                )}
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <StatusBadge status={task.status} />
                  {overdue && task.status !== "completed" ? (
                    <span className="badge border border-ink bg-pink/5 text-ink">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Atrasada
                    </span>
                  ) : null}
                </div>
                <h2 className="text-base font-bold leading-snug text-ink group-hover:underline group-hover:decoration-turquesa group-hover:decoration-2 group-hover:underline-offset-4">
                  {task.title}
                </h2>
                <p className="mt-1 line-clamp-2 text-xs text-ink/70">{task.description || "Sem descrição."}</p>
                <div className="mt-3 space-y-1.5 text-xs text-ink/70">
                  <p className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-turquesa" />
                    {task.storeName} · {task.storeCode}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-pink/40" />
                    {task.categoryName}
                  </p>
                  <p className="flex items-center gap-2">
                    <CalendarClock className="h-3.5 w-3.5 shrink-0 text-ink/70" />
                    {dueLabel(task.dueDate, task.dueTime)}
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ink/10 pt-3">
                  <PhotoBadge requirement={task.photoRequirement} count={task.photoCount} />
                  {task.status === "completed" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-ink/70">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {task.completedByName ?? "Concluída"}
                    </span>
                  ) : null}
                </div>
                {task.status === "completed" && task.completedAt ? (
                  <p className="mt-2 text-[10px] text-ink/70">{formatDateTime(task.completedAt)}</p>
                ) : null}
              </Link>
            );
          })}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={<ClipboardList className="h-6 w-6" />}
            title="Nenhuma atividade encontrada"
            description="Ajuste os filtros, o período ou aguarde a geração automática das tarefas recorrentes."
            action={user.role === "admin" ? <GenerateTasksButton /> : <Link href="/painel" className="btn-ghost btn-sm">Voltar ao painel</Link>}
          />
        </Card>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-ink/15 px-4 py-3 text-[11px] text-ink/70">
        <Camera className="h-4 w-4" />
        Atividades com foto obrigatória só podem ser concluídas após o envio de pelo menos uma evidência.
        <span className="hidden sm:inline">·</span>
        <span>{user.role === "admin" ? "Você visualiza todas as lojas." : user.role === "supervisor" ? "Você visualiza as lojas da sua supervisão." : "Você visualiza somente a sua loja."}</span>
      </div>
    </div>
  );
}

