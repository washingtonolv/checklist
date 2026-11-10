"use client";
import { useRef, useState } from "react";
export function ProfilePhoto({userId,name}:{userId:string;name:string}) {
 const input=useRef<HTMLInputElement>(null);const [busy,setBusy]=useState(false);const [message,setMessage]=useState("");const [error,setError]=useState(false);
 async function save(file?:File) {
  if(!file && !window.confirm("Remover sua foto de perfil?"))return;
  setBusy(true);setMessage("");setError(false);
  try {const form=new FormData();if(file)form.set("photo",file);else form.set("remove","true");
   const response=await fetch(`/api/avatar/${userId}`,{method:"POST",body:form});const result=await response.json();if(!response.ok)throw new Error(result.error);
   window.dispatchEvent(new Event("avatar-updated"));setMessage(file?"Foto atualizada.":"Foto removida.");
  }catch(e){setError(true);setMessage(e instanceof Error?e.message:"Não foi possível salvar a foto.");}finally{setBusy(false);if(input.current)input.current.value="";}
 }
 return <div className="space-y-2"><input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label="Escolher foto de perfil" disabled={busy} onChange={e=>{const file=e.target.files?.[0];if(file)void save(file);}}/><div className="flex flex-wrap gap-2"><button type="button" className="btn-secondary btn-sm" disabled={busy} onClick={()=>input.current?.click()}>{busy?"Salvando...":"Adicionar foto"}</button><button type="button" className="btn-ghost btn-sm" disabled={busy} onClick={()=>void save()}>Remover foto</button></div><p className="text-xs text-ink/70">JPG, PNG ou WebP · até 5 MB</p>{message&&<p role={error?"alert":"status"} className={error?"text-xs text-danger":"text-xs text-success"}>{message}</p>}</div>;
}
