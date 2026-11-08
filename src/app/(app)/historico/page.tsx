import Link from "next/link";
import { Activity, Filter, History, ScrollText, ShieldCheck } from "@/components/ui/illustrated-icons";
import { requireUser } from "@/lib/auth-server";
import { getBackend } from "@/lib/backend";
import { ACTION_LABELS } from "@/lib/constants";
import { formatDateTime, monthRange } from "@/lib/dates";
import type { ExecutionAction, HistoryFilters } from "@/lib/types";
import { Card, CardHeader, EmptyState, PageHeader } from "@/components/ui";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const ACTIONS = Object.keys(ACTION_LABELS) as ExecutionAction[];

export default async function HistoryPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const user = await requireUser();
  const backend = getBackend();
  const range = monthRange();
  const tab = searchParams.aba === "auditoria" && user.role === "admin" ? "auditoria" : "execucoes";
  const filters: HistoryFilters = {
    storeId: typeof searchParams.storeId === "string" ? searchParams.storeId : "",
    action:
      typeof searchParams.action === "string" && ACTIONS.includes(searchParams.action as ExecutionAction)
        ? (searchParams.action as ExecutionAction)
        : "",
    from: typeof searchParams.from === "string" && searchParams.from ? searchParams.from : range.from,
    to: typeof searchParams.to === "string" && searchParams.to ? searchParams.to : range.to,
    limit: 500
  };

  const stores = await backend.listStores(user);
  const history = await backend.listHistory(user, filters);
  const audit = user.role === "admin" && tab === "auditoria" ? await backend.listAudit(user, 300) : [];

  const baseParams = new URLSearchParams();
  if (filters.storeId) baseParams.set("storeId", filters.storeId);
  if (filters.action) baseParams.set("action", filters.action);
  if (filters.from) baseParams.set("from", filters.from);
  if (filters.to) baseParams.set("to", filters.to);

  function tabHref(nextTab: string) {
    const params = new URLSearchParams(baseParams);
    params.set("aba", nextTab);
    return `/historico?${params.toString()}`;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Execuções e auditoria"
        title="Histórico"
        subtitle="Rastreie quem executou, revisou e alterou cada atividade. Os registros são preservados mesmo após correções."
      />

      <div className="mb-5 flex gap-2">
        <Link
          href={tabHref("execucoes")}
          className={cn(
            "rounded-full border px-4 py-2 text-xs font-semibold",
            tab === "execucoes" ? "border-ink bg-pink text-white" : "border-ink/15 bg-surface text-ink/65 hover:border-turquesa"
          )}
        >
          <Activity className="mr-1.5 inline h-3.5 w-3.5" />
          Execuções
        </Link>
        {user.role === "admin" ? (
          <Link
            href={tabHref("auditoria")}
            className={cn(
              "rounded-full border px-4 py-2 text-xs font-semibold",
              tab === "auditoria" ? "border-ink bg-pink text-white" : "border-ink/15 bg-surface text-ink/65 hover:border-turquesa"
            )}
          >
            <ShieldCheck className="mr-1.5 inline h-3.5 w-3.5" />
            Auditoria
          </Link>
        ) : null}
      </div>

      <Card className="mb-5 p-4">
        <form method="get" action="/historico" className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <input type="hidden" name="aba" value={tab} />
          <div>
            <label className="label" htmlFor="storeId">Loja</label>
            <select id="storeId" name="storeId" defaultValue={filters.storeId} className="input">
              <option value="">Todas</option>
              {stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="action">Ação</label>
            <select id="action" name="action" defaultValue={filters.action} className="input">
              <option value="">Todas</option>
              {ACTIONS.map((action) => <option key={action} value={action}>{ACTION_LABELS[action]}</option>)}
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
            <Link href={`/historico?aba=${tab}`} className="btn-ghost btn-sm">Limpar</Link>
          </div>
        </form>
      </Card>

      {tab === "execucoes" ? (
        <Card>
          <CardHeader
            title="Eventos de execução"
            description={`${history.length} evento(s) no período filtrado`}
            icon={<History className="h-4 w-4" />}
          />
          {history.length ? (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Data e hora</th>
                    <th>Evento</th>
                    <th>Atividade</th>
                    <th>Loja</th>
                    <th>Responsável</th>
                    <th>Detalhe</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((execution) => (
                    <tr key={execution.id}>
                      <td className="whitespace-nowrap text-xs text-ink/70">{formatDateTime(execution.createdAt)}</td>
                      <td>
                        <span className="badge border border-turquesa/40 bg-turquesa/10 text-ink">
                          {ACTION_LABELS[execution.action] ?? execution.action}
                        </span>
                      </td>
                      <td>
                        {execution.taskTitle ? (
                          <Link href={`/atividades/${execution.taskId}`} className="text-xs font-semibold text-ink hover:underline">
                            {execution.taskTitle}
                          </Link>
                        ) : (
                          <span className="text-xs text-ink/70">Atividade removida</span>
                        )}
                      </td>
                      <td className="text-xs text-ink/70">{execution.storeName ?? "—"}</td>
                      <td className="text-xs text-ink/70">{execution.userName}</td>
                      <td className="max-w-[280px] text-xs text-ink/70">{execution.note || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={<History className="h-6 w-6" />}
              title="Nenhum evento no período"
              description="As ações de início, conclusão, correção, aprovação e anexos aparecerão aqui."
            />
          )}
        </Card>
      ) : (
        <Card>
          <CardHeader
            title="Trilha de auditoria"
            description="Ações administrativas registradas no sistema"
            icon={<ScrollText className="h-4 w-4" />}
          />
          {audit.length ? (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Data e hora</th>
                    <th>Ator</th>
                    <th>Ação</th>
                    <th>Entidade</th>
                    <th>Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {audit.map((entry) => (
                    <tr key={entry.id}>
                      <td className="whitespace-nowrap text-xs text-ink/70">{formatDateTime(entry.createdAt)}</td>
                      <td className="text-xs font-semibold text-ink/70">{entry.actorName}</td>
                      <td><span className="badge bg-pink/10 text-ink">{entry.action}</span></td>
                      <td className="text-xs text-ink/70">{entry.entityType}</td>
                      <td className="max-w-[360px] break-words text-[11px] text-ink/70">{JSON.stringify(entry.details)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={<ScrollText className="h-6 w-6" />}
              title="Nenhum registro de auditoria"
              description="Cadastros e alterações administrativas serão registrados nesta trilha."
            />
          )}
        </Card>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-ink/15 px-4 py-3 text-[11px] text-ink/70">
        <ShieldCheck className="h-4 w-4" />
        O histórico preserva o estado anterior e posterior de cada mudança de status. Registros não são sobrescritos.
      </div>
    </div>
  );
}

