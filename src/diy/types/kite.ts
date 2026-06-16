export type KiteShape =
  | "hexagon"
  | "seven-star"
  | "eight-star"
  | "nine-star"
  | "nineteen-star"
  | "twenty-three-star";

export type BaseUnitType = "hexagon" | "eight-star";

export type SurfaceArea = "center" | "corner";

export type SurfacePatternId = "a" | "b" | "c" | "d" | "e" | "f";

export type PanelKey = "frame" | "surface" | "whistle";

export type WhistleLayoutMode = "horizontal-staggered" | "edge";

export type EdgeKey = "top" | "right" | "bottom" | "left";

export type WhistleType = "low" | "mid" | "high";

export interface WhistleInstance {
  id: string;
  x: number;
  y: number;
  type: WhistleType;
  size: number;
  rotation: number;
  active?: boolean;
}

export interface KiteDIYConfig {
  activePanel: PanelKey;

  kiteShape: KiteShape;

  centerPatternId: SurfacePatternId;
  centerPatternPrimaryColor: string;
  centerPatternSecondaryColor: string;

  cornerPatternId: SurfacePatternId;
  cornerPatternPrimaryColor: string;
  cornerPatternSecondaryColor: string;

  surfaceBaseColor: string;

  whistleLayoutMode: WhistleLayoutMode;
  whistleDensity: number;
  selectedEdges: EdgeKey[];
  whistleTypes: WhistleType[];

  generatedWhistles: WhistleInstance[];

  soundPreviewEnabled: boolean;
}
