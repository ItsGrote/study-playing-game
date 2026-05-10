import { isBlockedTile } from "./sampleLevel";

export type GridPoint = { x: number; y: number };

export function findPath(
  grid: number[][],
  start: GridPoint,
  goal: GridPoint,
): GridPoint[] {
  if (start.x === goal.x && start.y === goal.y) return [];

  const h = grid.length;
  const w = grid[0]?.length ?? 0;

  const inBounds = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h;
  const key = (x: number, y: number) => `${x},${y}`;

  const queue: GridPoint[] = [{ x: start.x, y: start.y }];
  const visited = new Set<string>([key(start.x, start.y)]);
  const parent = new Map<string, string | null>();
  parent.set(key(start.x, start.y), null);

  const dirs = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];

  while (queue.length > 0) {
    const cur = queue.shift()!;
    if (cur.x === goal.x && cur.y === goal.y) {
      const out: GridPoint[] = [];
      let k: string | null = key(cur.x, cur.y);
      while (k) {
        const [sx, sy] = k.split(",").map(Number) as [number, number];
        if (sx === start.x && sy === start.y) break;
        out.push({ x: sx, y: sy });
        k = parent.get(k) ?? null;
      }
      out.reverse();
      return out;
    }

    for (const d of dirs) {
      const nx = cur.x + d.x;
      const ny = cur.y + d.y;
      if (!inBounds(nx, ny)) continue;
      if (isBlockedTile(grid[ny][nx])) continue;
      const nk = key(nx, ny);
      if (visited.has(nk)) continue;
      visited.add(nk);
      parent.set(nk, key(cur.x, cur.y));
      queue.push({ x: nx, y: ny });
    }
  }

  return [];
}
