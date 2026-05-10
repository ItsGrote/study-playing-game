export const ASSET_MANIFEST_URL = "/game/assets.json";

export type AssetManifest = {
  baseUrl: string;
  maps: Record<string, string>;
  images: Record<string, string>;
  spritesheets: Record<
    string,
    {
      url: string;
      frameWidth: number;
      frameHeight: number;
      spacing?: number;
      margin?: number;
    }
  >;
  audio: Record<string, string>;
};

export type LoadedAssets = {
  manifest: AssetManifest;
};
