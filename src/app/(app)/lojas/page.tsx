import Link from "next/link";
import { LayoutGrid, List } from "lucide-react";
import { Building2, CheckCircle2, MapPin, Plus, Store, UserRound, Users } from "@/components/ui/illustrated-icons";
import { requireUser } from "@/lib/auth-server";
import { getBackend } from "@/lib/backend";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { Alert } from "@/components/ui";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StoresPage({
  searchParams: rawParams
}: {
  searchParams: Promise<{ sucesso?: string; visualizacao?: string }>;
}) {
  const searchParams = await rawParams;
  const user = await requireUser();
  const stores = await getBackend().listStores(user);
  const grid = searchParams.visualizacao === "grade";
  const isAdmin = user.role === "admin";

  return (
    <div>
      <PageHeader
        title="Lojas"
        subtitle={isAdmin ? "Cadastre, edite e acompanhe as unidades da rede." : "Unidades vinculadas ao seu perfil."}
        actions={<><div className="flex gap-1" aria-label="Exibição das lojas"><Link href="/lojas?visualizacao=lista" className="btn-secondary btn-sm" aria-label="Exibir lojas em lista" title="Lista" aria-current={!grid ? "page" : undefined}><List className="h-4 w-4" aria-hidden="true" /></Link><Link href="/lojas?visualizacao=grade" className="btn-secondary btn-sm" aria-label="Exibir lojas em grade" title="Grade" aria-current={grid ? "page" : undefined}><LayoutGrid className="h-4 w-4" aria-hidden="true" /></Link></div>{isAdmin ? (
          <Link href="/lojas/nova" className="btn-primary">
            <Plus className="h-4 w-4" />
            Nova loja
          </Link>
        ) : null}</>}
      />

      {searchParams.sucesso ? (
        <div className="mb-5">
          <Alert tone="success">
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />{searchParams.sucesso}</span>
          </Alert>
        </div>
      ) : null}

      {stores.length ? (
        !grid ? (
          <Card>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Loja</th>
                    <th>Código</th>
                    <th>Gerente</th>
                    <th>Supervisores</th>
                    <th>Status</th>
                    <th className="text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.map((store) => (
                    <tr key={store.id}>
                      <td>
                        <Link href={`/lojas/${store.id}`} className="flex items-center gap-2 font-bold text-ink hover:underline">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-turquesa/15">
                            <Store className="h-4 w-4" />
                          </span>
                          {store.name}
                        </Link>
                      </td>
                      <td className="font-mono text-xs">{store.code}</td>
                      <td>{store.managerName ?? <span className="text-ink/70">Não vinculado</span>}</td>
                      <td>
                        {store.supervisors.length ? (
                          <div className="flex flex-wrap gap-1">
                            {store.supervisors.map((supervisor) => (
                              <span key={supervisor.id} className="badge bg-turquesa/15 text-ink">{supervisor.name}</span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-ink/70">—</span>
                        )}
                      </td>
                      <td>
                        <span className={cn("badge", store.active ? "bg-pink text-white" : "border border-ink/20 bg-surface text-ink/70")}>
                          {store.active ? "Ativa" : "Inativa"}
                        </span>
                      </td>
                      <td>
                        <div className="flex justify-end gap-2">
                          <Link href={`/lojas/${store.id}`} className="btn-ghost btn-sm">Ver</Link>
                          {isAdmin && <Link href={`/lojas/${store.id}/editar`} className="btn-secondary btn-sm">Editar</Link>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {stores.map((store) => (
              <Link key={store.id} href={`/lojas/${store.id}`} className="card group p-4 transition hover:border-turquesa">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-turquesa/15 text-ink">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <span className={cn("badge", store.active ? "bg-pink text-white" : "border border-ink/20 bg-surface text-ink/70")}>
                    {store.active ? "Ativa" : "Inativa"}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-ink group-hover:underline group-hover:decoration-turquesa group-hover:decoration-2 group-hover:underline-offset-4">{store.name}</h2>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink/70"><MapPin className="h-3.5 w-3.5" />{store.code}</p>
                <div className="mt-3 space-y-1 text-xs text-ink/65">
                  <p className="flex items-center gap-2"><UserRound className="h-3.5 w-3.5 text-ink/70" />{store.managerName ?? "Sem gerente vinculado"}</p>
                  <p className="flex items-center gap-2"><Users className="h-3.5 w-3.5 text-ink/70" />{store.supervisors.map((item) => item.name).join(", ") || "Sem supervisor"}</p>
                </div>
              </Link>
            ))}
          </div>
        )
      ) : (
        <Card>
          <EmptyState
            icon={<Building2 className="h-6 w-6" />}
            title="Nenhuma loja vinculada"
            description={isAdmin ? "Cadastre a primeira unidade da rede D&D." : "Procure a gerente comercial para ser vinculado a uma loja."}
            action={isAdmin ? <Link href="/lojas/nova" className="btn-primary">Cadastrar loja</Link> : null}
          />
        </Card>
      )}
    </div>
  );
}

