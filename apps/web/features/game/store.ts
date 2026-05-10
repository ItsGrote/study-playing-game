import { create } from "zustand";
import type { ContextAction, HudStats, TimeMode } from "@repo/game-client";

export type GameShellPhase = "menu" | "running";

type GameShellState = {
  phase: GameShellPhase;
  hudMessage: string | null;
  contextActions: ContextAction[];
  stats: HudStats;
  timeMode: TimeMode;
  zoom: number;
  volume: number;
  escMenuOpen: boolean;
  start: () => void;
  exitToMenu: () => void;
  setHudMessage: (message: string | null) => void;
  setContextActions: (actions: ContextAction[]) => void;
  setStats: (stats: HudStats) => void;
  setTimeMode: (mode: TimeMode) => void;
  setZoom: (zoom: number) => void;
  setVolume: (volume: number) => void;
  toggleEscMenu: () => void;
  closeEscMenu: () => void;
  clearHud: () => void;
};

export const useGameShellStore = create<GameShellState>((set) => ({
  phase: "menu",
  hudMessage: null,
  contextActions: [],
  stats: {
    pomodoroLabel: "25:00",
    xp: 28,
    coins: 128,
    timeMode: "day",
    petFollowing: false,
    studying: false,
  },
  timeMode: "day",
  zoom: 1.8,
  volume: 0.7,
  escMenuOpen: false,
  start: () => set({ phase: "running", hudMessage: null }),
  exitToMenu: () => set({ phase: "menu", contextActions: [], escMenuOpen: false }),
  setHudMessage: (message) => set({ hudMessage: message }),
  setContextActions: (actions) => set({ contextActions: actions }),
  setStats: (stats) => set({ stats }),
  setTimeMode: (mode) => set({ timeMode: mode }),
  setZoom: (zoom) => set({ zoom }),
  setVolume: (volume) => set({ volume }),
  toggleEscMenu: () => set((state) => ({ escMenuOpen: !state.escMenuOpen })),
  closeEscMenu: () => set({ escMenuOpen: false }),
  clearHud: () => set({ hudMessage: null }),
}));
