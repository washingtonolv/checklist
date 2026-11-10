import { ProfilePhoto } from "@/components/auth/ProfilePhoto";
import { KeyRound, Mail, ShieldCheck, Store, UserRound } from "@/components/ui/illustrated-icons";
import { requireUser } from "@/lib/auth-server";
import { getBackend, isLocalMode } from "@/lib/backend";
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/lib/constants";
import { Avatar, Card, CardHeader, PageHeader } from "@/components/ui";
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
              <Avatar userId={user.id} name={user.name} size={56} />
              <div>
                <p className="text-lg font-semibold text-ink">{user.name}</p>
                <RoleBadge role={user.role} />
              </div>
            </div>
            <ProfilePhoto userId={user.id} name={user.name} />
            <div className="space-y-3 border-t border-ink/10 pt-4 text-sm">
              <p className="flex items-center gap-2 text-ink/70"><Mail className="h-4 w-4 text-ink/70" />{user.email}</p>
              <p className="flex items-center gap-2 text-ink/70"><ShieldCheck className="h-4 w-4 text-ink/70" />{ROLE_LABELS[user.role]} · {ROLE_DESCRIPTIONS[user.role]}</p>
            </div>
            <div className="rounded-xl border border-turquesa/40 bg-turquesa/10 p-3 text-xs text-ink/70">
              {user.role === "admin"
                ? "Você tem acesso total à rede, incluindo usuários, categorias, modelos e auditoria."
                : user.role === "supervisor"
                  ? "Você acompanha as lojas vinculadas à sua supervisão e pode revisar execuções."
                  : "Você executa e acompanha as atividades exclusivamente da sua loja."}
            </div>
            {isLocalMode() ? (
              <p className="rounded-xl border border-dashed border-ink/20 px-3 py-2 text-[11px] text-ink/70">
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
                <div key={store.id} className="flex items-center justify-between gap-3 rounded-xl border border-ink/10 px-3 py-2.5">
                  <div>
                    <p className="text-sm font-bold text-ink">{store.name}</p>
                    <p className="text-[11px] text-ink/70">{store.code}</p>
                  </div>
                  <span className="badge bg-turquesa/15 text-ink">{store.active ? "Ativa" : "Inativa"}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-ink/70">Nenhuma loja vinculada. Procure a gerente comercial.</p>
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

