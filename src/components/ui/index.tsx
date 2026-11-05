import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Card({
  children,
  className,
  as: Component = "div"
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
}) {
  return <Component className={cn("card", className)}>{children}</Component>;
}

export function CardHeader({
  title,
  description,
  action,
  icon
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-pink/10 px-5 py-4">
      <div className="flex items-start gap-3">
        {icon ? (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-turquesa/15 text-pink">
            {icon}
          </span>
        ) : null}
        <div>
          <h2 className="text-base font-bold text-pink">{title}</h2>
          {description ? <p className="mt-0.5 text-xs text-pink/60">{description}</p> : null}
        </div>
      </div>
      {action}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
  eyebrow
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow ? (
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-pink/45">{eyebrow}</p>
        ) : null}
        <h1 className="text-2xl font-black tracking-tight text-pink sm:text-3xl">{title}</h1>
        {subtitle ? <p className="mt-1 max-w-2xl text-sm text-pink/65">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      {icon ? (
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-turquesa/15 text-pink">
          {icon}
        </span>
      ) : null}
      <h3 className="text-base font-bold text-pink">{title}</h3>
      {description ? <p className="mt-1 max-w-md text-sm text-pink/60">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ProgressBar({
  value,
  className,
  label
}: {
  value: number;
  className?: string;
  label?: string;
}) {
  const safe = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={cn("w-full", className)}>
      {label ? (
        <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-pink/60">
          <span>{label}</span>
          <span>{safe}%</span>
        </div>
      ) : null}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-pink/10"
        role="progressbar"
        aria-valuenow={safe}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Progresso"}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-turquesa to-pink transition-all duration-500"
          style={{ width: `${safe}%` }}
        />
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "turquesa"
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: ReactNode;
  tone?: "turquesa" | "pink" | "outline";
}) {
  const tones = {
    turquesa: "bg-turquesa/12 text-pink border-turquesa/30",
    pink: "bg-pink text-white border-pink",
    outline: "bg-white text-pink border-pink/20"
  };
  return (
    <div className="card animate-fade-up p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-pink/55">{label}</p>
          <p className="mt-2 text-3xl font-black tracking-tight text-pink">{value}</p>
          {hint ? <p className="mt-1 text-xs text-pink/55">{hint}</p> : null}
        </div>
        <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border", tones[tone])}>
          {icon}
        </span>
      </div>
    </div>
  );
}

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-turquesa/20 font-bold text-pink"
      style={{ width: size, height: size, fontSize: size * 0.34 }}
      aria-hidden="true"
    >
      {initials || "D&D"}
    </span>
  );
}

export function Alert({
  tone = "info",
  children
}: {
  tone?: "info" | "error" | "success";
  children: ReactNode;
}) {
  const classes = {
    info: "border-turquesa/40 bg-turquesa/10 text-pink",
    error: "border-pink/30 bg-pink/5 text-pink",
    success: "border-pink/30 bg-white text-pink"
  };
  return (
    <div className={cn("rounded-xl border px-4 py-3 text-sm", classes[tone])} role={tone === "error" ? "alert" : undefined}>
      {children}
    </div>
  );
}

