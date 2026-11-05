export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDateKey(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // segunda-feira
  return addDays(d, diff);
}

export function endOfWeek(date: Date): Date {
  return addDays(startOfWeek(date), 6);
}

export function isoWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export function periodForRecurrence(
  recurrence: "daily" | "weekly" | "monthly" | "once",
  date: Date
): { periodKey: string; dueDate: string } {
  if (recurrence === "daily") {
    return { periodKey: toDateKey(date), dueDate: toDateKey(date) };
  }
  if (recurrence === "weekly") {
    return { periodKey: isoWeekKey(date), dueDate: toDateKey(endOfWeek(date)) };
  }
  if (recurrence === "monthly") {
    return {
      periodKey: toDateKey(startOfMonth(date)).slice(0, 7),
      dueDate: toDateKey(endOfMonth(date))
    };
  }
  return { periodKey: "once", dueDate: toDateKey(date) };
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = value.length === 10 ? parseDateKey(value) : new Date(value);
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function formatTime(value: string | null | undefined): string {
  if (!value) return "—";
  return value.slice(0, 5);
}

export function isOverdue(task: { dueDate: string; dueTime: string; status: string }, now = new Date()): boolean {
  if (task.status === "completed") return false;
  const due = new Date(`${task.dueDate}T${(task.dueTime || "23:59").slice(0, 5)}:00`);
  return due.getTime() < now.getTime();
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function monthRange(date = new Date()): { from: string; to: string } {
  return { from: toDateKey(startOfMonth(date)), to: toDateKey(endOfMonth(date)) };
}

export function lastNDaysRange(days: number): { from: string; to: string } {
  return { from: toDateKey(addDays(new Date(), -(days - 1))), to: toDateKey(new Date()) };
}

export function dueLabel(dueDate: string, dueTime: string): string {
  const today = todayKey();
  if (dueDate === today) return `Hoje, ${formatTime(dueTime)}`;
  const tomorrow = toDateKey(addDays(new Date(), 1));
  if (dueDate === tomorrow) return `Amanhã, ${formatTime(dueTime)}`;
  return `${formatDate(dueDate)} · ${formatTime(dueTime)}`;
}

