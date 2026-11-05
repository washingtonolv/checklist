"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ClipboardCheck,
  FileSpreadsheet,
  FolderTree,
  History,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Store,
  Users,
  X
} from "lucide-react";
import type { Role, SessionUser } from "@/lib/types";
import { NAV_ITEMS, ROLE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/actions/auth";
import { Avatar } from "@/components/ui";
import { RoleBadge } from "@/components/ui/badges";
import { Logo } from "@/components/brand/Logo";

const ICONS = {
  LayoutDashboard,
  ClipboardCheck,
  Store,
  Users,
  FolderTree,
  ListChecks,
  FileSpreadsheet,
  History
} as const;

const TITLES: { prefix: string; title: string; description: string }[] = [
  { prefix: "/painel", title: "Painel", description: "Visão geral da operação" },
  { prefix: "/atividades", title: "Atividades", description: "Checklists e evidências" },
  { prefix: "/lojas", title: "Lojas", description: "Unidades da rede" },
  { prefix: "/usuarios", title: "Usuários", description: "Equipe e permissões" },
  { prefix: "/categorias", title: "Categorias", description: "Estrutura dos checklists" },
  { prefix: "/modelos", title: "Modelos de tarefas", description: "Rotinas e periodicidade" },
  { prefix: "/relatorios", title: "Relatórios", description: "Indicadores e exportações" },
  { prefix: "/historico", title: "Histórico", description: "Execuções e auditoria" },
  { prefix: "/perfil", title: "Meu perfil", description: "Dados de acesso" }
];

export function AppShell({
  user,
  demoMode,
  children
}: {
  user: SessionUser;
  demoMode: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const nav = NAV_ITEMS.filter((item) => (item.roles as readonly Role[]).includes(user.role));
  const current = TITLES.find((item) => pathname === item.prefix || pathname.startsWith(`${item.prefix}/`));

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 pb-4 pt-6">
        <Logo size="sm" href="/painel" />
        <button
          type="button"
          className="rounded-lg p-2 text-pink/60 hover:bg-pink/5 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Fechar menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="mx-5 mb-5 h-1 rounded-full bg-gradient-to-r from-turquesa via-turquesa to-pink" />
      <nav className="flex-1 space-y-1 overflow-y-auto px-3" aria-label="Navegação principal">
        {nav.map((item) => {
          const Icon = ICONS[item.icon as keyof typeof ICONS];
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition",
                active
                  ? "bg-turquesa/15 text-pink"
                  : "text-pink/65 hover:bg-pink/5 hover:text-pink"
              )}
              aria-current={active ? "page" : undefined}
            >
              {active ? (
                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-pink" />
              ) : null}
              <Icon className={cn("h-[18px] w-[18px]", active ? "text-pink" : "text-pink/50 group-hover:text-pink")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-pink/10 p-4">
        <div className="mb-3 flex items-center gap-2.5 rounded-xl bg-turquesa/8 p-3">
          <Avatar name={user.name} size={36} />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-pink">{user.name}</p>
            <p className="truncate text-[11px] text-pink/55">{ROLE_LABELS[user.role]}</p>
          </div>
        </div>
        <form action={logoutAction}>
          <button type="submit" className="btn-ghost w-full justify-start text-xs">
            <LogOut className="h-4 w-4" />
            Sair da plataforma
          </button>
        </form>
        {demoMode ? (
          <p className="mt-3 rounded-lg border border-dashed border-pink/20 px-2 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wider text-pink/50">
            Modo local de demonstração
          </p>
        ) : null}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:pl-[268px]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[268px] border-r border-pink/10 bg-white lg:block">
        {sidebar}
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-pink/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
          />
          <aside className="absolute inset-y-0 left-0 w-[286px] max-w-[86vw] border-r border-pink/10 bg-white shadow-2xl">
            {sidebar}
          </aside>
        </div>
      ) : null}

      <header className="sticky top-0 z-30 border-b border-pink/10 bg-white/90 backdrop-blur">
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 text-pink hover:bg-pink/5 lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-pink">{current?.title ?? "Checklist Operacional"}</p>
              <p className="hidden truncate text-[11px] text-pink/50 sm:block">
                {current?.description ?? "D&D"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <RoleBadge role={user.role} className="hidden sm:inline-flex" />
            <Link href="/perfil" className="flex items-center gap-2 rounded-full border border-pink/10 py-1 pl-1 pr-3 hover:bg-turquesa/10">
              <Avatar name={user.name} size={30} />
              <span className="hidden max-w-[140px] truncate text-xs font-semibold text-pink sm:block">
                {user.name}
              </span>
            </Link>
            <form action={logoutAction} className="hidden sm:block">
              <button type="submit" className="rounded-lg p-2 text-pink/60 hover:bg-pink/5 hover:text-pink" aria-label="Sair">
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">{children}</main>

      <footer className="mx-auto flex w-full max-w-[1400px] flex-wrap items-center justify-between gap-2 px-4 pb-6 text-[11px] text-pink/40 sm:px-6 lg:px-8">
        <span>© {new Date().getFullYear()} D&D · Checklist Operacional</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-turquesa" />
          {demoMode ? "Dados locais de demonstração" : "Conectado ao Supabase"}
        </span>
      </footer>
    </div>
  );
}

