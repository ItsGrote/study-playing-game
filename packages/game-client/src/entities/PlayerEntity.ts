import * as Phaser from "phaser";

import type { AvatarDirection } from "./avatar";
import { Entity } from "./Entity";

export class PlayerEntity extends Entity {
  private lastAnimKey = "";
  private studying = false;

  updateAnimation(direction: AvatarDirection, moving: boolean) {
    if (this.studying) return;
    const next = moving ? `player-walk-${direction}` : `player-idle-${direction}`;
    if (this.lastAnimKey === next) return;
    this.lastAnimKey = next;
    if (this.sprite.scene.anims.exists(next)) {
      this.sprite.play(next, true);
    }
  }

  sitAndStudy(world: Phaser.Math.Vector2) {
    this.studying = true;
    this.sprite.setPosition(world.x, world.y);
    if (this.sprite.scene.anims.exists("player-study")) {
      this.sprite.play("player-study", true);
    }
    this.setDepth();
  }

  stand(direction: AvatarDirection = "down") {
    this.studying = false;
    this.lastAnimKey = "";
    this.updateAnimation(direction, false);
  }

  get isStudying() {
    return this.studying;
  }
}
