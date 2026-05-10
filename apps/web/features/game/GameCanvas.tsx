"use client";

import { createStudyHallGame } from "@repo/game-client";
import { useEffect, useRef } from "react";

import { useGameShellStore } from "./store";

export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const setHudMessage = useGameShellStore((s) => s.setHudMessage);

  useEffect(() => {
    const parent = containerRef.current;
    if (!parent) return;

    const game = createStudyHallGame(parent, {
      onHudMessage: setHudMessage,
    });

    return () => {
      game.destroy();
    };
  }, [setHudMessage]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full min-h-0 touch-none select-none bg-[#cfe8b8]"
      aria-label="Área do jogo Phaser"
    />
  );
}
