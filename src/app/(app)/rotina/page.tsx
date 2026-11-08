import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth-server";
import { ManagerRoutine } from "@/components/layout/ManagerRoutine";
export const dynamic = "force-dynamic";
export default async function RoutinePage({searchParams}: {searchParams:{data?:string}}) {
  const user = await requireUser();
  if (user.role !== "manager" && process.env.VERCEL_ENV !== "preview") notFound();
  return <ManagerRoutine user={user} date={searchParams.data} />;
}
