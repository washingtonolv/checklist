import Link from "next/link";
import { getBackend } from "@/lib/backend";
import type { SessionUser } from "@/lib/types";
import { addDays, startOfWeek, parseDateKey, toDateKey, formatDate } from "@/lib/dates";
import { storeToday, validRoutineDate, routinePriority } from "@/lib/manager-routine";
import { Avatar, ProgressBar } from "@/components/ui";
import { IBM_Plex_Sans } from "next/font/google";
import { ClipboardCheck, Camera, ArrowUpRight, ArrowLeft, ArrowRight, CheckCircle2, RotateCcw, Clock3, ListChecks, LayoutDashboard, UserRound } from "lucide-react";

const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], display: "swap", variable: "--font-manager" });

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
  return <div className={`manager-routine ${plex.variable}`}>
    {user.role !== "manager" && <p className="routine-notice">Prévia da experiência do gerente · mostrando {store?.name ?? "loja não vinculada"}. Os dados abaixo são do ambiente de demonstração.</p>}
    <div className="routine-heading">
      <div><h1>Olá, {user.name.split(" ")[0]}</h1><p className="routine-store">{store?.name ?? "Minha loja"}</p><p className="routine-intro">Uma tarefa de cada vez. Uma loja sempre em ordem.</p></div>
      <Link href="/perfil" aria-label="Abrir meu perfil" className="routine-avatar"><Avatar userId={user.id} name={user.name} size={64} /></Link>
    </div>
    <section aria-label="Seleção de dia" className="routine-calendar">
      <div className="routine-calendar-toolbar"><h2>{new Intl.DateTimeFormat("pt-BR",{month:"long",year:"numeric"}).format(parseDateKey(date))}</h2><div><Link href={`${basePath}?data=${toDateKey(addDays(start,-7))}`} aria-label="Semana anterior" className="btn-ghost btn-sm"><ArrowLeft /></Link><Link href={basePath} className="btn-ghost btn-sm">Hoje</Link><Link href={`${basePath}?data=${toDateKey(addDays(start,7))}`} aria-label="Próxima semana" className="btn-ghost btn-sm"><ArrowRight /></Link></div></div>
      <div className="routine-week">{week.map(day => {
        const items = tasks.filter(t => t.dueDate === day);
        const complete = items.length > 0 && items.every(t => t.status === "completed");
        const selected = day === date;
        return <Link key={day} href={`${basePath}?data=${day}`} aria-label={`${formatDate(day)}${day === today ? ", hoje" : ""}, ${items.length} atividades${complete ? ", todas concluídas" : ""}`} aria-current={selected ? "date" : undefined} className="routine-day"><span className="routine-weekday">{new Intl.DateTimeFormat("pt-BR",{weekday:"short"}).format(parseDateKey(day)).replace(".","")}</span><span className="routine-date">{Number(day.slice(-2))}</span><span aria-hidden="true" data-state={complete ? "complete" : items.length ? "pending" : "empty"} className="routine-day-status" /></Link>;
      })}</div>
    </section>
    <section className="routine-section-heading"><h2 className="routine-section-title">{heading}</h2><Link href={allHref} className="routine-all">Ver todas</Link></section>
    <section className="routine-hero" aria-label="Próxima ação">
      <div className="routine-hero-copy"><span className="routine-step"><ClipboardCheck className="routine-icon" />{next ? correcting ? "Correção solicitada" : "Seu próximo passo" : dayTasks.length ? "Rotina em dia" : "Tudo tranquilo"}</span>
        <h3 className="routine-task-title">{next ? next.title : dayTasks.length ? "Bom trabalho. Tudo concluído!" : "Nenhuma atividade para esta data."}</h3>
        <p className="routine-description">{next ? next.description || "Abra a atividade para conferir as orientações e registrar a execução." : review ? `${review} atividade(s) aguardam a revisão da supervisão.` : "Confira as próximas datas e acompanhe a rotina da sua loja."}</p>
        {next && <p className="routine-metadata"><span className="routine-inline"><Clock3 className="routine-icon" />{formatDate(next.dueDate).slice(0,5)} · até {next.dueTime.slice(0,5)}</span>{next.photoRequirement === "required" && <span className="routine-inline"><Camera className="routine-icon" />Foto obrigatória</span>}</p>}
      </div>
      <Link href={next ? `/atividades/${next.id}` : allHref} className="btn-primary routine-action">{next ? correcting ? "Corrigir atividade" : next.status === "in_progress" ? "Continuar atividade" : "Abrir atividade" : "Consultar atividades"}<ArrowUpRight className="routine-icon" /></Link>
    </section>
    <section className="card routine-progress" aria-label="Progresso do dia"><div className="routine-progress-heading"><div><h2 className="routine-card-title">Seu progresso no dia</h2><p className="routine-caption">{dayTasks.length ? `${done} de ${dayTasks.length} atividades concluídas` : "Sem atividades previstas para esta data"}</p></div><span className="routine-number">{dayTasks.length ? Math.round(done/dayTasks.length*100) : 0}<span className="routine-percent">%</span></span></div><ProgressBar value={dayTasks.length ? done/dayTasks.length*100 : 0} label="Conclusão das atividades da data selecionada" />{isToday && priority.remaining > dayTasks.length-done && <p className="routine-progress-note">O próximo passo também considera pendências de dias anteriores.</p>}</section>
    <div className="routine-section-heading"><h2 className="routine-section-title">Acompanhe também</h2><span className="routine-caption">Sem perder o foco</span></div>
    <div className="routine-links">
      <Link href={`/atividades?${new URLSearchParams({...(store ? {storeId:store.id}:{}),...(isToday ? {} : {from:date}),to:date,status:"correction_requested"})}`} className="card routine-link"><RotateCcw className="routine-link-icon" /><h3 className="routine-card-title">Precisam de correção</h3><p className="routine-caption">{priority.corrections} para ajustar</p></Link>
      <Link href={`${allHref}&status=completed`} className="card routine-link"><CheckCircle2 className="routine-link-icon" /><h3 className="routine-card-title">Enviadas para revisão</h3><p className="routine-caption">{review} aguardando · {done} concluídas</p></Link>
      <Link href={allHref} className="card routine-link"><ListChecks className="routine-link-icon" /><h3 className="routine-card-title">Todas as atividades</h3><p className="routine-caption">Consulte a lista completa do dia</p></Link>
    </div>
    <nav aria-label="Navegação da rotina" className="routine-mobile-nav"><Link href={basePath} aria-current="page" className="routine-nav-link"><LayoutDashboard className="routine-icon" />Hoje</Link><Link href={allHref} className="routine-nav-link"><ListChecks className="routine-icon" />Atividades</Link><Link href="/perfil" className="routine-nav-link"><UserRound className="routine-icon" />Perfil</Link></nav>
  </div>;
}
