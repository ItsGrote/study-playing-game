import Link from "next/link";
import { WORKSPACE_NAME } from "@repo/shared";

import { getSessionUser } from "@/lib/auth/session";

export default async function Home() {
  const user = await getSessionUser();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-16">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {WORKSPACE_NAME} · M2 + M5
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Autenticação e primeiro protótipo jogável
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">
          Há um quarto em pixel art para explorar offline (Phaser local). Autenticação e perfil seguem no fluxo
          principal; o multiplayer virá depois, com a engine isolada em{" "}
          <code className="font-mono text-sm">@repo/game-client</code>.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/play"
          className="rounded-lg bg-emerald-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
        >
          Abrir jogo offline
        </Link>
        {user ? (
          <Link
            href="/profile"
            className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Abrir perfil
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
            >
              Entrar
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              Criar conta
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
