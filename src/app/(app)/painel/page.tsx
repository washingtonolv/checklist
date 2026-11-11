import Link from "next/link";
import { ManagerRoutine } from "@/components/layout/ManagerRoutine";
import { AnimatedCalendar } from "@/components/ui/AnimatedCalendar";
import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  Camera,
  CheckCircle2,
  ClipboardList,
  FileSpreadsheet,
  ListChecks,
  Plus,
  Store
} from "@/components/ui/illustrated-icons";
import { requireUser } from "@/lib/auth-server";
import { getBackend } from "@/lib/backend";
import { computeDashboard } from "@/lib/dashboard";
import { monthRange, dueLabel, formatDate } from "@/lib/dates";
import { ROLE_LABELS, STATUS_LABELS, STATUS_ORDER } from "@/lib/constants";
import type { DashboardFilters, Role, TaskStatus } from "@/lib/types";
import { Card, CardHeader, EmptyState, PageHeader, ProgressBar, StatCard } from "@/components/ui";
import { FilterPanel } from "@/components/ui/FilterPanel";
import { RoleBadge, StatusBadge } from "@/components/ui/badges";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const user = await requireUser();
  if (user.role === "manager") return <ManagerRoutine user={user} date={typeof searchParams.data === "string" ? searchParams.data : undefined} />;
  const backend = getBackend();
  const range = monthRange();
  const filters: DashboardFilters = {
    storeId: typeof searchParams.storeId === "string" ? searchParams.storeId : "",
    supervisorId: typeof searchParams.supervisorId === "string" ? searchParams.supervisorId : "",
    managerId: typeof searchParams.managerId === "string" ? searchParams.managerId : "",
    categoryId: typeof searchParams.categoryId === "string" ? searchParams.categoryId : "",
    status: (typeof searchParams.status === "string" ? searchParams.status : "") as TaskStatus | "",
    from: typeof searchParams.from === "string" && searchParams.from ? searchParams.from : range.from,
    to: typeof searchParams.to === "string" && searchParams.to ? searchParams.to : range.to
  };

  if (user.role === "admin") {
    try {
      await backend.ensureGenerated(user);
    } catch {
      // a rotina também é executada pelo cron; não bloqueia o painel
    }
  }

  const [stores, categories, tasks] = await Promise.all([
    backend.listStores(user),
    backend.listCategories(user),
    backend.listTasks(user, filters)
  ]);
  const people = user.role === "admin" ? await backend.listUsers(user) : [];
  const photos = tasks.length
    ? await backend.listPhotosForTasks(
        user,
        tasks.slice(0, 60).map((task) => task.id)
      )
    : [];
  const enrichedPhotos = photos.slice(0, 8).map((photo) => {
    const task = tasks.find((item) => item.id === photo.taskId);
    return {
      ...photo,
      taskTitle: task?.title ?? "Atividade",
      storeName: task?.storeName ?? "Loja"
    };
  });
  const data = computeDashboard(tasks, stores, enrichedPhotos, user, filters);
  const supervisors = people.filter((person) => person.role === "supervisor");
  const managers = people.filter((person) => person.role === "manager");

  const title =
    user.role === "admin"
      ? "Painel gerencial"
      : user.role === "supervisor"
        ? "Painel da supervisão"
        : "Painel da minha loja";

  const subtitle =
    user.role === "admin"
      ? "Acompanhe a execução das rotinas, as evidências e o desempenho de todas as lojas D&D."
      : user.role === "supervisor"
        ? "Indicadores das lojas sob sua responsabilidade, com pendências e evidências recentes."
        : "Sua rotina operacional, pendências e evidências da loja.";

  return (
    <div>
      <PageHeader
        eyebrow={ROLE_LABELS[user.role]}
        title={title}
        subtitle={subtitle}
        actions={
          <Link href="/atividades" className="btn-primary"><ClipboardList className="h-4 w-4" />Ver atividades</Link>
        }
      />

      <FilterPanel
        title="Filtrar indicadores"
        activeCount={[filters.storeId, filters.supervisorId, filters.managerId, filters.categoryId, filters.status, filters.from !== range.from, filters.to !== range.to].filter(Boolean).length}
      >
        <form key={JSON.stringify(filters)} method="get" action="/painel">
          <div className="filter-grid">
            <div className="filter-field">
              <label className="label" htmlFor="storeId">Loja</label>
              <select id="storeId" name="storeId" defaultValue={filters.storeId} className="input">
                <option value="">Loja</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>{store.name}</option>
                ))}
              </select>
            </div>
            {user.role === "admin" ? (
              <>
                <div className="filter-field">
                  <label className="label" htmlFor="supervisorId">Supervisor</label>
                  <select id="supervisorId" name="supervisorId" defaultValue={filters.supervisorId} className="input">
                    <option value="">Supervisor</option>
                    {supervisors.map((person) => (
                      <option key={person.id} value={person.id}>{person.name}</option>
                    ))}
                  </select>
                </div>
                <div className="filter-field">
                  <label className="label" htmlFor="managerId">Gerente</label>
                  <select id="managerId" name="managerId" defaultValue={filters.managerId} className="input">
                    <option value="">Gerente</option>
                    {managers.map((person) => (
                      <option key={person.id} value={person.id}>{person.name}</option>
                    ))}
                  </select>
                </div>
              </>
            ) : null}
            <div className="filter-field">
              <label className="label" htmlFor="categoryId">Categoria</label>
              <select id="categoryId" name="categoryId" defaultValue={filters.categoryId} className="input">
                <option value="">Categoria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div className="filter-field filter-wide">
              <label className="label" htmlFor="status">Status</label>
              <select id="status" name="status" defaultValue={filters.status} className="input">
                <option value="">Status</option>
                {STATUS_ORDER.map((status) => (
                  <option key={status} value={status}>{STATUS_LABELS[status]}</option>
                ))}
              </select>
            </div>
            <div className="filter-field filter-date">
              <label className="label" htmlFor="from">De</label>
              <input id="from" name="from" type="date" defaultValue={filters.from} className="input" />
            </div>
            <div className="filter-field filter-date">
              <label className="label" htmlFor="to">Até</label>
              <input id="to" name="to" type="date" defaultValue={filters.to} className="input" />
            </div>
          </div>
          <div className="filter-actions mt-3">
            <Link href="/painel" className="btn-ghost btn-sm">Limpar filtros</Link>
            <button type="submit" className="btn-primary btn-sm">Aplicar filtros</button>
          </div>
        </form>
      </FilterPanel>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Lojas ativas"
          value={data.totalStores}
          hint={user.role === "admin" ? "Rede completa" : "Unidades sob sua responsabilidade"}
          icon={<Store className="h-5 w-5" />}
          tone="turquesa"
        />
        <StatCard
          label="Atividades previstas"
          value={data.totalTasks}
          hint={`${formatDate(filters.from)} a ${formatDate(filters.to)}`}
          icon={<ClipboardList className="h-5 w-5" />}
          tone="outline"
        />
        <StatCard
          label="Concluídas"
          value={data.completed}
          hint={`${data.executionRate}% de execução no período`}
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="pink"
        />
        <StatCard
          label="Pendentes"
          value={data.pending + data.inProgress + data.correction + data.rejected}
          hint={`${data.inProgress} em andamento · ${data.correction} correções`}
          icon={<AnimatedCalendar className="h-5 w-5" />}
          tone="outline"
        />
        <StatCard
          label="Atrasadas"
          value={data.overdue}
          hint="Prazo vencido e sem conclusão"
          icon={<AlertTriangle className="h-5 w-5" />}
          tone="pink"
        />
        <StatCard
          label="Fotos recentes"
          value={enrichedPhotos.length}
          hint="Evidências enviadas no período"
          icon={<Camera className="h-5 w-5" />}
          tone="turquesa"
        />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <CardHeader title="Execução geral" description="Percentual de atividades concluídas" icon={<CheckCircle2 className="h-4 w-4" />} />
          <div className="flex flex-col items-center gap-5 p-6">
            <div
              className="relative flex h-40 w-40 items-center justify-center rounded-full"
              style={{ background: `conic-gradient(rgb(var(--color-success)) ${data.executionRate * 3.6}deg, rgb(var(--color-border)) 0deg)` }}
              role="img"
              aria-label={`Execução geral: ${data.executionRate}%`}
            >
              <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-surface shadow-inner">
                <span className="text-4xl font-semibold text-ink">{data.executionRate}%</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink/70">execução</span>
              </div>
            </div>
            <div className="w-full space-y-2">
              {data.statusBreakdown.map((item) => (
                <div key={item.status} className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-ink/65">{item.label}</span>
                  <span className="font-bold text-ink">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader
            title="Ranking de lojas"
            description="Melhor desempenho no período filtrado"
            icon={<Building2 className="h-4 w-4" />}
            action={<Link href="/relatorios" className="btn-ghost btn-sm">Relatório</Link>}
          />
          <div className="p-5">
            {data.storeRanking.length ? (
              <div className="space-y-4">
                {data.storeRanking.slice(0, 6).map((store, index) => (
                  <div key={store.storeId}>
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold", index === 0 ? "bg-pink text-white" : "bg-turquesa/20 text-ink")}>
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-ink">{store.storeName}</p>
                          <p className="text-[11px] text-ink/70">{store.storeCode} · {store.completed}/{store.total} concluídas</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-ink">{store.rate}%</span>
                    </div>
                    <ProgressBar value={store.rate} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Building2 className="h-6 w-6" />}
                title="Sem dados no período"
                description="Ajuste os filtros ou aguarde a geração das atividades."
              />
            )}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader title="Lojas com mais pendências" description="Priorize o acompanhamento" icon={<AlertTriangle className="h-4 w-4" />} />
          <div className="p-5">
            {data.pendingRanking.length ? (
              <div className="space-y-3">
                {data.pendingRanking.slice(0, 6).map((store) => (
                  <Link key={store.storeId} href={`/lojas/${store.storeId}`} className="flex items-center justify-between gap-3 rounded-xl border border-ink/10 px-3 py-2.5 hover:border-turquesa hover:bg-turquesa/5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">{store.storeName}</p>
                      <p className="text-[11px] text-ink/70">{store.overdue} atrasadas · {store.total} previstas</p>
                    </div>
                    <span className="badge bg-pink/10 text-ink">{store.pending} pendentes</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-ink/70">Nenhuma pendência no período.</p>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Atividades atrasadas" description="Prazo vencido" icon={<AnimatedCalendar className="h-4 w-4" />} action={<Link href="/atividades?status=pending" className="btn-ghost btn-sm">Ver todas</Link>} />
          <div className="p-5">
            {data.overdueTasks.length ? (
              <div className="space-y-3">
                {data.overdueTasks.map((task) => (
                  <Link key={task.id} href={`/atividades/${task.id}`} className="flex flex-col items-start justify-between gap-3 rounded-xl border border-ink/10 px-3 py-2.5 hover:border-turquesa hover:bg-turquesa/5 sm:flex-row">
                    <div className="w-full min-w-0">
                      <p className="break-words text-sm font-semibold text-ink">{task.title}</p>
                      <p className="text-[11px] text-ink/70">{task.storeName} · {dueLabel(task.dueDate, task.dueTime)}</p>
                    </div>
                    <StatusBadge status={task.status} />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-ink/70">Nenhuma atividade atrasada. Boa operação!</p>
            )}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Evidências recentes" description="Últimas fotos enviadas" icon={<Camera className="h-4 w-4" />} action={<Link href="/relatorios" className="btn-ghost btn-sm">Ver relatórios</Link>} />
          <div className="p-5">
            {enrichedPhotos.length ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {enrichedPhotos.map((photo) => (
                  <Link key={photo.id} href={`/atividades/${photo.taskId}`} className="group overflow-hidden rounded-xl border border-ink/10 bg-turquesa/5">
                    {photo.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo.url} alt={photo.taskTitle} loading="lazy" className="aspect-[4/3] w-full object-cover transition group-hover:scale-[1.03]" />
                    ) : (
                      <div className="flex aspect-[4/3] items-center justify-center text-[10px] text-ink/70">Sem prévia</div>
                    )}
                    <div className="p-2">
                      <p className="truncate text-[11px] font-semibold text-ink">{photo.taskTitle}</p>
                      <p className="truncate text-[10px] text-ink/70">{photo.storeName}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState icon={<Camera className="h-6 w-6" />} title="Nenhuma evidência recente" description="As fotos enviadas pelas lojas aparecerão aqui." />
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Desempenho por categoria" description="Execução no período" icon={<FileSpreadsheet className="h-4 w-4" />} />
          <div className="p-5">
            {data.categoryBreakdown.length ? (
              <div className="space-y-4">
                {data.categoryBreakdown.map((category) => (
                  <div key={category.categoryName}>
                    <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                      <span className="truncate font-semibold text-ink/75">{category.categoryName}</span>
                      <span className="font-bold text-ink">{category.rate}%</span>
                    </div>
                    <ProgressBar value={category.rate} />
                    <p className="mt-1 text-[10px] text-ink/70">{category.completed} de {category.total} concluídas</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-ink/70">Sem dados no período.</p>
            )}
          </div>
        </Card>
      </div>


      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-ink/20 bg-turquesa/5 px-5 py-4">
        <div className="flex items-center gap-3">
          <RoleBadge role={user.role as Role} />
          <p className="text-xs text-ink/70">
            {user.role === "admin"
              ? "Você visualiza todas as lojas e pode gerenciar usuários, categorias e modelos."
              : user.role === "supervisor"
                ? "Você visualiza somente as lojas vinculadas à sua supervisão."
                : "Você visualiza somente a sua loja."}
          </p>
        </div>
        <Link href="/atividades" className="btn-ghost btn-sm">
          Abrir checklists
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

