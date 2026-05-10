import { create } from "zustand";

export type GameShellPhase = "menu" | "running";

type GameShellState = {
  phase: GameShellPhase;
  hudMessage: string | null;
  start: () => void;
  exitToMenu: () => void;
  setHudMessage: (message: string | null) => void;
  clearHud: () => void;
};

export const useGameShellStore = create<GameShellState>((set) => ({
  phase: "menu",
  hudMessage: null,
  start: () => set({ phase: "running", hudMessage: null }),
  exitToMenu: () => set({ phase: "menu" }),
  setHudMessage: (message) => set({ hudMessage: message }),
  clearHud: () => set({ hudMessage: null }),
}));
