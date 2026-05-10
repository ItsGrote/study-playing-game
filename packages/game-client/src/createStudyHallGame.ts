import * as Phaser from "phaser";

import { PlayScene } from "./scenes/PlayScene";
import type { DestroyableGame, StudyHallHooks, TimeMode } from "./types";

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
    backgroundColor: "#2e2430",
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.NO_CENTER,
      width: parent.clientWidth,
      height: parent.clientHeight,
    },
    scene: [PlayScene],
  });

  const getPlayScene = () => {
    const scene = game.scene.getScene("PlayScene");
    return scene instanceof PlayScene ? scene : null;
  };

  return {
    destroy: () => {
      PlayScene.configure({ onHudMessage: () => {} });
      game.destroy(true, false);
    },
    chooseContextAction: (actionId: string) => {
      getPlayScene()?.chooseContextAction(actionId);
    },
    setCameraZoom: (zoom: number) => {
      getPlayScene()?.setCameraZoom(zoom);
    },
    setTimeMode: (mode: TimeMode) => {
      getPlayScene()?.setTimeMode(mode);
    },
    setVolume: (volume: number) => {
      getPlayScene()?.setVolume(volume);
    },
  };
}
