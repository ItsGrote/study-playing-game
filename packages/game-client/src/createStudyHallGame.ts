import * as Phaser from "phaser";

import { PlayScene } from "./scenes/PlayScene";
import type { DestroyableGame, StudyHallHooks } from "./types";

export function createStudyHallGame(
  parent: HTMLElement,
  hooks: StudyHallHooks,
): DestroyableGame {
  PlayScene.configure(hooks);

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    pixelArt: true,
    roundPixels: true,
    backgroundColor: "#cfe8b8",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 360,
      height: 200,
      zoom: 2,
    },
    scene: [PlayScene],
  });

  return {
    destroy: () => {
      PlayScene.configure({ onHudMessage: () => {} });
      game.destroy(true, false);
    },
  };
}
