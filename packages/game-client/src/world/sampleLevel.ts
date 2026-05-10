export const TILE_SIZE = 16;
export const MAP_W = 120;
export const MAP_H = 80;

export type TilePoint = { x: number; y: number };

export type RoomLayers = {
  floor: number[][];
  walls: number[][];
  decor: number[][];
  collision: boolean[][];
  interactive: InteractionDef[];
};

export type InteractionDef = {
  id: string;
  kind: "inspect" | "study" | "pet";
  label: string;
  message: string;
  tiles: TilePoint[];
  interactionTiles: TilePoint[];
  cursor: string;
  seatTile?: TilePoint;
};

/**
 * Índices lógicos do mapa offline (0 = piso caminhável).
 * Qualquer tile marcado como sólido em `BLOCKED_TILES` bloqueia pathfinder / colisão.
 */
export const TILE = {
  FLOOR: 0,
  WALL_TOP: 1,
  WALL_LEFT: 2,
  WALL_RIGHT: 3,
  WALL_BOTTOM: 4,
  RUG: 5,
  DESK: 6,
  SHELF: 7,
  BED: 8,
  WINDOW: 9,
  PLANT: 10,
  LAMP: 11,
  CHEST: 12,
  PET_BED: 13,
  TABLE: 14,
  BOOKS: 15,
  WARDROBE: 16,
  COFFEE: 17,
  AQUARIUM: 18,
  CHAIR: 19,
  COMPUTER: 20,
  POSTER: 21,
  COUNTER: 22,
  SOFA: 23,
  WINDOW_WALL: 24,
} as const;

const BLOCKED_TILES = new Set<number>([
  TILE.WALL_TOP,
  TILE.WALL_LEFT,
  TILE.WALL_RIGHT,
  TILE.WALL_BOTTOM,
  TILE.DESK,
  TILE.SHELF,
  TILE.BED,
  TILE.WINDOW,
  TILE.PLANT,
  TILE.LAMP,
  TILE.CHEST,
  TILE.PET_BED,
  TILE.TABLE,
  TILE.BOOKS,
  TILE.WARDROBE,
  TILE.COFFEE,
  TILE.AQUARIUM,
  TILE.CHAIR,
  TILE.COMPUTER,
  TILE.POSTER,
  TILE.COUNTER,
  TILE.SOFA,
  TILE.WINDOW_WALL,
]);

export function buildGroundLayer(): number[][] {
  const layers = buildRoomLayers();
  return layers.floor.map((row, y) =>
    row.map((floorTile, x) => layers.decor[y][x] || layers.walls[y][x] || floorTile),
  );
}

export function buildRoomLayers(): RoomLayers {
  const floor: number[][] = Array.from({ length: MAP_H }, () => Array(MAP_W).fill(TILE.FLOOR));
  const walls: number[][] = Array.from({ length: MAP_H }, () => Array(MAP_W).fill(0));
  const decor: number[][] = Array.from({ length: MAP_H }, () => Array(MAP_W).fill(0));

  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      if (y <= 3) {
        walls[y][x] = TILE.WALL_TOP;
      } else if (y === MAP_H - 1) {
        walls[y][x] = TILE.WALL_BOTTOM;
      } else if (x === 0) {
        walls[y][x] = TILE.WALL_LEFT;
      } else if (x === MAP_W - 1) {
        walls[y][x] = TILE.WALL_RIGHT;
      }
    }
  }

  for (let y = 16; y <= 31; y++) {
    for (let x = 24; x <= 48; x++) {
      floor[y][x] = TILE.RUG;
    }
  }

  placeRect(decor, 6, 7, 9, 6, TILE.BED);
  placeRect(decor, 56, 9, 12, 4, TILE.DESK);
  placeRect(decor, 21, 4, 12, 4, TILE.WINDOW_WALL);
  placeRect(decor, 36, 5, 8, 8, TILE.SHELF);
  placeRect(decor, 52, 24, 6, 5, TILE.TABLE);
  placeRect(decor, 8, 33, 10, 3, TILE.COUNTER);
  placeRect(decor, 17, 8, 5, 8, TILE.WARDROBE);
  placeRect(decor, 69, 12, 5, 5, TILE.AQUARIUM);
  placeRect(decor, 11, 40, 9, 4, TILE.SOFA);

  decor[14][48] = TILE.PLANT;
  decor[10][54] = TILE.LAMP;
  decor[37][8] = TILE.CHEST;
  decor[41][60] = TILE.PET_BED;
  decor[28][64] = TILE.BOOKS;
  decor[15][61] = TILE.CHAIR;
  decor[9][62] = TILE.COMPUTER;
  decor[5][48] = TILE.POSTER;
  decor[11][50] = TILE.PLANT;
  decor[36][22] = TILE.PLANT;

  const collision = floor.map((row, y) =>
    row.map((_, x) => isBlockedTile(decor[y][x] || walls[y][x] || floor[y][x])),
  );

  return {
    floor,
    walls,
    decor,
    collision,
    interactive: buildInteractiveEntities(),
  };
}

