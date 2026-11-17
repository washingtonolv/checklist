import { redirect } from "next/navigation";
export default function LegacyPage({ searchParams }: { searchParams: { sucesso?: string } }) {
  const query = new URLSearchParams({ aba: "modelos", ...(searchParams.sucesso ? { sucesso: searchParams.sucesso } : {}) });
  redirect(`/gerenciamento-tarefas?${query}`);
}
