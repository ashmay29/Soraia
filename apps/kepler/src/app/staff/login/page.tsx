import { redirect } from "next/navigation";
import AuthShell from "@/components/staff/AuthShell";
import { safeAuth } from "@/lib/session";
import LoginForm from "./LoginForm";

export const metadata = { title: "Staff Login · Soraia" };

export default async function LoginPage() {
  const session = await safeAuth();
  if (session?.user) redirect("/staff");

  return (
    <AuthShell title="Staff Access" subtitle="Sign in to create and manage payment links.">
      <LoginForm />
    </AuthShell>
  );
}
