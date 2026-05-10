import * as Phaser from "phaser";

import type { GridPoint } from "../world/pathfind";
import { TILE_SIZE } from "../world/sampleLevel";

export abstract class Entity {
  constructor(
    readonly id: string,
    readonly sprite: Phaser.GameObjects.Sprite,
  ) {}

  get grid(): GridPoint {
    return {
      x: Math.floor(this.sprite.x / TILE_SIZE),
      y: Math.floor(this.sprite.y / TILE_SIZE),
    };
  }

  setDepth() {
    this.sprite.setDepth(this.sprite.y + 10_000);
  }
}
