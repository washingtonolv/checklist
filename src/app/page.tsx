import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  const user = await getSessionUser();
  redirect(user ? "/painel" : "/login");
}

