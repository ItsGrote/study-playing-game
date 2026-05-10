import Link from "next/link";
import { redirect } from "next/navigation";

import { ProfileForm } from "@/components/profile-form";
import { getSessionUser } from "@/lib/auth/session";
import { ensureProfileForUser } from "@/lib/profile/ensure-profile";

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const profile = await ensureProfileForUser(user);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/" className="underline">
            Início
          </Link>
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">Seu perfil</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          E-mail da conta: <span className="font-mono text-zinc-800 dark:text-zinc-200">{user.email}</span>
        </p>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">Dados públicos</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Estes campos serão visíveis no jogo quando a parte social estiver pronta.
        </p>
        <div className="mt-6">
          <ProfileForm
            profile={{
              username: profile.username,
              displayName: profile.displayName,
              bio: profile.bio,
            }}
          />
        </div>
      </section>
    </div>
  );
}
