"use client";
import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { removeUserAction } from "@/actions/users";
import { initialActionState } from "@/actions/state";
function ConfirmButton(){const {pending}=useFormStatus();return <button className="btn-secondary btn-sm" disabled={pending}>{pending ? "Removendo..." : "Confirmar remoção"}</button>;}
export function RemoveUserButton({id,name}:{id:string;name:string}) {
 const [confirm,setConfirm]=useState(false);
 const [state,action]=useFormState(removeUserAction,initialActionState);
 if(state.ok) return <span role="status">Removido</span>;
 return <div className="ml-2">{!confirm ? <button type="button" className="btn-secondary btn-sm" onClick={()=>setConfirm(true)}>Remover</button> : <form action={action}><input type="hidden" name="id" value={id}/><p>Remover o acesso de {name}? Esta ação é permanente.</p><ConfirmButton/><button type="button" className="btn-ghost btn-sm" onClick={()=>setConfirm(false)}>Cancelar</button>{state.error ? <p role="alert">{state.error}</p> : null}</form>}</div>;
}
