"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOptimistic, useTransition, type MouseEvent } from "react";
import { addDays, formatDate, parseDateKey, toDateKey } from "@/lib/dates";

export function RoutineCalendar({ date, today, basePath, days }: {
  date: string;
  today: string;
  basePath: string;
  days: { date: string; count: number; complete: boolean }[];
}) {
  const router = useRouter();
  const [selectedDate, selectDate] = useOptimistic(date);
  const [pending, startTransition] = useTransition();
  const index = days.findIndex(day => day.date === selectedDate);
  const hrefFor = (day: string) => `${basePath}?data=${day}`;

  function navigate(event: MouseEvent<HTMLAnchorElement>, day: string) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (day === selectedDate) return;
    startTransition(() => {
      selectDate(day);
      router.push(hrefFor(day), { scroll: false });
    });
  }

  const previous = toDateKey(addDays(parseDateKey(days[0].date), -7));
  const next = toDateKey(addDays(parseDateKey(days[0].date), 7));
  return (
    <section aria-label="Seleção de dia" className="routine-calendar mb-7" aria-busy={pending}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">{new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(parseDateKey(date)).replace(/^./, letter => letter.toLocaleUpperCase("pt-BR"))}</h2>
        <div className="flex items-center">
          <Link href={hrefFor(previous)} scroll={false} prefetch={false} onClick={event => navigate(event, previous)} aria-label="Semana anterior" className="btn-ghost btn-sm border-0 px-2">←</Link>
          <Link href={hrefFor(today)} scroll={false} prefetch={false} onClick={event => navigate(event, today)} className="btn-ghost btn-sm border-0 px-2">Hoje</Link>
          <Link href={hrefFor(next)} scroll={false} prefetch={false} onClick={event => navigate(event, next)} aria-label="Próxima semana" className="btn-ghost btn-sm border-0 px-2">→</Link>
        </div>
      </div>
      <div className="routine-calendar-track relative grid grid-cols-7">
        <div aria-hidden="true" className="routine-calendar-indicator" style={{ transform: `translateX(${Math.max(0, index) * 100}%)`, opacity: index < 0 ? 0 : 1 }} />
        {days.map(day => {
          const selected = day.date === selectedDate;
          return (
            <Link key={day.date} href={hrefFor(day.date)} scroll={false} prefetch={false} onClick={event => navigate(event, day.date)} aria-label={`${formatDate(day.date)}${day.date === today ? ", hoje" : ""}, ${day.count} atividades`} aria-current={selected ? "date" : undefined} className="routine-day relative z-10 grid min-w-0 justify-items-center gap-2 rounded-lg py-1 text-ink">
              <span className={`text-xs ${selected ? "font-semibold text-ink" : "font-medium text-ink/60"}`}>{new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(parseDateKey(day.date)).replace(".", "")}</span>
              <span className={`routine-date-number flex items-center justify-center rounded-full text-xl ${selected ? "font-semibold" : "font-medium"}`}>{Number(day.date.slice(-2))}</span>
              <span aria-hidden="true" className={`h-1 w-1 rounded-full ${selected ? "bg-[#CD4664]" : day.complete ? "bg-[#05918C]" : day.count ? "bg-[#CD4664]" : "bg-[#E5E5E5]"}`} />
            </Link>
          );
        })}
      </div>
      <p role="status" className="sr-only">{pending ? "Carregando atividades da data selecionada." : `Atividades de ${formatDate(date)} carregadas.`}</p>
    </section>
  );
}
