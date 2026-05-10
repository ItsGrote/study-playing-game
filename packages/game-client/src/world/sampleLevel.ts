export const TILE_SIZE = 16;
export const MAP_W = 26;
export const MAP_H = 18;

export type InteractionDef = {
  id: string;
  message: string;
};

/**
 * Índices de frame no spritesheet `tiles-sheet` (0 = grama caminhável).
 * Qualquer tile !== 0 é sólido para pathfinder / colisão de clique.
 */
export const TILE = {
  GRASS: 0,
  WALL: 1,
  WATER: 2,
  DESK: 3,
  SHELF: 4,
} as const;

export function buildGroundLayer(): number[][] {
  const grid: number[][] = Array.from({ length: MAP_H }, () => Array(MAP_W).fill(TILE.GRASS));

  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      if (x === 0 || y === 0 || x === MAP_W - 1 || y === MAP_H - 1) {
        grid[y][x] = TILE.WALL;
      }
    }
  }

  for (let y = 6; y <= 10; y++) {
    for (let x = 4; x <= 8; x++) {
      grid[y][x] = TILE.WATER;
    }
  }

  grid[8][18] = TILE.DESK;
  grid[5][20] = TILE.SHELF;

  for (let x = 10; x <= 14; x++) {
    grid[12][x] = TILE.WALL;
  }

  return grid;
}

export function buildInteractionTable(): Record<string, InteractionDef> {
  return {
    "18,8": {
      id: "desk",
      message: "Mesa de estudos: um cantinho quieto para focar.",
    },
    "20,5": {
      id: "shelf",
      message: "Estante cheia de anotações e lembranças boas.",
    },
  };
}

export function isBlockedTile(tile: number): boolean {
  return tile !== TILE.GRASS;
}
