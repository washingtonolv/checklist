import Link from "next/link";
import { getBackend } from "@/lib/backend";
import type { SessionUser } from "@/lib/types";
import { addDays, startOfWeek, parseDateKey, toDateKey, formatDate } from "@/lib/dates";
import { storeToday, validRoutineDate, routinePriority } from "@/lib/manager-routine";
import { ProgressBar } from "@/components/ui";
import { ClipboardCheck, Camera, ArrowUpRight, CheckCircle2, RotateCcw, Clock3, ListChecks, LayoutDashboard, UserRound } from "@/components/ui/illustrated-icons";
import { LoginIllustration } from "@/components/auth/LoginIllustration";

export async function ManagerRoutine({ user, date: requestedDate, basePath = "/rotina" }: { user: SessionUser; date?: string; basePath?: string }) {
  const today = storeToday();
  const date = validRoutineDate(requestedDate, today);
  const backend = getBackend();
  const stores = await backend.listStores(user);
  const store = stores.find(s => s.active) ?? stores[0];
  const start = startOfWeek(parseDateKey(date));
  const week = Array.from({ length: 7 }, (_, i) => toDateKey(addDays(start, i)));
  const tasks = store ? await backend.listTasks(user, {storeId: store.id, to: week[6]}) : [];
  const dayTasks = tasks.filter(t => t.dueDate === date);
  const done = dayTasks.filter(t => t.status === "completed").length;
  const review = dayTasks.filter(t => t.status === "completed" && !t.approvedAt).length;
  const priority = routinePriority(tasks, date, today);
  const next = priority.next;
  const correcting = next && (next.status === "correction_requested" || next.status === "rejected");
  const query = new URLSearchParams({from:date, to:date, ...(store ? {storeId: store.id} : {})});
  const allHref = `/atividades?${query}`;
  const isToday = date === today;
  const heading = isToday ? "Sua rotina de hoje" : `Sua rotina · ${formatDate(date).slice(0,5)}`;
  return <div className="manager-routine mx-auto max-w-[1000px] pb-20 lg:pb-4">
    {user.role !== "manager" && <p className="mb-5 rounded-xl border border-line px-4 py-3 text-xs text-ink/70">Prévia da experiência do gerente · mostrando {store?.name ?? "loja não vinculada"}. Os dados abaixo são do ambiente de demonstração.</p>}
    <div className="mb-7 flex items-start justify-between gap-4">
      <div><p className="mb-1 text-xs font-semibold text-ink/60">{store?.name ?? "Minha loja"}</p><h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Olá, {user.name.split(" ")[0]}<span className="text-[#CD4664]">.</span></h1><p className="mt-2 text-sm text-ink/65">Uma tarefa de cada vez. Uma loja sempre em ordem.</p></div>
      <Link href="/perfil" aria-label="Abrir meu perfil" className="btn-secondary rounded-full px-3"><UserRound className="h-5 w-5" /><span className="hidden sm:inline">Meu perfil</span></Link>
    </div>
    <section aria-label="Seleção de dia" className="mb-7">
      <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold">{new Intl.DateTimeFormat("pt-BR",{month:"long",year:"numeric"}).format(parseDateKey(date)).replace(/^./, letter => letter.toLocaleUpperCase("pt-BR"))}</h2><div className="flex items-center gap-0"><Link href={`${basePath}?data=${toDateKey(addDays(start,-7))}`} aria-label="Semana anterior" className="btn-ghost btn-sm border-0 px-2">←</Link><Link href={basePath} className="btn-ghost btn-sm border-0 px-2">Hoje</Link><Link href={`${basePath}?data=${toDateKey(addDays(start,7))}`} aria-label="Próxima semana" className="btn-ghost btn-sm border-0 px-2">→</Link></div></div>
      <div className="grid grid-cols-7 gap-1.5 sm:gap-3">{week.map(day => {
        const items = tasks.filter(t => t.dueDate === day);
        const complete = items.length > 0 && items.every(t => t.status === "completed");
        const selected = day === date;
        return <Link key={day} href={`${basePath}?data=${day}`} aria-label={`${formatDate(day)}${day === today ? ", hoje" : ""}, ${items.length} atividades`} aria-current={selected ? "date" : undefined} className="routine-day flex min-h-[84px] min-w-0 flex-col items-center justify-center gap-2 rounded-lg py-1 text-ink"><span className={`text-xs ${selected ? "font-semibold text-ink" : "font-medium text-ink/60"}`}>{new Intl.DateTimeFormat("pt-BR",{weekday:"short"}).format(parseDateKey(day)).replace(".","")}</span><span className={`flex aspect-square w-full max-w-[64px] items-center justify-center rounded-full text-xl font-semibold ${selected ? "bg-[#CD4664] text-white" : "bg-surface text-ink hover:bg-canvas"}`}>{Number(day.slice(-2))}</span><span aria-hidden="true" className={`h-1 w-1 rounded-full ${selected ? "bg-[#CD4664]" : complete ? "bg-[#05918C]" : items.length ? "bg-[#CD4664]" : "bg-[#E5E5E5]"}`} /></Link>;
      })}</div>
    </section>
    <section className="mb-5 flex items-center justify-between"><h2 className="text-lg font-semibold tracking-tight">{heading}</h2><Link href={allHref} className="inline-flex min-h-11 items-center text-xs font-semibold text-ink/65 underline underline-offset-4">Ver todas</Link></section>
    <section className="routine-hero relative mb-6 overflow-hidden rounded-[24px] border border-[#F5DAE0] bg-[#FAEDF0] p-6 sm:p-8" aria-label="Próxima ação">
      <div className="relative z-10 max-w-[540px] sm:pr-32"><span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1.5 text-[11px] font-semibold text-ink/75"><ClipboardCheck className="h-4 w-4" />{next ? correcting ? "Correção solicitada" : "Seu próximo passo" : dayTasks.length ? "Rotina em dia" : "Tudo tranquilo"}</span>
        <h3 className="text-2xl font-semibold leading-tight tracking-tight text-ink sm:text-3xl">{next ? next.title : dayTasks.length ? "Bom trabalho. Tudo concluído!" : "Nenhuma atividade para esta data."}</h3>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink/70">{next ? next.description || "Abra a atividade para conferir as orientações e registrar a execução." : review ? `${review} atividade(s) aguardam a revisão da supervisão.` : "Confira as próximas datas e acompanhe a rotina da sua loja."}</p>
        {next && <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-ink/75"><span className="inline-flex items-center gap-1.5"><Clock3 className="h-4 w-4" />{formatDate(next.dueDate).slice(0,5)} · até {next.dueTime.slice(0,5)}</span>{next.photoRequirement === "required" && <span className="inline-flex items-center gap-1.5"><Camera className="h-4 w-4" />Foto obrigatória</span>}</p>}
      </div>
      <div className="routine-art pointer-events-none absolute -right-10 bottom-5 w-[240px] opacity-15 sm:bottom-12 sm:right-0 sm:opacity-100" aria-hidden="true"><LoginIllustration /></div>
      <Link href={next ? `/atividades/${next.id}` : allHref} className="btn-primary relative z-10 mt-7 w-full justify-between rounded-full px-5 sm:w-auto sm:min-w-[260px]">{next ? correcting ? "Corrigir atividade" : next.status === "in_progress" ? "Continuar atividade" : "Abrir atividade" : "Consultar atividades"}<ArrowUpRight className="h-4 w-4" /></Link>
    </section>
    <section className="card mb-8 p-5 sm:p-6" aria-label="Progresso do dia"><div className="mb-3 flex items-center justify-between gap-4"><div><h2 className="text-sm font-semibold">Seu progresso no dia</h2><p className="mt-1 text-xs text-ink/65">{dayTasks.length ? `${done} de ${dayTasks.length} atividades concluídas` : "Sem atividades previstas para esta data"}</p></div><span className="text-2xl font-semibold tracking-tight">{dayTasks.length ? Math.round(done/dayTasks.length*100) : 0}<span className="text-sm text-ink/60">%</span></span></div><ProgressBar value={dayTasks.length ? done/dayTasks.length*100 : 0} label="Conclusão das atividades da data selecionada" />{isToday && priority.remaining > dayTasks.length-done && <p className="mt-3 text-xs text-ink/65">O próximo passo também considera pendências de dias anteriores.</p>}</section>
    <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-semibold tracking-tight">Acompanhe também</h2><span className="text-xs text-ink/60">Sem perder o foco</span></div>
    <div className="grid gap-3 sm:grid-cols-3">
      <Link href={`/atividades?${new URLSearchParams({...(store ? {storeId:store.id}:{}),...(isToday ? {} : {from:date}),to:date,status:"correction_requested"})}`} className="card p-5 hover:border-[#CD4664]/30"><RotateCcw className="mb-3 h-5 w-5" /><h3 className="text-sm font-semibold">Precisam de correção</h3><p className="mt-1 text-xs text-ink/65">{priority.corrections} para ajustar</p></Link>
      <Link href={`${allHref}&status=completed`} className="card p-5 hover:border-[#CD4664]/30"><CheckCircle2 className="mb-3 h-5 w-5" /><h3 className="text-sm font-semibold">Enviadas para revisão</h3><p className="mt-1 text-xs text-ink/65">{review} aguardando · {done} concluídas</p></Link>
      <Link href={allHref} className="card p-5 hover:border-[#CD4664]/30"><ListChecks className="mb-3 h-5 w-5" /><h3 className="text-sm font-semibold">Todas as atividades</h3><p className="mt-1 text-xs text-ink/65">Consulte a lista completa do dia</p></Link>
    </div>
    <nav aria-label="Navegação da rotina" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-line bg-white/95 px-4 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"><Link href={basePath} aria-current="page" className="flex min-h-[64px] flex-col items-center justify-center gap-1 text-[10px] font-semibold text-[#CD4664]"><LayoutDashboard className="h-5 w-5" />Hoje</Link><Link href={allHref} className="flex min-h-[64px] flex-col items-center justify-center gap-1 text-[10px] font-medium"><ListChecks className="h-5 w-5" />Atividades</Link><Link href="/perfil" className="flex min-h-[64px] flex-col items-center justify-center gap-1 text-[10px] font-medium"><UserRound className="h-5 w-5" />Perfil</Link></nav>
  </div>;
}
