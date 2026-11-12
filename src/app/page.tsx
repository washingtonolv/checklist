import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function RootPage() {
  // Middleware and the protected dashboard already validate the session.
  redirect("/painel");
}
