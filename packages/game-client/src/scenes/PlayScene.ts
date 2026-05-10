import * as Phaser from "phaser";

import type { StudyHallHooks } from "../types";
import { findPath, type GridPoint } from "../world/pathfind";
import {
  buildGroundLayer,
  buildInteractionTable,
  MAP_H,
  MAP_W,
  TILE_SIZE,
} from "../world/sampleLevel";
import { generateTextures } from "../world/textures";

export class PlayScene extends Phaser.Scene {
  private static hooksRef: StudyHallHooks | null = null;

  static configure(hooks: StudyHallHooks) {
    PlayScene.hooksRef = hooks;
  }

  private hooks: StudyHallHooks = { onHudMessage: () => {} };

  private grid: number[][] = [];
  private interactions = buildInteractionTable();

  private playerGrid: GridPoint = { x: 3, y: 8 };
  private player!: Phaser.GameObjects.Sprite;

  private moving = false;
  private pathRunId = 0;

  private keyW!: Phaser.Input.Keyboard.Key;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyS!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super("PlayScene");
  }

  create() {
    this.hooks = PlayScene.hooksRef ?? { onHudMessage: () => {} };
    this.grid = buildGroundLayer();

    generateTextures(this);

    const map = this.make.tilemap({
      data: this.grid,
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
    });

    const tileset = map.addTilesetImage(
      "tiles",
      "tiles-sheet",
      TILE_SIZE,
      TILE_SIZE,
      0,
      0,
      0,
    );

    if (!tileset) {
      throw new Error("Falha ao criar tileset.");
    }

    const layer = map.createLayer(0, tileset, 0, 0);
    layer?.setDepth(0);
    layer?.setTint(0xfff2d6);

    const worldW = MAP_W * TILE_SIZE;
    const worldH = MAP_H * TILE_SIZE;

    this.cameras.main.setBounds(0, 0, worldW, worldH);
    this.cameras.main.setRoundPixels(true);

    const { x, y } = this.gridToWorld(this.playerGrid);
    this.player = this.add.sprite(x, y, "player-0");
    this.player.setOrigin(0.5, 0.85);
    this.player.setDepth(this.player.y + 10_000);
    this.player.play("player-idle");

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

    const kb = this.input.keyboard;
    if (!kb) {
      throw new Error("Teclado indisponível.");
    }

    this.keyW = kb.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = kb.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = kb.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = kb.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.cursors = kb.createCursorKeys();

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (!pointer.leftButtonDown()) return;
      const tile = this.screenToTile(pointer.worldX, pointer.worldY);
      if (this.tryInteractAt(tile.x, tile.y)) {
        return;
      }
      this.startPath(tile);
    });
  }

  update() {
    if (this.moving) return;

    if (Phaser.Input.Keyboard.JustDown(this.keyW) || Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      void this.tryKeyboardStep(0, -1);
    } else if (Phaser.Input.Keyboard.JustDown(this.keyS) || Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      void this.tryKeyboardStep(0, 1);
    } else if (Phaser.Input.Keyboard.JustDown(this.keyA) || Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      void this.tryKeyboardStep(-1, 0);
    } else if (Phaser.Input.Keyboard.JustDown(this.keyD) || Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      void this.tryKeyboardStep(1, 0);
    }
  }

  private screenToTile(worldX: number, worldY: number): GridPoint {
    const tx = Phaser.Math.Clamp(Math.floor(worldX / TILE_SIZE), 0, MAP_W - 1);
    const ty = Phaser.Math.Clamp(Math.floor(worldY / TILE_SIZE), 0, MAP_H - 1);
    return { x: tx, y: ty };
  }

  private gridToWorld(tile: GridPoint): { x: number; y: number } {
    return {
      x: tile.x * TILE_SIZE + TILE_SIZE / 2,
      y: tile.y * TILE_SIZE + TILE_SIZE / 2,
    };
  }

  private tryInteractAt(tx: number, ty: number): boolean {
    const key = `${tx},${ty}`;
    const def = this.interactions[key];
    if (!def) return false;
    this.hooks.onHudMessage(def.message);
    this.player.play("player-idle");
    return true;
  }

  private startPath(goal: GridPoint) {
    const path = findPath(this.grid, this.playerGrid, goal);
    if (path.length === 0) {
      return;
    }
    this.pathRunId += 1;
    const runId = this.pathRunId;
    void this.runPath(path, runId);
  }

  private async runPath(path: GridPoint[], runId: number) {
    for (const step of path) {
      if (!this.sys.settings.active) return;
      if (runId !== this.pathRunId) return;
      const ok = await this.moveToTile(step);
      if (!ok) break;
    }
    if (this.sys.settings.active && runId === this.pathRunId) {
      this.player.play("player-idle");
    }
  }

  private async tryKeyboardStep(dx: number, dy: number) {
    this.pathRunId += 1;
    const nx = this.playerGrid.x + dx;
    const ny = this.playerGrid.y + dy;
    await this.moveToTile({ x: nx, y: ny });
  }

  private moveToTile(target: GridPoint): Promise<boolean> {
    if (this.moving) return Promise.resolve(false);

    if (target.x < 0 || target.y < 0 || target.x >= MAP_W || target.y >= MAP_H) {
      return Promise.resolve(false);
    }

    const tile = this.grid[target.y][target.x];
    if (tile !== 0) {
      return Promise.resolve(false);
    }

    this.moving = true;
    this.player.play("player-walk");

    const world = this.gridToWorld(target);

    return new Promise((resolve) => {
      this.tweens.add({
        targets: this.player,
        x: world.x,
        y: world.y,
        duration: 140,
        ease: Phaser.Math.Easing.Sine.InOut,
        onUpdate: () => {
          this.player.setDepth(this.player.y + 10_000);
        },
        onComplete: () => {
          this.playerGrid = target;
          this.moving = false;
          resolve(true);
        },
      });
    });
  }
}
