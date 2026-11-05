import Link from "next/link";
import { CheckCircle2, Plus, ShieldCheck, Store, UserRound, Users } from "lucide-react";
import { requireAdmin } from "@/lib/auth-server";
import { getBackend } from "@/lib/backend";
import { formatDate } from "@/lib/dates";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { Alert } from "@/components/ui";
import { RoleBadge } from "@/components/ui/badges";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function UsersPage({
  searchParams
}: {
  searchParams: { sucesso?: string };
}) {
  const user = await requireAdmin();
  const users = await getBackend().listUsers(user);

  return (
    <div>
      <PageHeader
        eyebrow="Equipe e permissões"
        title="Usuários"
        subtitle="Gerencie supervisores e gerentes de loja, seus acessos e vínculos com as unidades."
        actions={
          <Link href="/usuarios/novo" className="btn-primary">
            <Plus className="h-4 w-4" />
            Novo usuário
          </Link>
        }
      />

      {searchParams.sucesso ? (
        <div className="mb-5">
          <Alert tone="success">
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />{searchParams.sucesso}</span>
          </Alert>
        </div>
      ) : null}

      {users.length ? (
        <Card>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>Perfil</th>
                  <th>Lojas vinculadas</th>
                  <th>Status</th>
                  <th>Cadastro</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((person) => (
                  <tr key={person.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-turquesa/15 text-pink">
                          <UserRound className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="font-bold text-pink">{person.name}</p>
                          <p className="text-[11px] text-pink/50">{person.email}</p>
                        </div>
                      </div>
                    </td>
                    <td><RoleBadge role={person.role} /></td>
                    <td>
                      {person.storeNames.length ? (
                        <div className="flex flex-wrap gap-1">
                          {person.storeNames.map((name) => (
                            <span key={name} className="badge bg-turquesa/15 text-pink">
                              <Store className="h-3 w-3" />
                              {name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-pink/45">Sem vínculo</span>
                      )}
                    </td>
                    <td>
                      <span className={cn("badge", person.active ? "bg-pink text-white" : "border border-pink/20 bg-white text-pink/55")}>
                        {person.active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="text-xs text-pink/60">{formatDate(person.createdAt)}</td>
                    <td>
                      <div className="flex justify-end">
                        <Link href={`/usuarios/${person.id}/editar`} className="btn-secondary btn-sm">Editar</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card>
          <EmptyState
            icon={<Users className="h-6 w-6" />}
            title="Nenhum usuário cadastrado"
            description="Cadastre supervisores e gerentes de loja para começar a operar os checklists."
            action={<Link href="/usuarios/novo" className="btn-primary">Cadastrar usuário</Link>}
          />
        </Card>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-pink/15 px-4 py-3 text-[11px] text-pink/50">
        <ShieldCheck className="h-4 w-4" />
        As permissões são aplicadas no banco de dados e na camada de servidor, não apenas na interface.
        <span className="hidden sm:inline">·</span>
        <span>Senhas são armazenadas com hash e nunca são exibidas.</span>
      </div>
    </div>
  );
}

