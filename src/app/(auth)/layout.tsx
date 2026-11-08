import { Logo } from "@/components/brand/Logo";
import { LoginIllustration } from "@/components/auth/LoginIllustration";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth-stage">
      <div className="auth-panel">
        <section className="auth-art-panel" aria-label="Apresentação do Checklist Operacional D&D">
          <div className="auth-brand"><Logo size="sm" href="/login" /></div>
          <div className="auth-artwork"><LoginIllustration /></div>
          <div className="auth-art-copy">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[.2em] text-ink/60">Checklist Operacional D&D</p>
            <h2 className="text-2xl font-semibold leading-tight tracking-tight text-ink sm:text-3xl">Tudo em ordem.<br />Sua equipe em sintonia.</h2>
            <p className="mt-3 max-w-[290px] text-sm leading-relaxed text-ink/65">Rotinas, evidências e resultados das suas lojas em um só lugar.</p>
          </div>
        </section>
        <section className="auth-form-panel" aria-label="Área de acesso">
          <p className="auth-access-note">Acesso exclusivo para a equipe <strong>D&D</strong></p>
          <div className="auth-content mx-auto w-full max-w-[360px]">{children}</div>
          <p className="auth-bottom-note">D&D Cosméticos · Gestão operacional</p>
        </section>
      </div>
    </main>
  );
}
