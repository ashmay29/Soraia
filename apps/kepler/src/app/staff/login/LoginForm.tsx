"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState, type FormEvent } from "react";
import Field from "@/components/staff/Field";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });

    if (res?.error) {
      // Deliberately vague: never reveal whether the email exists.
      setError("Incorrect email or password.");
      setPending(false);
      return;
    }

    // The staff layout decides where to land — it redirects to /staff/change-password
    // while the forced-change flag is set.
    router.push("/staff");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="username"
        required
        autoFocus
        disabled={pending}
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        disabled={pending}
      />

      {error && (
        <p role="alert" className="text-sm font-light text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-primary text-background hover:bg-primary/90 w-full rounded-sm px-6 py-3 text-sm tracking-[0.15em] uppercase transition-colors disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
