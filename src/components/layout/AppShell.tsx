"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
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
  UserRound,
  X
} from "@/components/ui/material-icons";
import type { Role, SessionUser } from "@/lib/types";
import { isGeneralAdmin } from "@/lib/access";
import { NAV_ITEMS, ROLE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/actions/auth";
import { Avatar } from "@/components/ui";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
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
  { prefix: "/previa-gerente", title: "Minha rotina", description: "Prévia do painel do gerente" },
  { prefix: "/rotina", title: "Minha rotina", description: "Uma tarefa de cada vez" },
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
  const [collapsed, setCollapsed] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
      if (event.key !== "Tab") return;
      const targets = Array.from(panelRef.current?.querySelectorAll<HTMLElement>("a, button, summary") ?? []).filter(el => el.getClientRects().length);
      const first = targets[0], last = targets[targets.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = previous; document.removeEventListener("keydown", onKey); menuRef.current?.focus(); };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const nav = NAV_ITEMS.filter((item) => (item.roles as readonly Role[]).includes(user.role));
  const current = TITLES.find((item) => pathname === item.prefix || pathname.startsWith(`${item.prefix}/`));

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="sidebar-top flex items-center justify-between gap-2 px-4 pb-4 pt-5">
        <div className="sidebar-logo"><Logo size="sm" href="/painel" /></div>
        <button type="button" className="sidebar-toggle hidden shrink-0 items-center justify-center rounded-xl lg:inline-flex" onClick={() => setCollapsed(value => !value)} aria-label={collapsed ? "Expandir menu lateral" : "Recolher menu lateral"} aria-expanded={!collapsed} title={collapsed ? "Expandir menu" : "Recolher menu"}><Menu className="h-5 w-5" /></button>
        <button
          type="button"
          className="sidebar-close rounded-lg p-2 text-white lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Fechar menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="sidebar-groups flex-1 overflow-y-auto px-3 pb-4" aria-label="Navegação principal">
        {[
          { title: "Operação", paths: ["/painel", "/atividades", "/lojas"] },
          { title: "Gestão", paths: ["/usuarios", "/categorias", "/modelos"] },
          { title: "Acompanhamento", paths: ["/relatorios", "/historico"] }
        ].map((group) => {
          const items = nav.filter(item => group.paths.includes(item.href));
          if (!items.length) return null;
          return (
            <section key={group.title} className="sidebar-group" aria-label={group.title}>
              <h2 className="sidebar-group-title">{group.title}</h2>
              <div className="space-y-1">
                {items.map(item => {
                  const Icon = ICONS[item.icon as keyof typeof ICONS];
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link key={item.href} href={item.href} title={item.label} aria-label={item.label}
                      className={cn("sidebar-nav-link flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium", active && "sidebar-nav-active")}
                      aria-current={active ? "page" : undefined}>
                      <Icon className="h-[18px] w-[18px] shrink-0" />
                      <span className="sidebar-label">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </nav>
      <div className="sidebar-account mx-3 mb-3 rounded-2xl border border-white/20 p-3">
        <h2 className="sidebar-group-title">Minha conta</h2>
        <Link href="/perfil" aria-label="Abrir meu perfil" aria-current={pathname === "/perfil" ? "page" : undefined} className="mb-2 flex min-h-11 items-center gap-2.5 sidebar-profile rounded-xl p-2.5 focus-visible:outline-white">
          <Avatar userId={user.id} name={user.name} size={36} />
          <div className="sidebar-user-info min-w-0">
            <p className="truncate text-sm font-bold text-white">{user.name}</p>
            <p className="truncate text-[11px] text-white">{isGeneralAdmin(user) ? "Administrador Geral" : ROLE_LABELS[user.role]}</p>
          </div>
        </Link>
        <Link href="/perfil" title="Meu perfil" aria-label="Meu perfil" className={cn("sidebar-nav-link mb-1 flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium", pathname === "/perfil" && "sidebar-nav-active")} aria-current={pathname === "/perfil" ? "page" : undefined}><UserRound className="h-[18px] w-[18px] shrink-0" /><span className="sidebar-label">Meu perfil</span></Link>
        <form action={logoutAction}>
          <button type="submit" className="btn sidebar-exit w-full justify-start border-0 bg-transparent px-3 text-sm font-medium text-white" title="Sair da plataforma" aria-label="Sair da plataforma">
            <LogOut className="h-4 w-4" />
            <span className="sidebar-label">Sair da plataforma</span>
          </button>
        </form>
        {demoMode ? (
          <p className="sidebar-demo mt-3 rounded-lg border border-dashed border-white/40 px-2 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wider text-white">
            Modo local de demonstração
          </p>
        ) : null}
      </div>
    </div>
  );

  return (
    <div data-menu-collapsed={collapsed} className={cn("app-layout min-h-[100dvh]", collapsed ? "lg:pl-[88px]" : "lg:pl-[248px]")}>
      <aside className="app-sidebar desktop-sidebar fixed inset-y-0 left-0 z-40 hidden w-[248px] border-r border-line bg-surface lg:block">
        {sidebar}
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="mobile-menu-backdrop absolute inset-0 bg-pink/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
          />
          <aside ref={panelRef} role="dialog" aria-modal="true" aria-label="Menu de navegação" className="mobile-menu-panel app-sidebar absolute inset-y-0 left-0 w-[286px] max-w-[86vw] border-r border-line bg-surface shadow-2xl">
            {sidebar}
          </aside>
        </div>
      ) : null}

      <header className="sticky top-0 z-30 border-b border-line bg-surface">
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 text-ink hover:bg-pink/5 lg:hidden"
              onClick={() => setOpen(true)}
              ref={menuRef}
              aria-label="Abrir menu"
              aria-expanded={open}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-ink">{current?.title ?? "Checklist Operacional"}</p>
              <p className="hidden truncate text-[11px] text-ink/70 sm:block">
                {current?.description ?? "D&D"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link href="/perfil" aria-label="Abrir meu perfil" className="flex items-center gap-2 rounded-full border border-line py-1 pl-1 pr-3 hover:bg-turquesa/10">
              <Avatar userId={user.id} name={user.name} size={30} />
              <span className="hidden max-w-[140px] truncate text-xs font-semibold text-ink sm:block">
                {user.name}
              </span>
            </Link>
            <form action={logoutAction} className="hidden sm:block">
              <button type="submit" className="rounded-lg p-2 text-ink/70 hover:bg-pink/5 hover:text-ink" aria-label="Sair">
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-surface focus:p-3">Pular para o conteúdo</a>
      {demoMode && <div className="border-b border-line bg-[#faedf0] px-4 py-3 text-sm text-ink" role="note"><strong>Versão de teste</strong> · Dados fictícios. Cadastros e fotos podem ser reiniciados; não envie informações reais.</div>}
      <main id="conteudo" tabIndex={-1} className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8"><div key={pathname} className="route-flow">{children}</div></main>

      <footer className="mx-auto flex w-full max-w-[1400px] flex-wrap items-center justify-between gap-2 px-4 pb-6 text-[11px] text-ink/70 sm:px-6 lg:px-8">
        <span>© {new Date().getFullYear()} D&D · Checklist Operacional</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-turquesa" />
          {demoMode ? "Dados locais de demonstração" : "Conectado ao Supabase"}
        </span>
      </footer>
    </div>
  );
}



