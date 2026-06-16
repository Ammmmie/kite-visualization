import type { BaseUnitType, KiteShape, SurfaceArea, SurfacePatternId } from "../types/kite";

export const surfacePatternOptions: Array<{ id: SurfacePatternId; label: string }> = [
  { id: "a", label: "纹样 A" },
  { id: "b", label: "纹样 B" },
  { id: "c", label: "纹样 C" },
  { id: "d", label: "纹样 D" },
  { id: "e", label: "纹样 E" },
  { id: "f", label: "纹样 F" },
];

const kiteShapeFolderName: Record<KiteShape, string> = {
  "eight-star": "八角星",
  hexagon: "六角星",
  "nine-star": "九连星",
  "nineteen-star": "十九连星",
  "seven-star": "七连星",
  "twenty-three-star": "二十三连星",
};

const eightStarVariantPatternIds = new Set<SurfacePatternId>(["c", "d", "e", "f"]);

export function getBaseUnitType(kiteShape: KiteShape): BaseUnitType {
  if (kiteShape === "hexagon" || kiteShape === "seven-star" || kiteShape === "nineteen-star") {
    return "hexagon";
  }

  return "eight-star";
}

export function getSurfaceIconAsset(
  area: SurfaceArea,
  patternId: SurfacePatternId,
  baseUnitType: BaseUnitType,
): string {
  const hasEightStarVariant =
    area === "center" && baseUnitType === "eight-star" && eightStarVariantPatternIds.has(patternId);
  const suffix = hasEightStarVariant ? "-2" : "";

  return `/diy-assets/surface/icons/${area}/${area}-${patternId}${suffix}.svg`;
}

export function getSurfaceLayoutAsset(
  area: SurfaceArea,
  kiteShape: KiteShape,
  patternId: SurfacePatternId,
): string {
  if (isSingleUnitCenterLayout(area, kiteShape)) {
    return getSurfaceIconAsset(area, patternId, getBaseUnitType(kiteShape));
  }

  const folderName = kiteShapeFolderName[kiteShape];
  const fileArea = getLayoutFileArea(area, kiteShape, patternId);
  const version =
    kiteShape === "hexagon" && area === "corner"
      ? "?v=20260614-4"
      : kiteShape === "eight-star" && area === "corner"
        ? "?v=20260614-2"
        : kiteShape === "nine-star"
          ? "?v=20260614-2"
          : "";
  return `/diy-assets/surface/layouts/${area}/${folderName}/${folderName}-${fileArea}-${patternId}.svg${version}`;
}

export function usesSingleUnitCenterFallback(area: SurfaceArea, kiteShape: KiteShape): boolean {
  return isSingleUnitCenterLayout(area, kiteShape);
}

export function getSurfacePreviewFrameAsset(baseUnitType: BaseUnitType): string {
  const unitName = baseUnitType === "hexagon" ? "六角星" : "八角星";
  return `/diy-assets/frames/frame-${unitName}.svg`;
}

export function getSurfaceInitialCornerAsset(baseUnitType: BaseUnitType): string {
  const unitName = baseUnitType === "hexagon" ? "六角星" : "八角星";
  return `/diy-assets/surface/preview-corner-${unitName}-初始.svg`;
}

export function getKiteFrameAsset(kiteShape: KiteShape): string {
  const version =
    kiteShape === "hexagon"
      ? "?v=20260614-4"
      : kiteShape === "eight-star" || kiteShape === "nine-star"
        ? "?v=20260614-2"
      : kiteShape === "nineteen-star"
        ? "?v=20260614-2"
        : "";
  return `/diy-assets/frames/frame-${kiteShapeFolderName[kiteShape]}.svg${version}`;
}

function isSingleUnitCenterLayout(area: SurfaceArea, kiteShape: KiteShape): boolean {
  return area === "center" && (kiteShape === "hexagon" || kiteShape === "eight-star");
}

function getLayoutFileArea(
  area: SurfaceArea,
  kiteShape: KiteShape,
  patternId: SurfacePatternId,
): SurfaceArea {
  const isMislabeledNineteenStarCenter =
    area === "center" && kiteShape === "nineteen-star" && patternId !== "a";

  return isMislabeledNineteenStarCenter ? "corner" : area;
}
