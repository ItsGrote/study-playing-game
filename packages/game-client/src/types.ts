export type StudyHallHooks = {
  /** Mensagens curtas para HUD React (interações, dicas). */
  onHudMessage: (message: string | null) => void;
};

export type DestroyableGame = {
  destroy: () => void;
};
