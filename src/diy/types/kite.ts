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

export type SurfacePanelKey = "intro" | "center" | "corner" | "frameColor";

export type WhistleLayoutMode = "horizontal-staggered" | "edge";

export type EdgeKey = "top" | "right" | "bottom" | "left";

export type WhistleType = "low" | "mid" | "high";

export type WhistleFillDensity = "low" | "mid" | "high";

export type WhistleSize = "small" | "medium" | "large";

export type WhistleEdgeAxisGroupId =
  | "choose-a"
  | "choose-b"
  | "choose-c"
  | "choose-d"
  | "choose-e"
  | "choose-f"
  | "choose-g"
  | "choose-h"
  | "choose-i";

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

  framePrimaryColor: string;
  frameSecondaryColor: string;

  surfaceBaseColor: string;

  whistleLayoutMode: WhistleLayoutMode;
  whistleFillDensity: WhistleFillDensity;
  selectedWhistleSizes: WhistleSize[];
  selectedWhistleAxisGroupIds: WhistleEdgeAxisGroupId[];
  whistleDensity: number;
  selectedEdges: EdgeKey[];
  whistleTypes: WhistleType[];

  generatedWhistles: WhistleInstance[];

  soundPreviewEnabled: boolean;
}
