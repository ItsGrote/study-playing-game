export type TiledLayerKind = "floor" | "walls" | "collision" | "decor" | "interactive";

export type TiledObject = {
  id: number;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  properties?: Record<string, string | number | boolean>;
};

export type TiledLayer = {
  kind: TiledLayerKind;
  name: string;
  data?: number[][];
  objects?: TiledObject[];
};

export type TiledRoomMap = {
  width: number;
  height: number;
  tileWidth: number;
  tileHeight: number;
  layers: TiledLayer[];
};

type RawTiledProperty = {
  name: string;
  value: string | number | boolean;
};

type RawTiledLayer = {
  name: string;
  type: "tilelayer" | "objectgroup";
  width?: number;
  height?: number;
  data?: number[];
  objects?: Array<Omit<TiledObject, "properties"> & { properties?: RawTiledProperty[] }>;
};

type RawTiledMap = {
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  layers: RawTiledLayer[];
};

export function parseTiledRoomMap(raw: RawTiledMap): TiledRoomMap {
  return {
    width: raw.width,
    height: raw.height,
    tileWidth: raw.tilewidth,
    tileHeight: raw.tileheight,
    layers: raw.layers.map((layer) => {
      const kind = layerNameToKind(layer.name);
      if (layer.type === "objectgroup") {
        return {
          kind,
          name: layer.name,
          objects: layer.objects?.map((object) => ({
            ...object,
            properties: Object.fromEntries((object.properties ?? []).map((prop) => [prop.name, prop.value])),
          })),
        };
      }

      const width = layer.width ?? raw.width;
      const data = layer.data ?? [];
      return {
        kind,
        name: layer.name,
        data: Array.from({ length: layer.height ?? raw.height }, (_, y) =>
          data.slice(y * width, y * width + width),
        ),
      };
    }),
  };
}

function layerNameToKind(name: string): TiledLayerKind {
  const normalized = name.toLowerCase();
  if (normalized.includes("wall") || normalized.includes("parede")) return "walls";
  if (normalized.includes("collision") || normalized.includes("colis")) return "collision";
  if (normalized.includes("decor")) return "decor";
  if (normalized.includes("interact")) return "interactive";
  return "floor";
}
