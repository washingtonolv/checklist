import type { Task } from "./types";

export function storeToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const part = (type: string) => parts.find(p => p.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}
export function validRoutineDate(value: unknown, fallback: string) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return fallback;
  const parsed = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0,10) === value ? value : fallback;
}
export function routinePriority(tasks: Task[], date: string, today: string, now = new Date()) {
  const time = new Intl.DateTimeFormat("en-GB", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(now);
  const overdue = (task: Task) => task.dueDate < today || (task.dueDate === today && task.dueTime.slice(0,5) < time);
  const relevant = tasks.filter(t => t.status !== "completed" && (t.dueDate === date || (date === today && t.dueDate < date)));
  const score = (t: Task) => t.status === "correction_requested" || t.status === "rejected" ? 0 : overdue(t) ? 1 : 2;
  const ordered = [...relevant].sort((a,b) => score(a)-score(b) || `${a.dueDate}${a.dueTime}`.localeCompare(`${b.dueDate}${b.dueTime}`) || a.id.localeCompare(b.id));
  return { next: ordered[0], remaining: relevant.length, corrections: relevant.filter(t => t.status === "correction_requested").length, overdue: relevant.filter(overdue).length };
}
