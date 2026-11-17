import { redirect } from "next/navigation";
export default async function LegacyPage({ searchParams: rawParams }: { searchParams: Promise<{ sucesso?: string }> }) {
  const searchParams = await rawParams;
  const query = new URLSearchParams({ aba: "categorias", ...(searchParams.sucesso ? { sucesso: searchParams.sucesso } : {}) });
  query.set("aba", "modelos");
  query.set("categorias", "abertas");
  redirect(`/gerenciamento-tarefas?${query}`);
}
