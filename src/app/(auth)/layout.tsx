import { Logo } from "@/components/brand/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] lg:grid lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden overflow-hidden bg-canvas p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="relative z-10 rounded-xl border border-line bg-surface p-6">
          <Logo size="lg" href={null} />
        </div>
        <div className="relative z-10 max-w-lg">
          <p className="mb-3 inline-flex rounded-full border border-ink/20 bg-surface/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-ink">
            Gestão operacional
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-ink">
            A rotina das lojas D&amp;D, visível em um só lugar.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ink/70">
            Checklists diários, evidências fotográficas, correções e indicadores de desempenho para a gerência
            comercial, supervisores e gerentes de loja.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-3 text-xs font-semibold text-ink/70">
          <span className="h-2 w-2 rounded-full bg-pink" />
          Checklist Operacional D&amp;D
        </div>
      </section>

      <section className="flex min-h-[100dvh] flex-col justify-center bg-surface px-5 py-10 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo size="md" href={null} />
          </div>
          {children}
        </div>
      </section>
    </div>
  );
}

