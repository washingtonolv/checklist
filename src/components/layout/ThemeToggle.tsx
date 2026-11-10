"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
export function ThemeToggle() {
 const [dark,setDark]=useState(false);
 useEffect(()=>{setDark(document.documentElement.dataset.theme==="dark");},[]);
 function toggle(){const next=!dark;setDark(next);document.documentElement.dataset.theme=next?"dark":"light";try{localStorage.setItem("dd-theme",next?"dark":"light");}catch{}}
 return <button type="button" className="rounded-full border border-line p-2 text-ink" onClick={toggle} aria-label={dark?"Ativar modo claro":"Ativar modo escuro"} title={dark?"Ativar modo claro":"Ativar modo escuro"}>{dark?<Sun size={18}/>:<Moon size={18}/>}</button>;
}
