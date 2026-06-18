import type {
  KiteDIYConfig,
  KiteShape,
  SurfacePatternId,
  WhistleEdgeAxisGroupId,
  WhistleFillDensity,
  WhistleSize,
} from "../types/kite";

export const STORAGE_KEY = "banyao-kite-diy-config";

export const defaultKiteDIYConfig: KiteDIYConfig = {
  activePanel: "frame",

  kiteShape: "seven-star",

  centerPatternId: "a",
  centerPatternPrimaryColor: "#D9FFFF",
  centerPatternSecondaryColor: "#8FD6D0",

  cornerPatternId: "a",
  cornerPatternPrimaryColor: "#FFFFCC",
  cornerPatternSecondaryColor: "#F7F1D4",

  framePrimaryColor: "#FFFFFF",
  frameSecondaryColor: "#FFFFFF",

  surfaceBaseColor: "#BFE6E6",

  whistleLayoutMode: "horizontal-staggered",
  whistleFillDensity: "mid",
  selectedWhistleSizes: [],
  selectedWhistleAxisGroupIds: [],
  whistleDensity: 0.5,
  selectedEdges: ["bottom"],
  whistleTypes: ["low", "mid", "high"],

  generatedWhistles: [],

  soundPreviewEnabled: false,
};

export function createDefaultKiteDIYConfig(): KiteDIYConfig {
  return {
    ...defaultKiteDIYConfig,
    selectedEdges: [...defaultKiteDIYConfig.selectedEdges],
    selectedWhistleAxisGroupIds: [...defaultKiteDIYConfig.selectedWhistleAxisGroupIds],
    selectedWhistleSizes: [...defaultKiteDIYConfig.selectedWhistleSizes],
    whistleTypes: [...defaultKiteDIYConfig.whistleTypes],
    generatedWhistles: [...defaultKiteDIYConfig.generatedWhistles],
  };
}

export function saveKiteConfig(config: KiteDIYConfig): boolean {
  if (!isBrowserStorageAvailable()) {
    return false;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    return true;
  } catch (error) {
    console.warn("Failed to save kite DIY config.", error);
    return false;
  }
}

export function loadKiteConfig(): KiteDIYConfig | null {
  if (!isBrowserStorageAvailable()) {
    return null;
  }

  try {
    const rawConfig = window.localStorage.getItem(STORAGE_KEY);

    if (!rawConfig) {
      return null;
    }

    const parsedConfig = JSON.parse(rawConfig) as Partial<KiteDIYConfig>;
    return normalizeKiteConfig(parsedConfig);
  } catch (error) {
    console.warn("Failed to load kite DIY config.", error);
    return null;
  }
}

export function exportKiteConfigAsJSON(config: KiteDIYConfig): string {
  return JSON.stringify(config, null, 2);
}

function isBrowserStorageAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function normalizeKiteConfig(config: Partial<KiteDIYConfig>): KiteDIYConfig {
  const defaultConfig = createDefaultKiteDIYConfig();

  return {
    ...defaultConfig,
    ...config,
    kiteShape: normalizeKiteShape(config.kiteShape),
    centerPatternId: normalizePatternId(config.centerPatternId),
    cornerPatternId: normalizePatternId(config.cornerPatternId),
    whistleFillDensity: normalizeWhistleFillDensity(config.whistleFillDensity),
    selectedWhistleAxisGroupIds: normalizeWhistleAxisGroupIds(
      config.selectedWhistleAxisGroupIds,
    ),
    selectedWhistleSizes: normalizeWhistleSizes(config.selectedWhistleSizes),
    selectedEdges: Array.isArray(config.selectedEdges) ? config.selectedEdges : defaultConfig.selectedEdges,
    whistleTypes: Array.isArray(config.whistleTypes) ? config.whistleTypes : defaultConfig.whistleTypes,
    generatedWhistles: Array.isArray(config.generatedWhistles) ? config.generatedWhistles : defaultConfig.generatedWhistles,
  };
}

const kiteShapes = new Set<KiteShape>([
  "hexagon",
  "seven-star",
  "eight-star",
  "nine-star",
  "nineteen-star",
  "twenty-three-star",
]);

const surfacePatternIds = new Set<SurfacePatternId>(["a", "b", "c", "d", "e", "f"]);
const whistleAxisGroupIds = new Set<WhistleEdgeAxisGroupId>([
  "choose-a",
  "choose-b",
  "choose-c",
  "choose-d",
  "choose-e",
  "choose-f",
  "choose-g",
  "choose-h",
  "choose-i",
  "choose-j",
  "choose-k",
]);
const whistleFillDensities = new Set<WhistleFillDensity>(["low", "mid", "high"]);
const whistleSizes = new Set<WhistleSize>(["small", "medium", "large"]);

function normalizeKiteShape(kiteShape: KiteDIYConfig["kiteShape"] | undefined): KiteShape {
  if ((kiteShape as string | undefined) === "cicada") {
    return "twenty-three-star";
  }

  return kiteShape && kiteShapes.has(kiteShape) ? kiteShape : defaultKiteDIYConfig.kiteShape;
}

function normalizePatternId(patternId: SurfacePatternId | undefined): SurfacePatternId {
  return patternId && surfacePatternIds.has(patternId) ? patternId : "a";
}

function normalizeWhistleFillDensity(
  whistleFillDensity: WhistleFillDensity | undefined,
): WhistleFillDensity {
  return whistleFillDensity && whistleFillDensities.has(whistleFillDensity)
    ? whistleFillDensity
    : defaultKiteDIYConfig.whistleFillDensity;
}

function normalizeWhistleSizes(selectedWhistleSizes: WhistleSize[] | undefined): WhistleSize[] {
  return Array.isArray(selectedWhistleSizes)
    ? selectedWhistleSizes.filter((size) => whistleSizes.has(size))
    : [...defaultKiteDIYConfig.selectedWhistleSizes];
}

function normalizeWhistleAxisGroupIds(
  selectedWhistleAxisGroupIds: WhistleEdgeAxisGroupId[] | undefined,
): WhistleEdgeAxisGroupId[] {
  return Array.isArray(selectedWhistleAxisGroupIds)
    ? selectedWhistleAxisGroupIds.filter((axisGroupId) => whistleAxisGroupIds.has(axisGroupId))
    : [...defaultKiteDIYConfig.selectedWhistleAxisGroupIds];
}
