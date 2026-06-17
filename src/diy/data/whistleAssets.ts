import type {
  KiteShape,
  WhistleEdgeAxisGroupId,
  WhistleFillDensity,
  WhistleSize,
} from "../types/kite";

const kiteShapeFolderName: Partial<Record<KiteShape, string>> = {
  "eight-star": "八角星",
  hexagon: "六角星",
  "nineteen-star": "十九连星",
  "seven-star": "七连星",
};

const sizeFilePrefix: Record<WhistleSize, string> = {
  small: "s",
  medium: "m",
  large: "l",
};

export interface WhistleFillLayer {
  id: string;
  src: string;
  size: WhistleSize;
}

export const hexagonEdgeChooseAssets: Partial<Record<WhistleEdgeAxisGroupId, string>> = {
  "choose-a": "/diy-assets/whistles/自选边缘式/六角星/六角星-s-whistle-choose-a.png",
  "choose-b": "/diy-assets/whistles/自选边缘式/六角星/六角星-s-whistle-choose-b.png",
  "choose-c": "/diy-assets/whistles/自选边缘式/六角星/六角星-s-whistle-choose-c.png",
};

export function getWhistleFillLayers(
  kiteShape: KiteShape,
  density: WhistleFillDensity,
  selectedSizes: WhistleSize[],
): WhistleFillLayer[] {
  const folderName = kiteShapeFolderName[kiteShape];

  if (!folderName) {
    return [];
  }

  return selectedSizes.map((size) => ({
    id: `${kiteShape}-${density}-${size}`,
    src: getWhistleFillAsset(folderName, density, size),
    size,
  }));
}

function getWhistleFillAsset(
  folderName: string,
  density: WhistleFillDensity,
  size: WhistleSize,
): string {
  const basePath = `/diy-assets/whistles/覆盖式/${folderName}`;

  if (size === "large") {
    return `${basePath}/${folderName}-${sizeFilePrefix[size]}-whistle-fill.png`;
  }

  if (size === "small" && folderName === "七连星") {
    return `${basePath}/${folderName}-whistle-fill-${density}.png`;
  }

  return `${basePath}/${folderName}-${sizeFilePrefix[size]}-whistle-fill-${density}.png`;
}

export function getHexagonEdgeChooseAsset(
  axisGroupId: WhistleEdgeAxisGroupId,
): string | undefined {
  return hexagonEdgeChooseAssets[axisGroupId];
}
