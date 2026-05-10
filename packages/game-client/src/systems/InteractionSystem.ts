import type { ContextAction } from "../types";
import type { GridPoint } from "../world/pathfind";
import { findPath } from "../world/pathfind";
import type { InteractionDef } from "../world/sampleLevel";
import { isWalkableTile } from "../world/sampleLevel";

export type QueuedInteraction = {
  interaction: InteractionDef;
  path: GridPoint[];
};

export class InteractionSystem {
  private interactionByTile: Record<string, InteractionDef>;

  constructor(private readonly interactions: InteractionDef[]) {
    this.interactionByTile = Object.fromEntries(
      interactions.flatMap((def) => def.tiles.map((tile) => [`${tile.x},${tile.y}`, def])),
    );
  }

  findAt(tile: GridPoint): InteractionDef | null {
    return this.interactionByTile[`${tile.x},${tile.y}`] ?? null;
  }

  findNearby(playerGrid: GridPoint): InteractionDef | null {
    return this.interactions.find((interaction) => this.isInRange(playerGrid, interaction)) ?? null;
  }

  buildQueue(grid: number[][], playerGrid: GridPoint, interaction: InteractionDef): QueuedInteraction | null {
    if (this.isInRange(playerGrid, interaction)) {
      return { interaction, path: [] };
    }

    let bestPath: GridPoint[] | null = null;
    for (const target of interaction.interactionTiles) {
      if (!isWalkableTile(grid, target)) continue;
      const path = findPath(grid, playerGrid, target);
      if (path.length === 0) continue;
      if (!bestPath || path.length < bestPath.length) {
        bestPath = path;
      }
    }

    return bestPath ? { interaction, path: bestPath } : null;
  }

  actionsFor(interaction: InteractionDef, petFollowing: boolean): ContextAction[] {
    if (interaction.kind === "study") {
      return [{ id: "study:start", label: "Estudar" }];
    }

    if (interaction.kind === "pet") {
      return petFollowing
        ? [
            { id: "pet:care", label: "Fazer carinho" },
            { id: "pet:stay", label: "Parar de seguir" },
          ]
        : [
            { id: "pet:care", label: "Fazer carinho" },
            { id: "pet:follow", label: "Pedir para seguir" },
          ];
    }

    return [{ id: `inspect:${interaction.id}`, label: "Observar" }];
  }

  isInRange(playerGrid: GridPoint, interaction: InteractionDef): boolean {
    return interaction.interactionTiles.some((tile) => tile.x === playerGrid.x && tile.y === playerGrid.y);
  }
}
