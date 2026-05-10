import * as Phaser from "phaser";

import { findPath } from "../world/pathfind";
import type { GridPoint } from "../world/pathfind";
import { TILE_SIZE } from "../world/sampleLevel";
import { Entity } from "./Entity";

const PET_SPEED = 92;

export type PetMood = "sleeping" | "sitting" | "wandering" | "following" | "happy";

export class PetEntity extends Entity {
  private mood: PetMood = "sleeping";
  private followTarget: Phaser.GameObjects.Sprite | null = null;
  private home: GridPoint;
  private wanderTarget: Phaser.Math.Vector2 | null = null;
  private path: GridPoint[] = [];
  private pathIndex = 0;
  private nextDecisionAt = 0;
  private nextPathAt = 0;

  constructor(
    id: string,
    sprite: Phaser.GameObjects.Sprite,
    home: GridPoint,
    private readonly collisionGrid: number[][],
  ) {
    super(id, sprite);
    this.home = home;
  }

  update(time: number, deltaMs: number) {
    if (this.followTarget) {
      this.mood = "following";
      this.follow(deltaMs);
    } else if (time >= this.nextDecisionAt) {
      this.pickHomeBehavior(time);
    }

    if (this.wanderTarget) {
      this.moveToward(this.wanderTarget, deltaMs);
    } else if (!this.followTarget) {
      this.followPath(deltaMs);
    }

    this.setDepth();
    this.updateAnimation();
  }

  followPlayer(target: Phaser.GameObjects.Sprite) {
    this.followTarget = target;
    this.wanderTarget = null;
    this.mood = "following";
  }

  stopFollowing() {
    this.followTarget = null;
    this.mood = "wandering";
    this.setPathTo(this.home);
  }

  pet() {
    this.mood = "happy";
    this.wanderTarget = null;
    this.nextDecisionAt = Number.POSITIVE_INFINITY;
  }

  settleAfterPet(time: number) {
    if (this.mood !== "happy") return;
    this.nextDecisionAt = time + 1800;
  }

  get isFollowing() {
    return this.followTarget !== null;
  }

  get currentMood() {
    return this.mood;
  }

  private follow(deltaMs: number) {
    if (!this.followTarget) return;
    const dx = this.followTarget.x - this.sprite.x;
    const dy = this.followTarget.y - this.sprite.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 28) return;

    const now = this.sprite.scene.time.now;
    if (now >= this.nextPathAt || this.pathIndex >= this.path.length) {
      this.nextPathAt = now + 220;
      const targetGrid = {
        x: Phaser.Math.Clamp(Math.floor((this.followTarget.x - 14) / TILE_SIZE), 1, this.collisionGrid[0].length - 2),
        y: Phaser.Math.Clamp(Math.floor((this.followTarget.y + 8) / TILE_SIZE), 1, this.collisionGrid.length - 2),
      };
      this.setPathTo(targetGrid);
    }

    this.followPath(deltaMs);
  }

  private pickHomeBehavior(time: number) {
    const roll = Phaser.Math.Between(0, 2);
    this.mood = roll === 0 ? "sleeping" : roll === 1 ? "sitting" : "wandering";
    this.nextDecisionAt = time + Phaser.Math.Between(1800, 3600);

    if (this.mood === "wandering") {
      const tx = Phaser.Math.Clamp(this.home.x + Phaser.Math.Between(-3, 3), 1, this.collisionGrid[0].length - 2);
      const ty = Phaser.Math.Clamp(this.home.y + Phaser.Math.Between(-2, 2), 1, this.collisionGrid.length - 2);
      this.setPathTo({ x: tx, y: ty });
    } else {
      this.wanderTarget = null;
      this.path = [];
    }
  }

  private setPathTo(target: GridPoint) {
    this.path = findPath(this.collisionGrid, this.grid, target);
    this.pathIndex = 0;
    this.wanderTarget = null;
  }

  private followPath(deltaMs: number) {
    if (this.pathIndex >= this.path.length) return;
    const target = this.gridToWorld(this.path[this.pathIndex]);
    this.moveToward(target, deltaMs);
    if (Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, target.x, target.y) < 2.5) {
      this.pathIndex += 1;
    }
  }

  private moveToward(target: Phaser.Math.Vector2, deltaMs: number) {
    const dx = target.x - this.sprite.x;
    const dy = target.y - this.sprite.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 1.6) {
      this.wanderTarget = null;
      return;
    }

    const step = PET_SPEED * (deltaMs / 1000);
    this.sprite.x += (dx / distance) * step;
    this.sprite.y += (dy / distance) * step;
  }

  private gridToWorld(tile: GridPoint): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(tile.x * TILE_SIZE + TILE_SIZE / 2, tile.y * TILE_SIZE + TILE_SIZE / 2);
  }

  private updateAnimation() {
    if (this.mood === "sleeping" && this.sprite.scene.anims.exists("pet-sleep")) {
      this.sprite.play("pet-sleep", true);
    } else if (this.mood === "happy" && this.sprite.scene.anims.exists("pet-happy")) {
      this.sprite.play("pet-happy", true);
    } else if (this.sprite.scene.anims.exists("pet-idle")) {
      this.sprite.play("pet-idle", true);
    }
  }
}
