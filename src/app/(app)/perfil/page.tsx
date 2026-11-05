import { KeyRound, Mail, ShieldCheck, Store, UserRound } from "lucide-react";
import { requireUser } from "@/lib/auth-server";
import { getBackend, isLocalMode } from "@/lib/backend";
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/lib/constants";
import { Card, CardHeader, PageHeader } from "@/components/ui";
import { RoleBadge } from "@/components/ui/badges";
import { ProfilePasswordForm } from "@/components/auth/ProfilePasswordForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireUser();
  const stores = await getBackend().listStores(user);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Dados de acesso"
        title="Meu perfil"
        subtitle="Consulte suas permissões, lojas vinculadas e atualize sua senha com segurança."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Identificação" description="Dados da sua conta" icon={<UserRound className="h-4 w-4" />} />
          <div className="space-y-4 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-turquesa/15 text-xl font-black text-pink">
                {user.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("")}
              </span>
              <div>
                <p className="text-lg font-black text-pink">{user.name}</p>
                <RoleBadge role={user.role} />
              </div>
            </div>
            <div className="space-y-3 border-t border-pink/10 pt-4 text-sm">
              <p className="flex items-center gap-2 text-pink/70"><Mail className="h-4 w-4 text-pink/40" />{user.email}</p>
              <p className="flex items-center gap-2 text-pink/70"><ShieldCheck className="h-4 w-4 text-pink/40" />{ROLE_LABELS[user.role]} · {ROLE_DESCRIPTIONS[user.role]}</p>
            </div>
            <div className="rounded-xl border border-turquesa/40 bg-turquesa/10 p-3 text-xs text-pink/70">
              {user.role === "admin"
                ? "Você tem acesso total à rede, incluindo usuários, categorias, modelos e auditoria."
                : user.role === "supervisor"
                  ? "Você acompanha as lojas vinculadas à sua supervisão e pode revisar execuções."
                  : "Você executa e acompanha as atividades exclusivamente da sua loja."}
            </div>
            {isLocalMode() ? (
              <p className="rounded-xl border border-dashed border-pink/20 px-3 py-2 text-[11px] text-pink/50">
                Ambiente local de demonstração. Em produção, os dados são armazenados no Supabase.
              </p>
            ) : null}
          </div>
        </Card>

        <Card>
          <CardHeader title="Lojas vinculadas" description="Unidades que você pode acessar" icon={<Store className="h-4 w-4" />} />
          <div className="space-y-2 p-5">
            {stores.length ? (
              stores.map((store) => (
                <div key={store.id} className="flex items-center justify-between gap-3 rounded-xl border border-pink/10 px-3 py-2.5">
                  <div>
                    <p className="text-sm font-bold text-pink">{store.name}</p>
                    <p className="text-[11px] text-pink/45">{store.code}</p>
                  </div>
                  <span className="badge bg-turquesa/15 text-pink">{store.active ? "Ativa" : "Inativa"}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-pink/50">Nenhuma loja vinculada. Procure a gerente comercial.</p>
            )}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Segurança da conta" description="Atualize sua senha de acesso" icon={<KeyRound className="h-4 w-4" />} />
          <div className="max-w-xl p-5">
            <ProfilePasswordForm />
          </div>
        </Card>
      </div>
    </div>
  );
}

