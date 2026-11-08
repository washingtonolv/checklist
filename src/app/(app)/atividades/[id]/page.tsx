import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  Camera,
  CheckCircle2,
  ClipboardList,
  Clock3,
  History,
  Info,
  MessageSquare,
  ShieldCheck,
  Store,
  UserRound
} from "@/components/ui/illustrated-icons";
import { requireUser } from "@/lib/auth-server";
import { getBackend } from "@/lib/backend";
import { ACTION_LABELS, RECURRENCE_LABELS, STATUS_LABELS } from "@/lib/constants";
import { dueLabel, formatDate, formatDateTime, formatTime, isOverdue } from "@/lib/dates";
import type { TaskDetail } from "@/lib/types";
import { Card, CardHeader, PageHeader } from "@/components/ui";
import { PhotoBadge, StatusBadge } from "@/components/ui/badges";
import { PhotoGallery } from "@/components/photos/PhotoGallery";
import { PhotoUploader } from "@/components/photos/PhotoUploader";
import { TaskActions } from "@/components/tasks/TaskActions";
import { ObservationForm } from "@/components/tasks/ObservationForm";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TaskDetailPage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  const backend = getBackend();
  let task: TaskDetail | null = null;
  try {
    task = await backend.getTask(user, params.id);
  } catch {
    task = null;
  }
  if (!task) notFound();

  const canReview = user.role === "admin" || user.role === "supervisor";
  const canUpload = task.status !== "completed" || canReview;
  const overdue = isOverdue(task);
  const optimizedPhotos = task.photos.filter((photo) => !photo.isOriginal);
  const originalPhotos = task.photos.filter((photo) => photo.isOriginal);

  return (
    <div>
      <Link href="/atividades" className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-ink/70 hover:text-ink">
        <ArrowLeft className="h-4 w-4" />
        Voltar para atividades
      </Link>

      <PageHeader
        eyebrow={`${task.storeName} · ${task.storeCode}`}
        title={task.title}
        subtitle={task.description || "Sem descrição cadastrada."}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={task.status} />
            {overdue ? (
              <span className="badge border border-ink bg-pink/5 text-ink">
                <AlertTriangle className="h-3.5 w-3.5" />
                Atrasada
              </span>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">
        <div className="space-y-5">
          <Card>
            <CardHeader title="Detalhes da atividade" icon={<ClipboardList className="h-4 w-4" />} />
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <InfoRow icon={<Store className="h-4 w-4" />} label="Loja" value={`${task.storeName} (${task.storeCode})`} />
              <InfoRow icon={<ClipboardList className="h-4 w-4" />} label="Categoria" value={task.categoryName} />
              <InfoRow icon={<CalendarClock className="h-4 w-4" />} label="Periodicidade" value={RECURRENCE_LABELS[task.recurrence]} />
              <InfoRow icon={<Clock3 className="h-4 w-4" />} label="Prazo" value={dueLabel(task.dueDate, task.dueTime)} />
              <InfoRow icon={<Camera className="h-4 w-4" />} label="Evidência" value={<PhotoBadge requirement={task.photoRequirement} count={task.photoCount} />} />
              <InfoRow icon={<UserRound className="h-4 w-4" />} label="Responsável pela execução" value={task.completedByName ?? "Ainda não executada"} />
            </div>
            {task.observation ? (
              <div className="mx-5 mb-5 rounded-xl border border-ink/10 bg-turquesa/5 p-3 text-sm text-ink/75">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-ink/70">Última observação</p>
                {task.observation}
              </div>
            ) : null}
          </Card>

          <Card>
            <CardHeader
              title="Evidências fotográficas"
              description={`${optimizedPhotos.length} foto(s) · armazenamento seguro`}
              icon={<Camera className="h-4 w-4" />}
              action={<PhotoBadge requirement={task.photoRequirement} count={task.photoCount} />}
            />
            <div className="space-y-4 p-5">
              <PhotoGallery photos={task.photos} canDelete={user.role === "admin"} emptyMessage="Nenhuma evidência anexada até o momento." />
              {originalPhotos.length ? (
                <p className="text-[11px] text-ink/70">
                  {originalPhotos.length} arquivo(s) original(is) preservado(s) para auditoria.
                </p>
              ) : null}
              {canUpload ? (
                <div className="rounded-xl border border-dashed border-ink/20 bg-turquesa/5 p-3">
                  <PhotoUploader taskId={task.id} photoCount={task.photoCount} required={task.photoRequirement === "required"} />
                </div>
              ) : (
                <p className="rounded-xl border border-ink/15 bg-pink/5 px-3 py-2 text-xs text-ink/70">
                  Atividade concluída. A inclusão de novas evidências exige reabertura pela supervisão.
                </p>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Observações"
              description="Registros da loja e da supervisão"
              icon={<MessageSquare className="h-4 w-4" />}
            />
            <div className="space-y-4 p-5">
              {task.observations.length ? (
                <div className="space-y-3">
                  {task.observations.map((observation) => (
                    <div key={observation.id} className="rounded-xl border border-ink/10 p-3">
                      <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-[11px] text-ink/70">
                        <span className="font-bold text-ink/70">{observation.userName}</span>
                        <span>{formatDateTime(observation.createdAt)}</span>
                      </div>
                      <p className="text-sm text-ink/75">{observation.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-ink/70">Nenhuma observação registrada.</p>
              )}
              <ObservationForm taskId={task.id} />
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Histórico da execução"
              description="Quem fez, quando e com quais evidências"
              icon={<History className="h-4 w-4" />}
            />
            <div className="p-5">
              {task.executions.length ? (
                <ol className="relative space-y-5 border-l border-ink/15 pl-5">
                  {task.executions.map((execution) => (
                    <li key={execution.id} className="relative">
                      <span className="absolute -left-[27px] top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white bg-turquesa" />
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-bold text-ink">{ACTION_LABELS[execution.action] ?? execution.action}</p>
                        <span className="text-[11px] text-ink/70">{formatDateTime(execution.createdAt)}</span>
                      </div>
                      <p className="text-[11px] text-ink/70">
                        {execution.userName}
                        {execution.previousStatus && execution.newStatus && execution.previousStatus !== execution.newStatus
                          ? ` · ${STATUS_LABELS[execution.previousStatus]} → ${STATUS_LABELS[execution.newStatus]}`
                          : ""}
                      </p>
                      {execution.note ? <p className="mt-1 text-sm text-ink/70">{execution.note}</p> : null}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-ink/70">Nenhum evento registrado.</p>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Ações" description="Execute e revise esta atividade" icon={<ShieldCheck className="h-4 w-4" />} />
            <div className="p-5">
              <TaskActions
                taskId={task.id}
                status={task.status}
                photoCount={task.photoCount}
                photoRequired={task.photoRequirement === "required"}
                canReview={canReview}
                approved={Boolean(task.approvedAt)}
              />
            </div>
          </Card>

          <Card>
            <CardHeader title="Resumo" icon={<Info className="h-4 w-4" />} />
            <div className="space-y-3 p-5 text-sm">
              <SummaryRow label="Prazo" value={`${formatDate(task.dueDate)} às ${formatTime(task.dueTime)}`} />
              <SummaryRow label="Concluída em" value={task.completedAt ? formatDateTime(task.completedAt) : "—"} />
              <SummaryRow label="Aprovada em" value={task.approvedAt ? formatDateTime(task.approvedAt) : "Aguardando revisão"} />
              <SummaryRow label="Fotos" value={`${task.photoCount} evidência(s)`} />
              <SummaryRow label="Período" value={task.periodKey} />
              {task.approvedAt ? (
                <p className="flex items-center gap-2 rounded-lg border border-turquesa/40 bg-turquesa/10 px-3 py-2 text-xs font-semibold text-ink">
                  <CheckCircle2 className="h-4 w-4" />
                  Execução aprovada
                </p>
              ) : null}
            </div>
          </Card>

          <Card>
            <CardHeader title="Regras de segurança" icon={<ShieldCheck className="h-4 w-4" />} />
            <ul className="space-y-2 p-5 text-xs text-ink/70">
              <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-turquesa" />A conclusão é registrada com usuário, data e hora.</li>
              <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-turquesa" />Fotos obrigatórias bloqueiam a conclusão sem evidência.</li>
              <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-turquesa" />Correções e reprovações mantêm o histórico anterior.</li>
              <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-turquesa" />Somente a gerente comercial pode excluir evidências.</li>
            </ul>
          </Card>

          <Link href={`/lojas/${task.storeId}`} className={cn("btn-ghost w-full")}>
            <Store className="h-4 w-4" />
            Abrir histórico da loja
          </Link>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-turquesa/15 text-ink">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-ink/70">{label}</p>
        <div className="mt-0.5 text-sm font-semibold text-ink/80">{value}</div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-ink/10 pb-2 last:border-0">
      <span className="text-xs text-ink/70">{label}</span>
      <span className="text-right text-xs font-semibold text-ink/80">{value}</span>
    </div>
  );
}

