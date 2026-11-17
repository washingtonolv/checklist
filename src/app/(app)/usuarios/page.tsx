import Link from "next/link";
import { isGeneralAdmin } from "@/lib/access";
import { RemoveUserButton } from "@/components/forms/RemoveUserButton";
import { CheckCircle2, Plus, Store, Users } from "@/components/ui/illustrated-icons";
import { requireAdmin } from "@/lib/auth-server";
import { getBackend } from "@/lib/backend";
import { formatDate } from "@/lib/dates";
import { Alert, Avatar, Card, EmptyState, PageHeader } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

export const dynamic = "force-dynamic";

const categories: { role: Role; label: string; scope: string; empty: string }[] = [
  { role: "admin", label: "Administradores", scope: "Abrangência", empty: "Nenhum administrador nesta categoria." },
  { role: "manager", label: "Gerentes", scope: "Loja vinculada", empty: "Nenhum gerente nesta categoria." },
  { role: "supervisor", label: "Supervisores", scope: "Lojas supervisionadas", empty: "Nenhum supervisor nesta categoria." }
];

export default async function UsersPage({ searchParams: rawParams }: { searchParams: Promise<{ sucesso?: string; perfil?: string }> }) {
  const searchParams = await rawParams;
  const user = await requireAdmin();
  const users = await getBackend().listUsers(user);
  const selected = categories.find((category) => category.role === searchParams.perfil) ?? categories[0];
  const people = users.filter((person) => person.role === selected.role)
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  const canManageAdmins = isGeneralAdmin(user);
  const createRole = selected.role === "admin" && !canManageAdmins ? "manager" : selected.role;
  const createUrl = `/usuarios/novo?perfil=${createRole}`;

  return (
    <div>
      <PageHeader title="Usuários" subtitle="Organize a equipe por categoria de acesso."
        actions={<Link href={createUrl} className="btn-primary"><Plus className="h-4 w-4" />Novo usuário</Link>} />
      {searchParams.sucesso ? <div className="mb-5"><Alert tone="success"><span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />{searchParams.sucesso}</span></Alert></div> : null}

      <nav aria-label="Categorias de usuário" className="mb-5 flex flex-wrap gap-2 border-b border-ink/10 pb-4">
        {categories.map((category) => (
          <Link key={category.role} href={`/usuarios?perfil=${category.role}`}
            aria-current={selected.role === category.role ? "page" : undefined}
            className={cn("min-h-11", selected.role === category.role ? "btn-primary" : "btn-secondary")}>
            {category.label}
            <span className="rounded-full bg-current/10 px-2 py-0.5 text-xs tabular-nums" aria-label={`${users.filter((person) => person.role === category.role).length} usuários`}>
              {users.filter((person) => person.role === category.role).length}
            </span>
          </Link>
        ))}
      </nav>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 px-5 py-4">
          <h2 className="text-base font-semibold text-ink">{selected.label}</h2>
          <p className="text-xs text-ink/70">{people.length} usuário(s) · {people.filter((person) => person.active).length} ativo(s)</p>
        </div>
        {people.length ? (
          <div className="table-wrap">
            <table className="table">
              <caption className="sr-only">Usuários da categoria {selected.label}</caption>
              <thead><tr><th scope="col">Usuário</th><th scope="col">{selected.scope}</th><th scope="col">Status</th><th scope="col">Detalhes</th><th scope="col" className="text-right">Ações</th></tr></thead>
              <tbody>
                {people.map((person) => (
                  <tr key={person.id}>
                    <td><div className="flex items-start gap-3"><Avatar userId={person.id} name={person.name} size={36} /><div>
                      <p className="font-bold text-ink">{person.name}</p>
                      {person.username ? <p className="text-xs text-ink/70">@{person.username}</p> : null}
                      {isGeneralAdmin(person) ? <span className="badge mt-1 bg-turquesa/15 text-ink">Administrador Geral</span> : null}
                    </div></div></td>
                    <td>{person.role === "admin" ? <span className="text-sm text-ink">Todas as lojas</span> : person.storeNames.length ? (
                      person.role === "supervisor" ? <details><summary className="cursor-pointer text-sm text-ink">{person.storeNames.length} loja(s) vinculada(s)</summary><ul className="mt-2 space-y-1">{person.storeNames.map((name, index) => <li key={`${name}-${index}`} className="text-xs text-ink/70">{name}</li>)}</ul></details>
                      : <div className="flex max-w-sm flex-wrap gap-1">{person.storeNames.map((name, index) => <span key={`${name}-${index}`} className="badge bg-turquesa/15 text-ink"><Store className="h-3 w-3" />{name}</span>)}</div>
                    ) : <span className="text-xs text-ink/70">Sem vínculo</span>}</td>
                    <td><span className={cn("badge", person.active ? "bg-pink text-white" : "border border-ink/20 bg-surface text-ink/70")}>{person.active ? "Ativo" : "Inativo"}</span></td>
                    <td><details><summary className="cursor-pointer text-xs font-semibold text-ink">Ver detalhes<span className="sr-only"> de {person.name}</span></summary><div className="mt-2 space-y-1 text-xs text-ink/70"><p className="max-w-xs break-words">{person.email}</p><p>Cadastro: {formatDate(person.createdAt)}</p></div></details></td>
                    <td><div className="flex flex-wrap justify-end gap-2">
                      {(person.role !== "admin" || canManageAdmins) ? <Link href={`/usuarios/${person.id}/editar`} className="btn-secondary btn-sm">Editar<span className="sr-only"> {person.name}</span></Link> : null}
                      {canManageAdmins && person.id !== user.id && !isGeneralAdmin(person) ? <RemoveUserButton id={person.id} name={person.name} /> : null}
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState icon={<Users className="h-6 w-6" />} title={selected.empty} description="Os usuários deste perfil aparecerão aqui após o cadastro."
          action={selected.role !== "admin" || canManageAdmins ? <Link href={createUrl} className="btn-primary">Cadastrar usuário</Link> : undefined} />}
      </Card>
      <p className="mt-4 text-xs text-ink/70">A categoria define o alcance do acesso. Usuários inativos permanecem na sua categoria para consulta.</p>
    </div>
  );
}
