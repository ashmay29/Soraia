import AuthShell from "@/components/staff/AuthShell";
import { requireUser } from "@/lib/session";
import ChangePasswordForm from "./ChangePasswordForm";

export const metadata = { title: "Change Password · Soraia" };

export default async function ChangePasswordPage() {
  // allowPasswordChange: this is the one page reachable while the flag is set.
  const user = await requireUser({ allowPasswordChange: true });

  return (
    <AuthShell
      title={user.mustChangePassword ? "Set Your Password" : "Change Password"}
      subtitle={
        user.mustChangePassword
          ? "You are signed in with a temporary password. Choose your own to continue."
          : `Signed in as ${user.email}`
      }
    >
      <ChangePasswordForm forced={user.mustChangePassword} />
    </AuthShell>
  );
}
