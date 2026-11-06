import Link from "next/link";
import { AlertTriangle, CalendarClock, CheckCircle2, ClipboardList, FileSpreadsheet, Filter, Percent } from "lucide-react";
import { requireUser } from "@/lib/auth-server";
import { getBackend } from "@/lib/backend";
import { ACTION_LABELS, RECURRENCE_LABELS, STATUS_LABELS, STATUS_ORDER } from "@/lib/constants";
import { dueLabel, formatDate, formatDateTime, isOverdue, monthRange } from "@/lib/dates";
import { percent } from "@/lib/utils";
import type { TaskFilters, TaskStatus } from "@/lib/types";
import { Card, CardHeader, EmptyState, PageHeader, ProgressBar, StatCard } from "@/components/ui";
import { ReportExport, type ReportRow } from "@/components/reports/ReportExport";
import { StatusBadge } from "@/components/ui/badges";

export const dynamic = "force-dynamic";

function statusFrom(value: string | undefined): TaskStatus | "" {
  return value && STATUS_ORDER.includes(value as TaskStatus) ? (value as TaskStatus) : "";
}

export default async function ReportsPage({
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
    to: typeof searchParams.to === "string" && searchParams.to ? searchParams.to : range.to
  };

  if (user.role === "admin") {
    try {
      await backend.ensureGenerated(user);
    } catch {
      // a geração também é executada pelo cron
    }
  }

  const [stores, categories, tasks] = await Promise.all([
    backend.listStores(user),
    backend.listCategories(user),
    backend.listTasks(user, filters)
  ]);

  const completed = tasks.filter((task) => task.status === "completed").length;
  const pending = tasks.length - completed;
  const overdue = tasks.filter((task) => isOverdue(task)).length;
  const rate = percent(completed, tasks.length);
  const selectedStore = stores.find((store) => store.id === filters.storeId);
  const selectedCategory = categories.find((category) => category.id === filters.categoryId);
  const periodLabel = `${formatDate(filters.from)} a ${formatDate(filters.to)}`;
  const filterLabel = [
    selectedStore?.name ?? "Todas as lojas",
    selectedCategory?.name ?? "Todas as categorias",
    filters.status ? STATUS_LABELS[filters.status] : "Todos os status"
  ].join(" · ");

  const rows: ReportRow[] = tasks.map((task) => ({
    store: task.storeName,
    code: task.storeCode,
    task: task.title,
    category: task.categoryName,
    recurrence: RECURRENCE_LABELS[task.recurrence],
    due: dueLabel(task.dueDate, task.dueTime),
    status: STATUS_LABELS[task.status],
    executor: task.completedByName ?? "—",
    completedAt: task.completedAt ? formatDateTime(task.completedAt) : "—",
    photos: task.photoCount
  }));

  return (
    <div>
      <PageHeader
        eyebrow="Indicadores e exportações"
        title="Relatórios"
        subtitle="Consolide a execução das lojas, filtre o período e exporte em Excel ou PDF para reuniões e auditorias."
        actions={
          <ReportExport rows={rows} summary={{ total: tasks.length, completed, pending, overdue, rate }} periodLabel={periodLabel} filterLabel={filterLabel} />
        }
      />

      <Card className="mb-5 p-4 no-print">
        <form method="get" action="/relatorios" className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <div>
            <label className="label" htmlFor="storeId">Loja</label>
            <select id="storeId" name="storeId" defaultValue={filters.storeId} className="input">
              <option value="">Todas</option>
              {stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="categoryId">Categoria</label>
            <select id="categoryId" name="categoryId" defaultValue={filters.categoryId} className="input">
              <option value="">Todas</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue={filters.status} className="input">
              <option value="">Todos</option>
              {STATUS_ORDER.map((status) => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}
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
          <div className="flex items-end gap-2">
            <button type="submit" className="btn-primary btn-sm"><Filter className="h-4 w-4" />Filtrar</button>
            <Link href="/relatorios" className="btn-ghost btn-sm">Limpar</Link>
          </div>
        </form>
      </Card>

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Atividades previstas" value={tasks.length} hint={periodLabel} icon={<ClipboardList className="h-5 w-5" />} />
        <StatCard label="Concluídas" value={completed} hint={`${rate}% de execução`} icon={<CheckCircle2 className="h-5 w-5" />} tone="pink" />
        <StatCard label="Em aberto" value={pending} hint="Pendentes, em andamento ou em correção" icon={<CalendarClock className="h-5 w-5" />} tone="outline" />
        <StatCard label="Atrasadas" value={overdue} hint="Prazo vencido no período" icon={<AlertTriangle className="h-5 w-5" />} tone="turquesa" />
      </div>

      <div className="mb-5 grid gap-5 xl:grid-cols-[1fr_1.6fr]">
        <Card>
          <CardHeader title="Execução do período" description="Percentual consolidado" icon={<Percent className="h-4 w-4" />} />
          <div className="space-y-4 p-5">
            <div className="flex items-end justify-between gap-3">
              <span className="text-4xl font-semibold text-ink">{rate}%</span>
              <span className="text-xs text-ink/70">{completed} de {tasks.length} concluídas</span>
            </div>
            <ProgressBar value={rate} />
            <div className="grid gap-2 sm:grid-cols-2">
              {STATUS_ORDER.map((status) => (
                <div key={status} className="flex items-center justify-between gap-2 rounded-lg border border-ink/10 px-3 py-2 text-[11px]">
                  <span className="text-ink/70">{STATUS_LABELS[status]}</span>
                  <span className="font-semibold text-ink">{tasks.filter((task) => task.status === status).length}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Resumo por loja" description="Execução consolidada no filtro atual" icon={<FileSpreadsheet className="h-4 w-4" />} />
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Loja</th>
                  <th>Previstas</th>
                  <th>Concluídas</th>
                  <th>Atrasadas</th>
                  <th>Execução</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((store) => {
                  const storeTasks = tasks.filter((task) => task.storeId === store.id);
                  const storeCompleted = storeTasks.filter((task) => task.status === "completed").length;
                  const storeOverdue = storeTasks.filter((task) => isOverdue(task)).length;
                  return (
                    <tr key={store.id}>
                      <td>
                        <Link href={`/lojas/${store.id}`} className="font-semibold text-ink hover:underline">{store.name}</Link>
                        <p className="text-[10px] text-ink/70">{store.code}</p>
                      </td>
                      <td>{storeTasks.length}</td>
                      <td>{storeCompleted}</td>
                      <td className={storeOverdue ? "font-bold text-ink" : ""}>{storeOverdue}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <ProgressBar value={percent(storeCompleted, storeTasks.length)} className="min-w-[80px]" />
                          <span className="w-9 text-right text-xs font-bold text-ink">{percent(storeCompleted, storeTasks.length)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Detalhamento das atividades"
          description={`${tasks.length} registro(s) · ${filterLabel}`}
          icon={<ClipboardList className="h-4 w-4" />}
          action={<span className="badge border border-ink/15 bg-surface text-ink/70">{periodLabel}</span>}
        />
        {tasks.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Loja</th>
                  <th>Atividade</th>
                  <th>Categoria</th>
                  <th>Prazo</th>
                  <th>Status</th>
                  <th>Executor</th>
                  <th>Fotos</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <p className="text-xs font-semibold text-ink">{task.storeName}</p>
                      <p className="text-[10px] text-ink/70">{task.storeCode}</p>
                    </td>
                    <td>
                      <Link href={`/atividades/${task.id}`} className="font-semibold text-ink hover:underline">{task.title}</Link>
                      <p className="text-[10px] text-ink/70">{RECURRENCE_LABELS[task.recurrence]}</p>
                    </td>
                    <td className="text-xs text-ink/70">{task.categoryName}</td>
                    <td className="text-xs text-ink/65">
                      <span className={isOverdue(task) ? "font-bold text-ink" : ""}>{dueLabel(task.dueDate, task.dueTime)}</span>
                    </td>
                    <td><StatusBadge status={task.status} /></td>
                    <td className="text-xs text-ink/70">
                      {task.completedByName ?? "—"}
                      {task.completedAt ? <p className="text-[10px] text-ink/70">{formatDateTime(task.completedAt)}</p> : null}
                    </td>
                    <td className="text-xs font-bold text-ink">{task.photoCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={<ClipboardList className="h-6 w-6" />}
            title="Nenhum registro no período"
            description="Ajuste os filtros ou aguarde a geração automática das atividades recorrentes."
          />
        )}
      </Card>

      <p className="mt-4 text-[11px] text-ink/70">
        Relatório gerado a partir das atividades registradas no sistema. A exportação em PDF e Excel respeita os filtros
        aplicados. Ações de execução disponíveis no histórico: {Object.values(ACTION_LABELS).slice(0, 4).join(", ")} e outras.
      </p>
    </div>
  );
}

