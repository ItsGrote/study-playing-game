"use client";

import { GameCanvas } from "./GameCanvas";
import { useGameShellStore } from "./store";

export function GameShell() {
  const phase = useGameShellStore((s) => s.phase);
  const hudMessage = useGameShellStore((s) => s.hudMessage);
  const start = useGameShellStore((s) => s.start);
  const exitToMenu = useGameShellStore((s) => s.exitToMenu);
  const clearHud = useGameShellStore((s) => s.clearHud);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#eadfc7] text-zinc-900">
      {phase === "menu" ? (
        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-6 px-6 py-10">
          <div className="w-full rounded-3xl border border-amber-900/10 bg-white/70 p-8 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-900/60">
              Modo offline · M5
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-amber-950">
              Quarto de estudos
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-amber-950/80">
              Um protótipo local em pixel art: WASD ou setas, clique para caminhar, objetos clicáveis não puxam o
              personagem. Multiplayer entra depois, mantendo a engine separada do React.
            </p>
            <button
              type="button"
              onClick={start}
              className="mt-6 w-full rounded-2xl bg-amber-900 px-4 py-3 text-sm font-semibold text-amber-50 shadow-sm transition hover:bg-amber-800"
            >
              Entrar no quarto
            </button>
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-3 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-amber-900/60">
              WASD / clique · interações no painel
            </p>
            <button
              type="button"
              onClick={() => {
                clearHud();
                exitToMenu();
              }}
              className="rounded-full border border-amber-900/15 bg-white/70 px-3 py-1 text-xs font-semibold text-amber-950 transition hover:bg-white"
            >
              Voltar ao menu
            </button>
          </div>

          {hudMessage ? (
            <div className="flex items-start justify-between gap-3 rounded-2xl border border-amber-900/10 bg-white/80 px-4 py-3 text-sm text-amber-950 shadow-sm">
              <p className="leading-relaxed">{hudMessage}</p>
              <button
                type="button"
                onClick={clearHud}
                className="shrink-0 rounded-full bg-amber-900/10 px-2 py-1 text-xs font-semibold text-amber-950"
              >
                Fechar
              </button>
            </div>
          ) : null}

          <div className="min-h-0 flex-1 overflow-hidden rounded-3xl border border-amber-900/10 bg-[#cfe8b8] shadow-inner">
            <GameCanvas />
          </div>
        </div>
      )}
    </div>
  );
}
