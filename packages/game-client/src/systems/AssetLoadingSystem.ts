import * as Phaser from "phaser";

import { ASSET_MANIFEST_URL, type AssetManifest } from "../assets/manifest";

export class AssetLoadingSystem {
  static preloadBootstrap(scene: Phaser.Scene) {
    scene.load.json("asset-manifest", ASSET_MANIFEST_URL);
  }

  static preloadFromManifest(scene: Phaser.Scene, manifest: AssetManifest) {
    for (const [key, url] of Object.entries(manifest.maps)) {
      scene.load.json(`map:${key}`, url);
    }

    for (const [key, url] of Object.entries(manifest.images)) {
      scene.load.image(`image:${key}`, url);
    }

    for (const [key, sheet] of Object.entries(manifest.spritesheets)) {
      scene.load.spritesheet(`sheet:${key}`, sheet.url, {
        frameWidth: sheet.frameWidth,
        frameHeight: sheet.frameHeight,
        spacing: sheet.spacing ?? 0,
        margin: sheet.margin ?? 0,
      });
    }

    for (const [key, url] of Object.entries(manifest.audio)) {
      scene.load.audio(`audio:${key}`, url);
    }
  }

  static getManifest(scene: Phaser.Scene): AssetManifest {
    const manifest = scene.cache.json.get("asset-manifest") as AssetManifest | undefined;
    if (!manifest) {
      throw new Error("Manifesto de assets não foi carregado.");
    }
    return manifest;
  }
}
