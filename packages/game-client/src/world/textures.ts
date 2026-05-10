import * as Phaser from "phaser";

import { TILE_SIZE } from "./sampleLevel";

function blitAt(
  dest: CanvasRenderingContext2D,
  dx: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
) {
  dest.save();
  dest.translate(dx, 0);
  draw(dest);
  dest.restore();
}

function drawGrass(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#7ec96f";
  ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  ctx.fillStyle = "#6fb863";
  ctx.fillRect(0, 12, TILE_SIZE, 4);
  ctx.fillStyle = "#9fe28a";
  ctx.fillRect(2, 3, 4, 4);
  ctx.fillStyle = "#5aa84f";
  ctx.fillRect(10, 8, 3, 3);
}

function drawWall(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#6a4c3b";
  ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  ctx.fillStyle = "#8b6349";
  ctx.fillRect(0, 0, TILE_SIZE, 4);
  ctx.fillStyle = "#4a3426";
  ctx.fillRect(0, TILE_SIZE - 3, TILE_SIZE, 3);
}

function drawWater(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#5b8ac4";
  ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  ctx.fillStyle = "#7aa7d6";
  ctx.fillRect(2, 6, 10, 2);
  ctx.fillStyle = "#4f78ad";
  ctx.fillRect(6, 10, 8, 2);
}

function drawDesk(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#8b6f47";
  ctx.fillRect(2, 4, 12, 10);
  ctx.fillStyle = "#a6845c";
  ctx.fillRect(2, 3, 12, 3);
  ctx.fillStyle = "#4f3a2b";
  ctx.fillRect(4, 6, 8, 2);
}

function drawShelf(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#7a5230";
  ctx.fillRect(1, 2, 14, 12);
  ctx.fillStyle = "#cfa87a";
  ctx.fillRect(2, 4, 12, 2);
  ctx.fillRect(2, 8, 12, 2);
  ctx.fillStyle = "#3f2918";
  ctx.fillRect(1, 14, 14, 2);
}

function drawPlayerFrame(ctx: CanvasRenderingContext2D, frame: 0 | 1) {
  const ox = frame === 1 ? 1 : 0;
  ctx.clearRect(0, 0, 18, 22);
  ctx.fillStyle = "#f2c4a8";
  ctx.fillRect(5 + ox, 3, 8, 7);
  ctx.fillStyle = "#3b6cb5";
  ctx.fillRect(4 + ox, 10, 10, 9);
  ctx.fillStyle = "#2f4f8f";
  ctx.fillRect(4 + ox, 17, 10, 3);
  ctx.fillStyle = "#2a2a2a";
  ctx.fillRect(6 + ox, 5, 2, 2);
  ctx.fillRect(10 + ox, 5, 2, 2);
}

export function generateTextures(scene: Phaser.Scene) {
  const sheetW = TILE_SIZE * 5;
  const sheet = scene.textures.createCanvas("tiles-sheet", sheetW, TILE_SIZE);
  if (!sheet) {
    throw new Error("Não foi possível criar o spritesheet de tiles.");
  }
  const sctx = sheet.getContext();
  blitAt(sctx, 0, drawGrass);
  blitAt(sctx, TILE_SIZE, drawWall);
  blitAt(sctx, TILE_SIZE * 2, drawWater);
  blitAt(sctx, TILE_SIZE * 3, drawDesk);
  blitAt(sctx, TILE_SIZE * 4, drawShelf);
  sheet.refresh();

  for (const frame of [0, 1] as const) {
    const key = frame === 0 ? "player-0" : "player-1";
    const t = scene.textures.createCanvas(key, 18, 22);
    if (!t) {
      throw new Error(`Não foi possível criar textura ${key}.`);
    }
    const ctx = t.getContext();
    drawPlayerFrame(ctx, frame);
    t.refresh();
  }

  scene.anims.create({
    key: "player-idle",
    frames: [{ key: "player-0" }],
    frameRate: 1,
    repeat: -1,
  });

  scene.anims.create({
    key: "player-walk",
    frames: [
      { key: "player-0" },
      { key: "player-1" },
    ],
    frameRate: 8,
    repeat: -1,
  });
}
