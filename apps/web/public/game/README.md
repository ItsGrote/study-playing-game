# Game Asset Pipeline

This folder is served statically by Next.js and is the source of truth for the Phaser client.

- `assets.json` is the manifest loaded first by `AssetLoadingSystem`.
- `maps/` contains Tiled `.json` room maps.
- `tilesets/` contains external Tiled tilesets.
- `characters/`, `pets/`, `objects/`, and `rooms/` are reserved for production pixel art.

Reference images must not be added to `assets.json` or rendered in-game. Keep references outside the runtime asset manifest, or use them only during art direction.
