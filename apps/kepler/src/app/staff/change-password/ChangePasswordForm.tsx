"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useActionState, useEffect } from "react";
import Field from "@/components/staff/Field";
import { changePassword, type ChangePasswordState } from "./actions";

export default function ChangePasswordForm({ forced }: { forced: boolean }) {
  const router = useRouter();
  const { update } = useSession();
  const [state, action, pending] = useActionState<ChangePasswordState, FormData>(
    changePassword,
    {}
  );

  useEffect(() => {
    if (!state.success) return;
    // Refresh the JWT so mustChangePassword clears without a re-login, then continue.
    void update().then(() => {
      router.push("/staff");
      router.refresh();
    });
  }, [state.success, update, router]);

  return (
    <form action={action} className="space-y-6">
      <Field
        label={forced ? "Temporary password" : "Current password"}
        name="currentPassword"
        type="password"
        autoComplete="current-password"
        required
        autoFocus
        disabled={pending}
      />
      <Field
        label="New password"
        name="newPassword"
        type="password"
        autoComplete="new-password"
        required
        disabled={pending}
        hint="At least 12 characters."
      />
      <Field
        label="Confirm new password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
        disabled={pending}
      />

      {state.error && (
        <p role="alert" className="text-sm font-light text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-primary text-background hover:bg-primary/90 w-full rounded-sm px-6 py-3 text-sm tracking-[0.15em] uppercase transition-colors disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save password"}
      </button>
    </form>
  );
}
