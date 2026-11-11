"use client";

import { useId, useState, type ReactNode } from "react";
import { Filter } from "@/components/ui/illustrated-icons";

export function FilterPanel({
  title,
  activeCount = 0,
  children
}: {
  title: string;
  activeCount?: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const contentId = useId();

  return (
    <section className="card responsive-filters mb-4 p-3" aria-label={title} data-open={open}>
      <button
        type="button"
        className="filter-toggle"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen(value => !value)}
      >
        <Filter className="h-4 w-4 shrink-0" />
        <span className="min-w-0 flex-1 text-left">{title}{activeCount > 0 ? ` (${activeCount})` : ""}</span>
        <span className="text-xs font-medium text-ink/70">{open ? "Ocultar" : "Mostrar"}</span>
      </button>
      <p className="filter-heading text-sm font-semibold">{title}</p>
      <div id={contentId} className="filter-content">{children}</div>
    </section>
  );
}
