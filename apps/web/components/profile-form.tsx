"use client";

import { useActionState } from "react";

import { updateProfileAction, type ProfileMessageState } from "@/lib/actions/profile";

type Props = {
  profile: {
    username: string;
    displayName: string | null;
    bio: string | null;
  };
};

export function ProfileForm({ profile }: Props) {
  const [state, formAction, pending] = useActionState<ProfileMessageState | null, FormData>(
    updateProfileAction,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state?.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
          {state.success}
        </p>
      ) : null}

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="username">
          Nome de usuário
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          minLength={3}
          maxLength={24}
          defaultValue={profile.username}
          pattern="[a-zA-Z0-9_]+"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
          htmlFor="displayName"
        >
          Nome exibido
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          maxLength={64}
          defaultValue={profile.displayName ?? ""}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200" htmlFor="bio">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          maxLength={500}
          defaultValue={profile.bio ?? ""}
          className="resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        />
        <span className="text-xs text-zinc-500">Até 500 caracteres.</span>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-fit rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
      >
        {pending ? "Salvando…" : "Salvar alterações"}
      </button>
    </form>
  );
}
