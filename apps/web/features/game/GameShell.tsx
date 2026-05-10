"use client";

import { useEffect } from "react";

import { GameCanvas } from "./GameCanvas";
import { useGameShellStore } from "./store";

const DEFAULT_ZOOM = 1.8;

export function GameShell() {
  const phase = useGameShellStore((s) => s.phase);
  const hudMessage = useGameShellStore((s) => s.hudMessage);
  const contextActions = useGameShellStore((s) => s.contextActions);
  const stats = useGameShellStore((s) => s.stats);
  const timeMode = useGameShellStore((s) => s.timeMode);
  const zoom = useGameShellStore((s) => s.zoom);
  const volume = useGameShellStore((s) => s.volume);
  const escMenuOpen = useGameShellStore((s) => s.escMenuOpen);
  const start = useGameShellStore((s) => s.start);
  const exitToMenu = useGameShellStore((s) => s.exitToMenu);
  const clearHud = useGameShellStore((s) => s.clearHud);
  const setTimeMode = useGameShellStore((s) => s.setTimeMode);
  const setZoom = useGameShellStore((s) => s.setZoom);
  const setVolume = useGameShellStore((s) => s.setVolume);
  const toggleEscMenu = useGameShellStore((s) => s.toggleEscMenu);
  const closeEscMenu = useGameShellStore((s) => s.closeEscMenu);

  const chooseAction = (actionId: string) => {
    window.dispatchEvent(new CustomEvent("spg:context-action", { detail: actionId }));
  };

  useEffect(() => {
    if (phase !== "running") return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") toggleEscMenu();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase, toggleEscMenu]);

  return (
    <div className="relative h-dvh w-dvw overflow-hidden bg-[#151722] text-amber-50">
      {phase === "running" ? <GameCanvas /> : null}

      {phase === "menu" ? (
        <div className="absolute inset-0 flex items-center justify-center bg-[#151722] px-6">
          <div className="w-full max-w-sm rounded-3xl border border-amber-200/15 bg-[#211b1f]/90 p-6 shadow-2xl backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200/60">Modo offline</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-amber-50">Quarto de estudos</h1>
            <p className="mt-3 text-sm leading-relaxed text-amber-100/75">
              Vertical slice fullscreen com pipeline para assets reais, mapas Tiled e atmosfera cozy.
            </p>
            <button
              type="button"
              onClick={start}
              className="mt-6 w-full rounded-2xl bg-amber-300 px-4 py-3 text-sm font-bold text-[#2a1d16] shadow-lg transition hover:bg-amber-200"
            >
              Entrar
            </button>
          </div>
        </div>
      ) : null}

      {phase === "running" ? (
        <>
          <div className="pointer-events-none absolute left-4 top-4 rounded-2xl border border-amber-100/20 bg-[#1e1a22]/75 px-4 py-3 shadow-xl backdrop-blur">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-100/50">Pomodoro</p>
            <p className="font-mono text-2xl font-semibold text-amber-50">{stats.pomodoroLabel}</p>
          </div>

          <div className="pointer-events-none absolute right-4 top-4 flex items-center gap-2">
            <div className="rounded-2xl border border-amber-100/20 bg-[#1e1a22]/75 px-4 py-3 shadow-xl backdrop-blur">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-100/50">XP</p>
              <div className="mt-1 h-2 w-28 overflow-hidden rounded-full bg-amber-100/15">
                <div className="h-full rounded-full bg-emerald-400" style={{ width: `${stats.xp}%` }} />
              </div>
            </div>
            <div className="rounded-2xl border border-amber-100/20 bg-[#1e1a22]/75 px-4 py-3 text-sm font-semibold text-amber-50 shadow-xl backdrop-blur">
              {stats.coins} moedas
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-4 right-4 h-24 w-32 rounded-2xl border border-amber-100/20 bg-[#466d5a]/80 p-2 shadow-xl backdrop-blur">
            <div className="h-full w-full rounded-xl border border-white/25 bg-[#2f5045]" />
          </div>

          {hudMessage ? (
            <div className="absolute bottom-4 left-4 max-w-md rounded-2xl border border-amber-100/20 bg-[#1e1a22]/85 p-4 text-sm text-amber-50 shadow-xl backdrop-blur">
              <p className="leading-relaxed">{hudMessage}</p>
              <button
                type="button"
                onClick={clearHud}
                className="mt-3 rounded-full bg-amber-100/15 px-3 py-1 text-xs font-semibold text-amber-50"
              >
                Fechar
              </button>
            </div>
          ) : null}

          {contextActions.length > 0 ? (
            <div className="absolute bottom-28 left-4 flex max-w-md flex-wrap gap-2 rounded-2xl border border-amber-100/20 bg-[#fff3d6]/90 p-3 shadow-xl backdrop-blur">
              {contextActions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => chooseAction(action.id)}
                  className="rounded-full bg-[#6d3e24] px-4 py-2 text-xs font-bold text-amber-50 transition hover:bg-[#8a5637]"
                >
                  {action.label}
                </button>
              ))}
            </div>
          ) : null}

          <button
            type="button"
            onClick={toggleEscMenu}
            className="absolute left-4 top-24 rounded-full border border-amber-100/20 bg-[#1e1a22]/75 px-3 py-2 text-xs font-semibold text-amber-50 shadow-xl backdrop-blur"
          >
            ESC
          </button>

          {escMenuOpen ? (
            <div className="absolute inset-0 flex items-center justify-center bg-[#080a12]/55 px-5 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-3xl border border-amber-100/20 bg-[#211b1f]/95 p-5 text-sm text-amber-50 shadow-2xl">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-100/50">Menu</p>
                  <button type="button" onClick={closeEscMenu} className="rounded-full bg-white/10 px-3 py-1 text-xs">
                    Fechar
                  </button>
                </div>

                <label className="mt-5 block text-xs font-semibold text-amber-100/65" htmlFor="volume">
                  Volume
                </label>
                <input
                  id="volume"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(event) => setVolume(Number(event.target.value))}
                  className="mt-2 w-full accent-amber-300"
                />

                <label className="mt-5 block text-xs font-semibold text-amber-100/65" htmlFor="zoom">
                  Zoom
                </label>
                <input
                  id="zoom"
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(event) => setZoom(Number(event.target.value))}
                  className="mt-2 w-full accent-amber-300"
                />

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setZoom(DEFAULT_ZOOM)}
                    className="rounded-2xl bg-white/10 px-3 py-2 text-xs font-semibold"
                  >
                    Zoom padrão
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeMode(timeMode === "day" ? "night" : "day")}
                    className="rounded-2xl bg-amber-300 px-3 py-2 text-xs font-bold text-[#2a1d16]"
                  >
                    {timeMode === "day" ? "Modo noite" : "Modo dia"}
                  </button>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-amber-100/65">
                  Configurações de estudo e preferências futuras ficarão aqui.
                </div>

                <button
                  type="button"
                  onClick={() => {
                    clearHud();
                    exitToMenu();
                  }}
                  className="mt-4 w-full rounded-2xl border border-white/10 px-3 py-2 text-xs font-semibold text-amber-50"
                >
                  Sair para o menu
                </button>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
