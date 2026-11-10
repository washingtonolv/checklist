"use client";
import { useEffect, useState } from "react";
export function Avatar({ name, userId, size = 36, version = "" }: { name: string; userId?: string; size?: number; version?: string }) {
 const [failed, setFailed] = useState(false);
 const [ready,setReady]=useState(false);
 useEffect(()=>setReady(true),[]);
 const [revision,setRevision]=useState(version);
 useEffect(()=>{const refresh=()=>{setFailed(false);setRevision(String(Date.now()));};window.addEventListener("avatar-updated",refresh);return()=>window.removeEventListener("avatar-updated",refresh);},[]);
 const initials=name.split(/\s+/).filter(Boolean).slice(0,2).map(p=>p[0]?.toUpperCase()).join("");
 return <span className="inline-flex shrink-0 overflow-hidden items-center justify-center rounded-full bg-turquesa/20 font-bold text-ink" style={{width:size,height:size,fontSize:size*.34}} aria-hidden="true">
 {ready && userId && !failed ? <img key={userId+revision} src={`/api/avatar/${encodeURIComponent(userId)}?v=${encodeURIComponent(revision)}`} alt="" className="h-full w-full object-cover" onError={()=>setFailed(true)} /> : initials || "D&D"}
 </span>;
}
