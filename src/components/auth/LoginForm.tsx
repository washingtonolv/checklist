"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { loginAction } from "@/actions/auth";
import { initialActionState } from "@/actions/state";
import { Alert } from "@/components/ui";

interface DemoCredential {
  role: string;
  email: string;
  password: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full py-3" disabled={pending}>
      <LogIn className="h-4 w-4" />
      {pending ? "Entrando..." : "Entrar na plataforma"}
    </button>
  );
}

export function LoginForm({
  next,
  demoCredentials
}: {
  next: string;
  demoCredentials: DemoCredential[];
}) {
  const [state, action] = useFormState(loginAction, initialActionState);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div>
      <div className="mb-7">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-ink/70">Acesso restrito</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Bem-vinda de volta</h1>
        <p className="mt-2 text-sm text-ink/70">
          Entre com seu e-mail corporativo para acompanhar as atividades das lojas.
        </p>
      </div>

      {state?.error ? (
        <div className="mb-4">
          <Alert tone="error">{state.error}</Alert>
        </div>
      ) : null}

      <form action={action} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <div>
          <label htmlFor="email" className="label">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="input"
            placeholder="seu.nome@dd.com.br"
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="label">
              Senha
            </label>
            <Link href="/recuperar-senha" className="mb-1.5 text-xs font-semibold text-ink/70 hover:text-ink">
              Esqueci minha senha
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="input pr-11"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-ink/70 hover:bg-pink/5 hover:text-ink"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <SubmitButton />
      </form>

      {demoCredentials.length ? (
        <div className="mt-8 rounded-2xl border border-dashed border-ink/20 bg-turquesa/5 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-ink/70">Acessos de demonstração</p>
          <p className="mt-1 text-xs text-ink/70">
            Dados locais de teste. Clique em um perfil para preencher o formulário.
          </p>
          <div className="mt-3 space-y-2">
            {demoCredentials.map((credential) => (
              <button
                key={credential.email}
                type="button"
                onClick={() => {
                  setEmail(credential.email);
                  setPassword(credential.password);
                }}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-ink/10 bg-surface px-3 py-2 text-left transition hover:border-turquesa hover:bg-turquesa/5"
              >
                <span>
                  <span className="block text-xs font-bold text-ink">{credential.role}</span>
                  <span className="block text-[11px] text-ink/70">{credential.email}</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink/70">Usar</span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-ink/70">Senha padrão: {demoCredentials[0]?.password}</p>
        </div>
      ) : null}
    </div>
  );
}

