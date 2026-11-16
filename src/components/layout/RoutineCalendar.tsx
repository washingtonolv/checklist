"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOptimistic, useRef, useState, useTransition, type MouseEvent, type PointerEvent } from "react";
import { addDays, formatDate, parseDateKey, toDateKey } from "@/lib/dates";
import { calendarSwipe } from "@/lib/calendar-gesture";

export function RoutineCalendar({ date, today, basePath, days }: {
  date: string;
  today: string;
  basePath: string;
  days: { date: string; count: number; complete: boolean }[];
}) {
  const router = useRouter();
  const [selectedDate, selectDate] = useOptimistic(date);
  const [pending, startTransition] = useTransition();
  const [dragOffset, setDragOffset] = useState(0);
  const gesture = useRef<{ id: number; x: number; y: number; width: number; dragging: boolean } | null>(null);
  const suppressClickUntil = useRef(0);
  const index = days.findIndex(day => day.date === selectedDate);
  const hrefFor = (day: string) => `${basePath}?data=${day}`;

  function changeDate(day: string) {
    if (day === selectedDate) return;
    startTransition(() => {
      selectDate(day);
      router.push(hrefFor(day), { scroll: false });
    });
  }

  function navigate(event: MouseEvent<HTMLAnchorElement>, day: string) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    changeDate(day);
  }

  function beginDrag(event: PointerEvent<HTMLDivElement>) {
    suppressClickUntil.current = 0;
    if (pending || event.button !== 0 || !event.isPrimary || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, width: event.currentTarget.clientWidth, dragging: false };
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    const current = gesture.current;
    if (!current || current.id !== event.pointerId) return;
    const dx = event.clientX - current.x, dy = event.clientY - current.y;
    if (!current.dragging) {
      if (Math.abs(dy) > 8 && Math.abs(dy) >= Math.abs(dx)) { gesture.current = null; return; }
      if (Math.abs(dx) < 8 || Math.abs(dx) <= Math.abs(dy) * 1.2) return;
      current.dragging = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    if (event.cancelable) event.preventDefault();
    setDragOffset(Math.max(-current.width * .65, Math.min(current.width * .65, dx)));
  }

  function endDrag(event: PointerEvent<HTMLDivElement>, cancelled = false) {
    const current = gesture.current;
    if (!current || current.id !== event.pointerId) return;
    gesture.current = null;
    setDragOffset(0);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (!current.dragging) return;
    suppressClickUntil.current = Date.now() + 350;
    if (!cancelled) {
      const direction = calendarSwipe(event.clientX - current.x, event.clientY - current.y, current.width);
      if (direction) changeDate(direction === "next" ? next : previous);
    }
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
      <div className="routine-calendar-viewport">
      <div className="routine-calendar-track relative grid grid-cols-7" data-dragging={dragOffset !== 0} style={{ transform: `translateX(${dragOffset}px)` }}
        onPointerDown={beginDrag} onPointerMove={moveDrag} onPointerUp={event => endDrag(event)} onPointerCancel={event => endDrag(event, true)}
        onLostPointerCapture={event => endDrag(event, true)} onDragStart={event => event.preventDefault()}
        onClickCapture={event => { if (event.detail > 0 && Date.now() < suppressClickUntil.current) { event.preventDefault(); event.stopPropagation(); } }}>
        <div aria-hidden="true" className="routine-calendar-indicator" style={{ transform: `translateX(${Math.max(0, index) * 100}%)`, opacity: index < 0 ? 0 : 1 }} />
        {days.map(day => {
          const selected = day.date === selectedDate;
          return (
            <Link key={day.date} href={hrefFor(day.date)} scroll={false} prefetch={false} draggable={false} onClick={event => navigate(event, day.date)} aria-label={`${formatDate(day.date)}${day.date === today ? ", hoje" : ""}, ${day.count} atividades`} aria-current={selected ? "date" : undefined} className="routine-day relative z-10 grid min-w-0 justify-items-center gap-2 rounded-lg py-1 text-ink">
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
