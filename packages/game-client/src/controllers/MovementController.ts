import * as Phaser from "phaser";

import type { AvatarDirection } from "../entities/avatar";
import { directionFromVector } from "../entities/avatar";
import type { GridPoint } from "../world/pathfind";
import {
  isWalkableTile,
  MAP_H,
  MAP_W,
  TILE_SIZE,
} from "../world/sampleLevel";

export type MovementInput = {
  x: number;
  y: number;
};

export type MovementState = {
  grid: GridPoint;
  direction: AvatarDirection;
  moving: boolean;
};

const PLAYER_SPEED = 92;
const PATH_REACH_DISTANCE = 2.4;

export class MovementController {
  private path: GridPoint[] = [];
  private pathIndex = 0;
  private lastDirection: AvatarDirection = "down";

  constructor(
    private readonly sprite: Phaser.GameObjects.Sprite,
    private readonly grid: number[][],
  ) {}

  clearPath() {
    this.path = [];
    this.pathIndex = 0;
  }

  setPath(path: GridPoint[]) {
    this.path = path;
    this.pathIndex = 0;
  }

  get hasPath() {
    return this.pathIndex < this.path.length;
  }

  update(deltaMs: number, input: MovementInput): MovementState {
    const manual = normalize(input);
    let vx = manual.x;
    let vy = manual.y;

    if (vx !== 0 || vy !== 0) {
      this.clearPath();
    } else if (this.hasPath) {
      const target = this.gridToWorld(this.path[this.pathIndex]);
      const dx = target.x - this.sprite.x;
      const dy = target.y - this.sprite.y;
      const distance = Math.hypot(dx, dy);

      if (distance <= PATH_REACH_DISTANCE) {
        this.sprite.setPosition(target.x, target.y);
        this.pathIndex += 1;
      }

      if (this.hasPath) {
        const next = this.gridToWorld(this.path[this.pathIndex]);
        const ndx = next.x - this.sprite.x;
        const ndy = next.y - this.sprite.y;
        const nextDistance = Math.max(Math.hypot(ndx, ndy), 0.001);
        vx = ndx / nextDistance;
        vy = ndy / nextDistance;
      }
    }

    const moving = vx !== 0 || vy !== 0;
    if (moving) {
      this.lastDirection = directionFromVector(vx, vy);
      this.moveBy(vx * PLAYER_SPEED * (deltaMs / 1000), vy * PLAYER_SPEED * (deltaMs / 1000));
    }

    this.sprite.setDepth(this.sprite.y + 10_000);

    return {
      grid: this.worldToGrid(this.sprite.x, this.sprite.y),
      direction: this.lastDirection,
      moving,
    };
  }

  private moveBy(dx: number, dy: number) {
    if (dx !== 0) {
      const nx = Phaser.Math.Clamp(this.sprite.x + dx, TILE_SIZE / 2, MAP_W * TILE_SIZE - TILE_SIZE / 2);
      if (this.canOccupy(nx, this.sprite.y)) {
        this.sprite.x = nx;
      } else {
        this.clearPath();
      }
    }

    if (dy !== 0) {
      const ny = Phaser.Math.Clamp(this.sprite.y + dy, TILE_SIZE / 2, MAP_H * TILE_SIZE - TILE_SIZE / 2);
      if (this.canOccupy(this.sprite.x, ny)) {
        this.sprite.y = ny;
      } else {
        this.clearPath();
      }
    }
  }

  private canOccupy(worldX: number, worldY: number): boolean {
    const tile = this.worldToGrid(worldX, worldY);
    return isWalkableTile(this.grid, tile);
  }

  private worldToGrid(worldX: number, worldY: number): GridPoint {
    return {
      x: Phaser.Math.Clamp(Math.floor(worldX / TILE_SIZE), 0, MAP_W - 1),
      y: Phaser.Math.Clamp(Math.floor(worldY / TILE_SIZE), 0, MAP_H - 1),
    };
  }

  private gridToWorld(tile: GridPoint): { x: number; y: number } {
    return {
      x: tile.x * TILE_SIZE + TILE_SIZE / 2,
      y: tile.y * TILE_SIZE + TILE_SIZE / 2,
    };
  }
}

function normalize(input: MovementInput): MovementInput {
  if (input.x === 0 && input.y === 0) return input;
  const length = Math.hypot(input.x, input.y);
  return {
    x: input.x / length,
    y: input.y / length,
  };
}
