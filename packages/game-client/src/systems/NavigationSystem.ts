import type { GridPoint } from "../world/pathfind";
import { findPath } from "../world/pathfind";
import { CollisionSystem } from "./CollisionSystem";

export class NavigationSystem {
  constructor(private readonly collision: CollisionSystem) {}

  findPath(start: GridPoint, goal: GridPoint): GridPoint[] {
    if (!this.collision.isWalkable(goal)) return [];
    return findPath(this.collision.pathGrid, start, goal);
  }

  isWalkable(tile: GridPoint): boolean {
    return this.collision.isWalkable(tile);
  }
}
