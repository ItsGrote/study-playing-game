"use client";

import Link from "next/link";
import { useActionState } from "react";

import { updatePasswordAction, type AuthMessageState } from "@/lib/actions/auth";

export default function UpdatePasswordPage() {
  const [state, formAction, pending] = useActionState<AuthMessageState | null, FormData>(
    updatePasswordAction,
    null,
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Nova senha</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Defina uma senha forte após abrir o link enviado por e-mail.
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        {state?.error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200">
            {state.error}
          </p>
        ) : null}

        <div className="flex flex-col gap-1">
          <label
            className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
            htmlFor="password"
          >
            Nova senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={128}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          {pending ? "Salvando…" : "Atualizar senha"}
        </button>
      </form>

      <Link className="text-sm font-medium text-zinc-900 underline dark:text-zinc-100" href="/login">
        Voltar ao login
      </Link>
    </div>
  );
}
