import * as Phaser from "phaser";

import type { RoomLayers } from "../world/sampleLevel";
import { MAP_H, MAP_W, TILE, TILE_SIZE } from "../world/sampleLevel";

export class RoomRenderingSystem {
  constructor(private readonly scene: Phaser.Scene) {}

  render(layers: RoomLayers) {
    this.renderFloor(layers);
    this.renderWalls(layers);
    this.renderDecor(layers);
  }

  private renderFloor(layers: RoomLayers) {
    const g = this.scene.add.graphics();
    g.setDepth(0);
    g.fillStyle(0x7d604c, 1);
    g.fillRect(0, 0, MAP_W * TILE_SIZE, MAP_H * TILE_SIZE);

    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const tile = layers.floor[y][x];
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;
        if (tile === TILE.RUG) {
          g.fillStyle(0xb85f60, 1);
          g.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          g.fillStyle((x + y) % 2 === 0 ? 0xd98375 : 0x9e4851, 1);
          g.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        } else {
          g.fillStyle((x + y) % 2 === 0 ? 0x9c7657 : 0x8c674e, 1);
          g.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          g.fillStyle(0x6f503f, 0.55);
          g.fillRect(px, py + TILE_SIZE - 1, TILE_SIZE, 1);
          if (x % 3 === 0) g.fillRect(px, py, 1, TILE_SIZE);
        }
      }
    }
  }

  private renderWalls(layers: RoomLayers) {
    const g = this.scene.add.graphics();
    g.setDepth(1_000);
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        if (layers.walls[y][x] === 0) continue;
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;
        g.fillStyle(0xd5b478, 1);
        g.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        g.fillStyle(0xf0d9a1, 0.9);
        g.fillRect(px, py, TILE_SIZE, 5);
        g.fillStyle(0x60402f, 0.42);
        g.fillRect(px, py + TILE_SIZE - 3, TILE_SIZE, 3);
      }
    }

    g.fillStyle(0x2f211d, 0.18);
    g.fillRect(TILE_SIZE, 4 * TILE_SIZE, (MAP_W - 2) * TILE_SIZE, 10);
  }

  private renderDecor(layers: RoomLayers) {
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const tile = layers.decor[y][x];
        if (tile === 0) continue;
        this.drawObjectTile(tile, x, y);
      }
    }
  }

  private drawObjectTile(tile: number, x: number, y: number) {
    const g = this.scene.add.graphics();
    const px = x * TILE_SIZE;
    const py = y * TILE_SIZE;
    g.setDepth(py + TILE_SIZE + 10_000);
    g.fillStyle(0x221915, 0.24);
    g.fillEllipse(px + TILE_SIZE / 2, py + TILE_SIZE - 1, TILE_SIZE * 0.8, 4);

    switch (tile) {
      case TILE.BED:
        g.fillStyle(0x6f4837, 1);
        g.fillRect(px + 1, py + 1, 14, 14);
        g.fillStyle(0xd86765, 1);
        g.fillRect(px + 2, py + 5, 12, 9);
        g.fillStyle(0x9bc4d7, 1);
        g.fillRect(px + 2, py + 2, 12, 4);
        break;
      case TILE.DESK:
      case TILE.TABLE:
      case TILE.COUNTER:
        g.fillStyle(0x6b432e, 1);
        g.fillRect(px + 1, py + 5, 14, 9);
        g.fillStyle(0xb87c4e, 1);
        g.fillRect(px + 1, py + 2, 14, 5);
        break;
      case TILE.SHELF:
      case TILE.WARDROBE:
        g.fillStyle(0x593825, 1);
        g.fillRect(px + 1, py + 1, 14, 14);
        g.fillStyle(0xa76d44, 1);
        g.fillRect(px + 3, py + 3, 10, 10);
        break;
      case TILE.AQUARIUM:
        g.fillStyle(0x33546d, 1);
        g.fillRect(px + 1, py + 3, 14, 10);
        g.fillStyle(0x8fdce7, 0.85);
        g.fillRect(px + 2, py + 4, 12, 8);
        break;
      case TILE.PLANT:
        g.fillStyle(0x6b432e, 1);
        g.fillRect(px + 5, py + 10, 7, 5);
        g.fillStyle(0x3ea86a, 1);
        g.fillCircle(px + 8, py + 7, 5);
        break;
      case TILE.LAMP:
        g.fillStyle(0x45536b, 1);
        g.fillRect(px + 7, py + 6, 2, 8);
        g.fillStyle(0xf1d27a, 1);
        g.fillCircle(px + 8, py + 4, 5);
        break;
      case TILE.CHAIR:
        g.fillStyle(0x5b3829, 1);
        g.fillRect(px + 4, py + 4, 8, 10);
        g.fillStyle(0xc75f5e, 1);
        g.fillRect(px + 5, py + 3, 6, 5);
        break;
      case TILE.PET_BED:
        g.fillStyle(0xc96f87, 1);
        g.fillEllipse(px + 8, py + 9, 13, 9);
        g.fillStyle(0xffc0cc, 1);
        g.fillEllipse(px + 8, py + 9, 7, 4);
        break;
      case TILE.WINDOW_WALL:
        g.fillStyle(0x704730, 1);
        g.fillRect(px + 1, py + 1, 14, 14);
        g.fillStyle(0x8ddbe7, 1);
        g.fillRect(px + 3, py + 3, 10, 8);
        break;
      case TILE.SOFA:
        g.fillStyle(0x6f4d66, 1);
        g.fillRect(px + 1, py + 5, 14, 9);
        g.fillStyle(0xb97791, 1);
        g.fillRect(px + 2, py + 4, 12, 5);
        break;
      default:
        g.fillStyle(0x6c4a39, 1);
        g.fillRect(px + 2, py + 2, 12, 12);
    }
  }
}
