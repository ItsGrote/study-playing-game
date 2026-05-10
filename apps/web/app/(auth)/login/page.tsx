import { Suspense } from "react";

import { LoginForm } from "@/components/login-form";

function LoginFallback() {
  return (
    <div className="flex flex-col gap-4 text-sm text-zinc-500 dark:text-zinc-400">Carregando…</div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
