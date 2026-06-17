import type {
  KiteShape,
  WhistleEdgeAxisGroupId,
  WhistleFillDensity,
  WhistleSize,
} from "../types/kite";

const kiteShapeFolderName: Partial<Record<KiteShape, string>> = {
  "eight-star": "八角星",
  hexagon: "六角星",
  "nine-star": "九连星",
  "nineteen-star": "十九连星",
  "seven-star": "七连星",
  "twenty-three-star": "二十三连星",
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

const edgeChooseAssets: Partial<Record<KiteShape, Partial<Record<WhistleEdgeAxisGroupId, string>>>> = {
  "eight-star": {
    "choose-a": "/diy-assets/whistles/自选边缘式/八角星/八角星-whistle-choose-a.png",
    "choose-b": "/diy-assets/whistles/自选边缘式/八角星/八角星-whistle-choose-b.png",
    "choose-c": "/diy-assets/whistles/自选边缘式/八角星/八角星-whistle-choose-c.png",
    "choose-d": "/diy-assets/whistles/自选边缘式/八角星/八角星-whistle-choose-d.png",
    "choose-e": "/diy-assets/whistles/自选边缘式/八角星/八角星-whistle-choose-e.png",
  },
  hexagon: {
    "choose-a": "/diy-assets/whistles/自选边缘式/六角星/六角星-s-whistle-choose-a.png",
    "choose-b": "/diy-assets/whistles/自选边缘式/六角星/六角星-s-whistle-choose-b.png",
    "choose-c": "/diy-assets/whistles/自选边缘式/六角星/六角星-s-whistle-choose-c.png",
  },
  "nineteen-star": {
    "choose-a": "/diy-assets/whistles/自选边缘式/十九连星/十九连星-whistle-choose-a.png",
    "choose-b": "/diy-assets/whistles/自选边缘式/十九连星/十九连星-whistle-choose-b.png",
    "choose-c": "/diy-assets/whistles/自选边缘式/十九连星/十九连星-whistle-choose-c.png",
    "choose-d": "/diy-assets/whistles/自选边缘式/十九连星/十九连星-whistle-choose-d.png",
    "choose-e": "/diy-assets/whistles/自选边缘式/十九连星/十九连星-whistle-choose-e.png",
    "choose-f": "/diy-assets/whistles/自选边缘式/十九连星/十九连星-whistle-choose-f.png",
    "choose-g": "/diy-assets/whistles/自选边缘式/十九连星/十九连星-whistle-choose-g.png",
    "choose-h": "/diy-assets/whistles/自选边缘式/十九连星/十九连星-whistle-choose-h.png",
    "choose-i": "/diy-assets/whistles/自选边缘式/十九连星/十九连星-whistle-choose-i.png",
  },
  "seven-star": {
    "choose-a": "/diy-assets/whistles/自选边缘式/七连星/七连星-whistle-choose-a.png",
    "choose-b": "/diy-assets/whistles/自选边缘式/七连星/七连星-whistle-choose-b.png",
    "choose-c": "/diy-assets/whistles/自选边缘式/七连星/七连星-whistle-choose-c.png",
    "choose-d": "/diy-assets/whistles/自选边缘式/七连星/七连星-whistle-choose-d.png",
    "choose-e": "/diy-assets/whistles/自选边缘式/七连星/七连星-whistle-choose-e.png",
    "choose-f": "/diy-assets/whistles/自选边缘式/七连星/七连星-whistle-choose-f.png",
    "choose-g": "/diy-assets/whistles/自选边缘式/七连星/七连星-whistle-choose-g.png",
  },
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

export function getWhistleEdgeChooseAsset(
  kiteShape: KiteShape,
  axisGroupId: WhistleEdgeAxisGroupId,
): string | undefined {
  return edgeChooseAssets[kiteShape]?.[axisGroupId];
}
