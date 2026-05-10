import Link from "next/link";

import { signOutAction } from "@/lib/actions/auth";
import { getSessionUser } from "@/lib/auth/session";

export async function SiteHeader() {
  const user = await getSessionUser();

  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          SPG
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link
            href="/play"
            className="rounded-md px-2 py-1 text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Jogar (offline)
          </Link>
          {user ? (
            <>
              <Link
                href="/profile"
                className="rounded-md px-2 py-1 text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                Perfil
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="rounded-md border border-zinc-300 px-3 py-1 font-medium text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
                >
                  Sair
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-2 py-1 text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                Entrar
              </Link>
              <Link
                href="/sign-up"
                className="rounded-md bg-zinc-900 px-3 py-1.5 font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                Criar conta
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
