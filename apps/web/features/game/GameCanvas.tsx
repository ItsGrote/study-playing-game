"use client";

import { createStudyHallGame, type DestroyableGame } from "@repo/game-client";
import { useEffect, useRef } from "react";

import { useGameShellStore } from "./store";

export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<DestroyableGame | null>(null);
  const setHudMessage = useGameShellStore((s) => s.setHudMessage);
  const setContextActions = useGameShellStore((s) => s.setContextActions);
  const setStats = useGameShellStore((s) => s.setStats);
  const timeMode = useGameShellStore((s) => s.timeMode);
  const zoom = useGameShellStore((s) => s.zoom);
  const volume = useGameShellStore((s) => s.volume);

  useEffect(() => {
    const parent = containerRef.current;
    if (!parent) return;

    const game = createStudyHallGame(parent, {
      onHudMessage: setHudMessage,
      onContextActions: setContextActions,
      onStatsChange: setStats,
    });
    gameRef.current = game;

    return () => {
      gameRef.current = null;
      game.destroy();
    };
  }, [setContextActions, setHudMessage, setStats]);

  useEffect(() => {
    gameRef.current?.setTimeMode(timeMode);
  }, [timeMode]);

  useEffect(() => {
    gameRef.current?.setCameraZoom(zoom);
  }, [zoom]);

  useEffect(() => {
    gameRef.current?.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    const onContextAction = (event: Event) => {
      const actionId = event instanceof CustomEvent && typeof event.detail === "string" ? event.detail : null;
      if (actionId) gameRef.current?.chooseContextAction(actionId);
    };
    window.addEventListener("spg:context-action", onContextAction);
    return () => window.removeEventListener("spg:context-action", onContextAction);
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-full min-h-dvh w-full touch-none select-none bg-[#151722]"
      aria-label="Área do jogo Phaser"
    />
  );
}
