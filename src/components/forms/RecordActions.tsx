"use client";
import { useFormState, useFormStatus } from "react-dom";
import { manageRecordAction } from "@/actions/management";
import { initialActionState } from "@/actions/state";
function Buttons({ active, canDelete }: { active: boolean; canDelete: boolean }) {
  const { pending } = useFormStatus();
  return <>
    <button className="btn-secondary btn-sm" name="operation" value={active ? "archive" : "restore"} disabled={pending}>{pending ? "Aguarde…" : active ? "Arquivar" : "Restaurar"}</button>
    {canDelete ? <button className="btn-secondary btn-sm" name="operation" value="delete" disabled={pending}>Excluir</button> : null}
  </>;
}
export function RecordActions({ kind, id, name, active, canDelete }: { kind: "template" | "category"; id: string; name: string; active: boolean; canDelete: boolean }) {
  const [state, action] = useFormState(manageRecordAction, initialActionState);
  return <form action={action} className="flex flex-wrap items-center justify-end gap-2" aria-label={`Ações de ${name}`} onSubmit={(event) => {
    const operation = (event.nativeEvent as SubmitEvent).submitter?.getAttribute("value");
    const message = operation === "delete" ? `Excluir definitivamente “${name}”? Registros com vínculos ou histórico serão preservados e a exclusão será bloqueada.` : operation === "archive" ? `Arquivar “${name}”? ${kind === "template" ? "Novas atividades deixarão de ser geradas. As existentes serão mantidas." : "Os modelos vinculados continuarão com o próprio status."}` : `Restaurar “${name}”?`;
    if (!window.confirm(message)) event.preventDefault();
  }}>
    <input type="hidden" name="id" value={id} /><input type="hidden" name="kind" value={kind} /><input type="hidden" name="confirmed" value="yes" />
    <Buttons active={active} canDelete={canDelete} />
    {state.error ? <p role="alert" className="w-full max-w-xs text-xs text-red-700">{state.error}</p> : null}
    {state.ok ? <p role="status" className="text-xs">{state.message}</p> : null}
  </form>;
}
