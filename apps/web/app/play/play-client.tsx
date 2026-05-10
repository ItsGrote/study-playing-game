"use client";

import dynamic from "next/dynamic";

const GameShell = dynamic(() => import("@/features/game/GameShell").then((m) => ({ default: m.GameShell })), {
  ssr: false,
  loading: () => (
    <div className="flex flex-1 items-center justify-center bg-[#eadfc7] px-6 py-16 text-sm text-amber-950/70">
      Carregando o quarto…
    </div>
  ),
});

export function PlayClient() {
  return <GameShell />;
}
