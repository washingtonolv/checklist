"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useOptimistic, useRef, useState, useTransition, type MouseEvent } from "react";
import { addDays, formatDate, parseDateKey, toDateKey } from "@/lib/dates";
import { calendarWindow, mergeCalendarDays, type CalendarDay } from "@/lib/calendar-window";

function centerSelected(viewport: HTMLDivElement, behavior: ScrollBehavior) {
  if (behavior === "smooth" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) behavior = "auto";
  const selected = viewport.querySelector<HTMLElement>('.routine-day[aria-current="date"]');
  if (selected) viewport.scrollTo({ left: Math.max(0, selected.offsetLeft + selected.offsetWidth / 2 - viewport.clientWidth / 2), behavior });
}

export function RoutineCalendar({ date, today, basePath, days }: {
  date: string;
  today: string;
  basePath: string;
  days: CalendarDay[];
}) {
  const router = useRouter();
  const [selectedDate, selectDate] = useOptimistic(date);
  const [pending, startTransition] = useTransition();
  // The server first displays the correct seven days, before client hydration.
  const [bufferedDays, setBufferedDays] = useState(() => {
    const visible = new Set(calendarWindow(date, 3));
    return days.filter(day => visible.has(day.date));
  });
  const viewportRef = useRef<HTMLDivElement>(null);
  const firstDateRef = useRef<string | null>(null);
  const hrefFor = (day: string) => `${basePath}?data=${day}`;

  useEffect(() => {
    setBufferedDays(current => mergeCalendarDays(current, days, date));
  }, [days, date]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const first = bufferedDays[0]?.date;
    if (!viewport || !first) return;
    const previousFirst = firstDateRef.current;
    // Compensate for prepended days before painting, then continue centering.
    if (previousFirst && previousFirst !== first) {
      const added = (Date.parse(`${previousFirst}T12:00:00Z`) - Date.parse(`${first}T12:00:00Z`)) / 86400000;
      const dayWidth = viewport.querySelector<HTMLElement>('.routine-day')?.getBoundingClientRect().width ?? viewport.clientWidth / 7;
      viewport.scrollLeft += added * dayWidth;
    }
    centerSelected(viewport, !previousFirst ? "auto" : "smooth");
    firstDateRef.current = first;
  }, [selectedDate, bufferedDays]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new ResizeObserver(() => centerSelected(viewport, "auto"));
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  function navigate(event: MouseEvent<HTMLAnchorElement>, day: string) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (day === selectedDate) { if (viewportRef.current) centerSelected(viewportRef.current, "smooth"); return; }
    startTransition(() => {
      selectDate(day);
      router.push(hrefFor(day), { scroll: false });
    });
  }

  const previous = toDateKey(addDays(parseDateKey(selectedDate), -7));
  const next = toDateKey(addDays(parseDateKey(selectedDate), 7));
  return (
    <section aria-label="Seleção de dia" className="routine-calendar mb-7" aria-busy={pending}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">{new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(parseDateKey(selectedDate)).replace(/^./, letter => letter.toLocaleUpperCase("pt-BR"))}</h2>
        <div className="flex items-center">
          <Link href={hrefFor(previous)} scroll={false} prefetch={false} onClick={event => navigate(event, previous)} aria-label="Semana anterior" className="btn-ghost btn-sm border-0 px-2">←</Link>
          <Link href={hrefFor(today)} scroll={false} prefetch={false} onClick={event => navigate(event, today)} className="btn-ghost btn-sm border-0 px-2">Hoje</Link>
          <Link href={hrefFor(next)} scroll={false} prefetch={false} onClick={event => navigate(event, next)} aria-label="Próxima semana" className="btn-ghost btn-sm border-0 px-2">→</Link>
        </div>
      </div>
      <div ref={viewportRef} className="routine-calendar-viewport">
        <div className="routine-calendar-track">
          {bufferedDays.map(day => {
            const selected = day.date === selectedDate;
            return (
              <Link key={day.date} href={hrefFor(day.date)} scroll={false} prefetch={false} draggable={false} onClick={event => navigate(event, day.date)} aria-label={`${formatDate(day.date)}${day.date === today ? ", hoje" : ""}, ${day.count} atividades`} aria-current={selected ? "date" : undefined} className="routine-day grid min-w-0 justify-items-center gap-2 rounded-lg py-1 text-ink">
                <span className={`text-xs ${selected ? "font-semibold text-ink" : "font-medium text-ink/60"}`}>{new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(parseDateKey(day.date)).replace(".", "")}</span>
                <span className={`routine-date-number flex items-center justify-center rounded-full text-xl ${selected ? "font-semibold" : "font-medium"}`}>{Number(day.date.slice(-2))}</span>
                <span aria-hidden="true" className={`h-1 w-1 rounded-full ${selected ? "bg-[#CD4664]" : day.complete ? "bg-[#05918C]" : day.count ? "bg-[#CD4664]" : "bg-[#E5E5E5]"}`} />
              </Link>
            );
          })}
        </div>
      </div>
      <p role="status" className="sr-only">{pending ? "Carregando atividades da data selecionada." : `Atividades de ${formatDate(date)} carregadas.`}</p>
    </section>
  );
}
