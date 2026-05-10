export type StudyHallHooks = {
  /** Mensagens curtas para HUD React (interações, dicas). */
  onHudMessage: (message: string | null) => void;
  onContextActions?: (actions: ContextAction[]) => void;
  onStatsChange?: (stats: HudStats) => void;
};

export type DestroyableGame = {
  destroy: () => void;
  chooseContextAction: (actionId: string) => void;
  setCameraZoom: (zoom: number) => void;
  setTimeMode: (mode: TimeMode) => void;
  setVolume: (volume: number) => void;
};

export type TimeMode = "day" | "night";

export type ContextAction = {
  id: string;
  label: string;
};

export type HudStats = {
  pomodoroLabel: string;
  xp: number;
  coins: number;
  timeMode: TimeMode;
  petFollowing: boolean;
  studying: boolean;
};
