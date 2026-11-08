import { notFound } from "next/navigation";
import { getDb } from "@/lib/backend/local/db";
import { isLocalMode } from "@/lib/backend";
import { ManagerRoutine } from "@/components/layout/ManagerRoutine";
import { AppShell } from "@/components/layout/AppShell";
import type { SessionUser } from "@/lib/types";
export const dynamic = "force-dynamic";
/** Public visual showcase of fictitious fixtures only, never available in production. */
export default async function ManagerShowcase({searchParams}: {searchParams:{data?:string}}) {
  if (process.env.VERCEL_ENV !== "preview" || !isLocalMode()) notFound();
  const db = await getDb();
  const fixture = db.users.find(user => user.email === "gerente@dd.local" && user.role === "manager");
  if (!fixture) notFound();
  const user: SessionUser = {id:fixture.id, name:"Mariana", email:fixture.email, role:"manager", active:true, storeIds:db.stores.filter(store => store.managerId === fixture.id).map(store => store.id)};
  return <AppShell user={user} demoMode><ManagerRoutine user={user} date={searchParams.data} basePath="/previa-gerente" /></AppShell>;
}