export function buildInteractionTable(): Record<string, InteractionDef> {
  return Object.fromEntries(
    buildInteractiveEntities().flatMap((def) => def.tiles.map((tile) => [`${tile.x},${tile.y}`, def])),
  );
}

export function isBlockedTile(tile: number): boolean {
  return BLOCKED_TILES.has(tile);
}

export function buildInteractiveEntities(): InteractionDef[] {
  return [
    {
      id: "desk",
      kind: "study",
      label: "Mesa de estudos",
      message: "Mesa de estudos pronta: computador ligado, caderno aberto e uma luz quentinha no canto.",
      cursor: "study",
      tiles: [...rectPoints(56, 9, 12, 4), { x: 61, y: 15 }, { x: 62, y: 9 }],
      interactionTiles: rectPoints(58, 16, 7, 1),
      seatTile: { x: 61, y: 15 },
    },
    {
      id: "shelf",
      kind: "inspect",
      label: "Estante",
      message: "Estante cheia de anotações, apostilas e pequenas lembranças boas.",
      cursor: "read",
      tiles: rectPoints(36, 5, 8, 8),
      interactionTiles: rectPoints(36, 13, 8, 1),
    },
    {
      id: "bed",
      kind: "inspect",
      label: "Cama",
      message: "Cama arrumada: o quarto está pronto para estudar sem cara de sala fria.",
      cursor: "rest",
      tiles: rectPoints(6, 7, 9, 6),
      interactionTiles: rectPoints(6, 13, 9, 1),
    },
    {
      id: "pet-bed",
      kind: "inspect",
      label: "Cantinho do pet",
      message: "Cantinho do pet: uma almofada macia para companhia durante os estudos.",
      cursor: "pet",
      tiles: [{ x: 60, y: 41 }],
      interactionTiles: [
        { x: 59, y: 41 },
        { x: 61, y: 41 },
        { x: 60, y: 40 },
        { x: 60, y: 42 },
      ],
    },
    {
      id: "books",
      kind: "inspect",
      label: "Livros",
      message: "Pilha de livros separada por matéria, com marcadores coloridos nas páginas importantes.",
      cursor: "read",
      tiles: [{ x: 64, y: 28 }],
      interactionTiles: [
        { x: 63, y: 28 },
        { x: 65, y: 28 },
        { x: 64, y: 29 },
      ],
    },
    {
      id: "coffee",
      kind: "inspect",
      label: "Bancada de café",
      message: "Café recém-passado. O vapor sobe devagar e deixa o quarto com clima de tarde produtiva.",
      cursor: "coffee",
      tiles: rectPoints(8, 33, 10, 3),
      interactionTiles: rectPoints(8, 36, 10, 1),
    },
    {
      id: "aquarium",
      kind: "inspect",
      label: "Aquário",
      message: "Um aquário pequeno com plantas balançando e um peixinho laranja nadando sem pressa.",
      cursor: "look",
      tiles: rectPoints(69, 12, 5, 5),
      interactionTiles: [
        { x: 68, y: 13 },
        { x: 68, y: 14 },
        { x: 69, y: 17 },
        { x: 70, y: 17 },
      ],
    },
    {
      id: "wardrobe",
      kind: "inspect",
      label: "Armário",
      message: "Armário de madeira com roupas dobradas e espaço para futuras opções de customização.",
      cursor: "look",
      tiles: rectPoints(17, 8, 5, 8),
      interactionTiles: rectPoints(17, 16, 5, 1),
    },
  ];
}

export function findInteractionByTile(tile: TilePoint): InteractionDef | null {
  return buildInteractionTable()[`${tile.x},${tile.y}`] ?? null;
}

export function isWalkableTile(grid: number[][], tile: TilePoint): boolean {
  if (tile.x < 0 || tile.y < 0 || tile.x >= MAP_W || tile.y >= MAP_H) return false;
  return !isBlockedTile(grid[tile.y][tile.x]);
}

function placeRect(grid: number[][], x: number, y: number, w: number, h: number, tile: number) {
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x; xx < x + w; xx++) {
      grid[yy][xx] = tile;
    }
  }
}

function rectPoints(x: number, y: number, w: number, h: number): TilePoint[] {
  const out: TilePoint[] = [];
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x; xx < x + w; xx++) {
      out.push({ x: xx, y: yy });
    }
  }
  return out;
}
