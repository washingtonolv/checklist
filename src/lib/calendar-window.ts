import { addDays, parseDateKey, toDateKey } from "./dates";

export interface CalendarDay { date: string; count: number; complete: boolean }

export function calendarWindow(date: string, radius = 10): string[] {
  const center = parseDateKey(date);
  return Array.from({ length: radius * 2 + 1 }, (_, index) => toDateKey(addDays(center, index - radius)));
}

/** Retain adjacent days for uninterrupted scrolling, but never join distant date ranges. */
export function mergeCalendarDays(current: CalendarDay[], incoming: CalendarDay[], selected: string): CalendarDay[] {
  const overlap = incoming.some(day => current.some(existing => existing.date === day.date));
  const merged = new Map((overlap ? current : []).map(day => [day.date, day]));
  for (const day of incoming) merged.set(day.date, day);
  const bounds = calendarWindow(selected, 45);
  return [...merged.values()].filter(day => day.date >= bounds[0] && day.date <= bounds[bounds.length - 1]).sort((a, b) => a.date.localeCompare(b.date));
}
