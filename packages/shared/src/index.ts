/**
 * Shared types and constants used across apps and packages.
 * Keep this package free of React/Next/Phaser imports.
 */
export const WORKSPACE_NAME = "spg" as const;

export * from "./schemas/auth.js";
export * from "./schemas/profile.js";
