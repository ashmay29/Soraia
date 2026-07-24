"use client";

import { useSession } from "next-auth/react";
import { useActionState, useEffect } from "react";
import Field from "@/components/staff/Field";
import { changePassword, type ChangePasswordState } from "./actions";

export default function ChangePasswordForm({ forced }: { forced: boolean }) {
  const { update } = useSession();
  const [state, action, pending] = useActionState<ChangePasswordState, FormData>(
    changePassword,
    {}
  );

  useEffect(() => {
    if (!state.success) return;
    let active = true;

    (async () => {
      // Refresh the JWT so the forced-change flag clears without a re-login. The DB
      // flag is already cleared by the action, so continue even if this call fails.
      try {
        await update();
      } catch {
        // ignored — the full-page navigation below re-reads the session regardless
      }
      if (!active) return;
      // A full-page navigation (not router.push) guarantees the server re-reads the
      // refreshed session cookie. A soft push can land on /staff against a cached
      // client render that still sees mustChangePassword and bounces straight back
      // here — which looked like "nothing happened" after saving.
      window.location.assign("/staff");
    })();

    return () => {
      active = false;
    };
  }, [state.success, update]);

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
