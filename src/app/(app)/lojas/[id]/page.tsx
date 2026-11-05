import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CalendarClock,
  Camera,
  CheckCircle2,
  ClipboardList,
  MapPin,
  Pencil,
  UserRound,
  Users
} from "lucide-react";
import { requireUser } from "@/lib/auth-server";
import { getBackend } from "@/lib/backend";
import { dueLabel, formatDate, formatDateTime, isOverdue, monthRange } from "@/lib/dates";
import { percent } from "@/lib/utils";
import type { Store } from "@/lib/types";
import { Card, CardHeader, EmptyState, PageHeader, ProgressBar, StatCard } from "@/components/ui";
import { PhotoBadge, StatusBadge } from "@/components/ui/badges";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StoreDetailPage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  const backend = getBackend();
  let store: Store | null = null;
  try {
    store = await backend.getStore(user, params.id);
  } catch {
    store = null;
  }
  if (!store) notFound();

  const range = monthRange();
  const tasks = await backend.listTasks(user, {
    storeId: store.id,
    from: range.from,
    to: range.to
  });
  const photos = tasks.length
    ? await backend.listPhotosForTasks(
        user,
        tasks.slice(0, 40).map((task) => task.id)
      )
    : [];

  const completed = tasks.filter((task) => task.status === "completed").length;
  const pending = tasks.filter((task) => task.status === "pending").length;
  const inProgress = tasks.filter((task) => task.status === "in_progress").length;
  const correction = tasks.filter((task) => task.status === "correction_requested").length;
  const rejected = tasks.filter((task) => task.status === "rejected").length;
  const overdue = tasks.filter((task) => isOverdue(task)).length;
  const rate = percent(completed, tasks.length);
  const recentTasks = [...tasks]
    .sort((a, b) => `${b.dueDate}${b.dueTime}`.localeCompare(`${a.dueDate}${a.dueTime}`))
    .slice(0, 8);
  const recentPhotos = photos.slice(0, 6);
  const canManage = user.role === "admin";

  return (
    <div>
      <Link href="/lojas" className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-pink/55 hover:text-pink">
        <ArrowLeft className="h-4 w-4" />
        Voltar para lojas
      </Link>

      <PageHeader
        eyebrow={store.code}
        title={store.name}
        subtitle="Indicadores do mês, equipe responsável e histórico recente da unidade."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("badge", store.active ? "bg-pink text-white" : "border border-pink/20 bg-white text-pink/55")}>
              {store.active ? "Loja ativa" : "Loja inativa"}
            </span>
            {canManage ? (
              <Link href={`/lojas/${store.id}/editar`} className="btn-secondary btn-sm">
                <Pencil className="h-4 w-4" />
                Editar loja
              </Link>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Atividades no mês"
          value={tasks.length}
          hint={`${formatDate(range.from)} a ${formatDate(range.to)}`}
          icon={<ClipboardList className="h-5 w-5" />}
        />
        <StatCard
          label="Concluídas"
          value={completed}
          hint={`${rate}% de execução`}
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="pink"
        />
        <StatCard
          label="Em aberto"
          value={pending + inProgress + correction + rejected}
          hint={`${inProgress} em andamento · ${correction} correções`}
          icon={<CalendarClock className="h-5 w-5" />}
          tone="outline"
        />
        <StatCard
          label="Atrasadas"
          value={overdue}
          hint="Prazo vencido"
          icon={<AlertTriangle className="h-5 w-5" />}
          tone="turquesa"
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <Card>
            <CardHeader
              title="Execução no mês"
              description="Progresso das rotinas da unidade"
              icon={<CheckCircle2 className="h-4 w-4" />}
              action={<span className="text-sm font-black text-pink">{rate}%</span>}
            />
            <div className="space-y-4 p-5">
              <ProgressBar value={rate} label="Atividades concluídas" />
              <div className="grid gap-2 sm:grid-cols-2">
                <StatusRow label="Pendentes" value={pending} />
                <StatusRow label="Em andamento" value={inProgress} />
                <StatusRow label="Aguardando correção" value={correction} />
                <StatusRow label="Reprovadas" value={rejected} />
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Atividades recentes"
              description="Últimos checklists do período"
              icon={<ClipboardList className="h-4 w-4" />}
              action={<Link href={`/atividades?storeId=${store.id}`} className="btn-ghost btn-sm">Ver todas</Link>}
            />
            {recentTasks.length ? (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Atividade</th>
                      <th>Categoria</th>
                      <th>Prazo</th>
                      <th>Status</th>
                      <th>Evidência</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTasks.map((task) => (
                      <tr key={task.id}>
                        <td>
                          <Link href={`/atividades/${task.id}`} className="font-semibold text-pink hover:underline">
                            {task.title}
                          </Link>
                        </td>
                        <td className="text-xs text-pink/60">{task.categoryName}</td>
                        <td className="text-xs">
                          <span className={cn(isOverdue(task) ? "font-bold text-pink" : "text-pink/60")}>
                            {dueLabel(task.dueDate, task.dueTime)}
                          </span>
                        </td>
                        <td><StatusBadge status={task.status} /></td>
                        <td><PhotoBadge requirement={task.photoRequirement} count={task.photoCount} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={<ClipboardList className="h-6 w-6" />}
                title="Nenhuma atividade no mês"
                description="As rotinas serão exibidas aqui assim que forem geradas."
              />
            )}
          </Card>

          <Card>
            <CardHeader title="Evidências recentes" description="Fotos enviadas pela loja" icon={<Camera className="h-4 w-4" />} />
            <div className="p-5">
              {recentPhotos.length ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {recentPhotos.map((photo) => (
                    <Link key={photo.id} href={`/atividades/${photo.taskId}`} className="group overflow-hidden rounded-xl border border-pink/10 bg-turquesa/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo.url} alt="Evidência da loja" loading="lazy" className="aspect-[4/3] w-full object-cover transition group-hover:scale-[1.03]" />
                      <div className="p-2">
                        <p className="truncate text-[11px] font-semibold text-pink">{photo.uploadedByName}</p>
                        <p className="truncate text-[10px] text-pink/50">{formatDateTime(photo.createdAt)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState icon={<Camera className="h-6 w-6" />} title="Nenhuma evidência recente" description="As fotos enviadas pela loja aparecerão aqui." />
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Dados da loja" icon={<Building2 className="h-4 w-4" />} />
            <div className="space-y-3 p-5 text-sm">
              <InfoRow icon={<MapPin className="h-4 w-4" />} label="Código" value={store.code} />
              <InfoRow icon={<UserRound className="h-4 w-4" />} label="Gerente responsável" value={store.managerName ?? "Não vinculado"} />
              <InfoRow
                icon={<Users className="h-4 w-4" />}
                label="Supervisores"
                value={store.supervisors.length ? store.supervisors.map((item) => item.name).join(", ") : "Não vinculado"}
              />
              <InfoRow icon={<CalendarClock className="h-4 w-4" />} label="Cadastrada em" value={formatDate(store.createdAt)} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Acesso" description="Quem visualiza esta unidade" icon={<Users className="h-4 w-4" />} />
            <div className="space-y-3 p-5 text-xs text-pink/65">
              <p className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-turquesa" />
                A gerente comercial visualiza todas as lojas da rede.
              </p>
              <p className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-turquesa" />
                Supervisores visualizam apenas as lojas vinculadas ao seu perfil.
              </p>
              <p className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-turquesa" />
                O gerente de loja visualiza exclusivamente esta unidade.
              </p>
            </div>
          </Card>

          {canManage ? (
            <div className="flex flex-col gap-2">
              <Link href={`/lojas/${store.id}/editar`} className="btn-primary">
                <Pencil className="h-4 w-4" />
                Editar dados da loja
              </Link>
              <Link href={`/atividades?storeId=${store.id}`} className="btn-ghost">
                <ClipboardList className="h-4 w-4" />
                Abrir checklists da loja
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-pink/10 px-3 py-2 text-xs">
      <span className="text-pink/65">{label}</span>
      <span className="font-black text-pink">{value}</span>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-turquesa/15 text-pink">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-pink/45">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-pink/80">{value}</p>
      </div>
    </div>
  );
}

