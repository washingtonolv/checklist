import { Logo } from "@/components/brand/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-turquesa via-turquesa/85 to-turquesa/60 p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full border-[48px] border-white/25" />
        <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-pink/10" />
        <div className="absolute right-16 top-1/3 h-24 w-24 rotate-12 rounded-3xl bg-pink/15" />
        <div className="relative z-10 rounded-3xl bg-white/90 p-6 shadow-2xl backdrop-blur">
          <Logo size="lg" href={null} />
        </div>
        <div className="relative z-10 max-w-lg">
          <p className="mb-3 inline-flex rounded-full border border-pink/20 bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-pink">
            Gestão operacional
          </p>
          <h1 className="text-4xl font-black leading-tight tracking-tight text-pink">
            A rotina das lojas D&amp;D, visível em um só lugar.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-pink/70">
            Checklists diários, evidências fotográficas, correções e indicadores de desempenho para a gerência
            comercial, supervisores e gerentes de loja.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-3 text-xs font-semibold text-pink/60">
          <span className="h-2 w-2 rounded-full bg-pink" />
          Identidade D&amp;D · Azul turquesa, rosa pink e branco
        </div>
      </section>

      <section className="flex min-h-screen flex-col justify-center bg-white px-5 py-10 sm:px-10 lg:px-16">
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

