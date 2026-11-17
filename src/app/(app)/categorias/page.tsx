import { redirect } from "next/navigation";
export default function LegacyPage({ searchParams }: { searchParams: { sucesso?: string } }) {
  const query = new URLSearchParams({ aba: "categorias", ...(searchParams.sucesso ? { sucesso: searchParams.sucesso } : {}) });
  redirect(`/gerenciamento-tarefas?${query}`);
}
