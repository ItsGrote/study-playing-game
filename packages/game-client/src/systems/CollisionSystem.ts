import type { GridPoint } from "../world/pathfind";
import { isBlockedTile, MAP_H, MAP_W } from "../world/sampleLevel";
import type { TiledRoomMap } from "../world/tiled";

export class CollisionSystem {
  constructor(private readonly grid: number[][]) {}

  static fromTileGrid(grid: number[][]) {
    return new CollisionSystem(grid);
  }

  static fromTiledObjects(baseGrid: number[][], map: TiledRoomMap) {
    const grid = baseGrid.map((row) => [...row]);
    const collisionObjects = map.layers.find((layer) => layer.kind === "collision")?.objects ?? [];

    for (const object of collisionObjects) {
      const minX = Math.max(0, Math.floor(object.x / map.tileWidth));
      const minY = Math.max(0, Math.floor(object.y / map.tileHeight));
      const maxX = Math.min(MAP_W - 1, Math.ceil((object.x + object.width) / map.tileWidth) - 1);
      const maxY = Math.min(MAP_H - 1, Math.ceil((object.y + object.height) / map.tileHeight) - 1);

      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          grid[y][x] = 1;
        }
      }
    }

    return new CollisionSystem(grid);
  }

  get pathGrid() {
    return this.grid;
  }

  isWalkable(tile: GridPoint): boolean {
    if (tile.x < 0 || tile.y < 0 || tile.x >= MAP_W || tile.y >= MAP_H) return false;
    return !isBlockedTile(this.grid[tile.y][tile.x]);
  }
}
