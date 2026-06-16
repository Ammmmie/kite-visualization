import type { EdgeKey, KiteDIYConfig, WhistleInstance, WhistleType } from "../types/kite";

type EdgePoint = {
  x: number;
  y: number;
  rotation: number;
};

const SAFE_AREA = {
  minX: 16,
  maxX: 84,
  minY: 18,
  maxY: 84,
};

export function generateWhistles(config: KiteDIYConfig): WhistleInstance[] {
  if (config.whistleLayoutMode === "edge") {
    return generateEdgeWhistles(config);
  }

  return generateHorizontalStaggeredWhistles(config);
}

function generateHorizontalStaggeredWhistles(config: KiteDIYConfig): WhistleInstance[] {
  const density = clampDensity(config.whistleDensity);
  const rows = mapDensityToRows(density);
  const cols = mapDensityToCols(density);
  const whistles: WhistleInstance[] = [];

  for (let row = 0; row < rows; row += 1) {
    const y = interpolate(SAFE_AREA.minY + 10, SAFE_AREA.maxY - 8, rows === 1 ? 0.5 : row / (rows - 1));
    const rowOffset = row % 2 === 0 ? 0 : 0.5;

    for (let col = 0; col < cols; col += 1) {
      const x = interpolate(SAFE_AREA.minX + 8, SAFE_AREA.maxX - 8, (col + rowOffset) / cols);

      if (!isInsideKiteSafeArea(x, y) || isInsideCenterReservedArea(x, y)) {
        continue;
      }

      whistles.push(createWhistle(whistles.length, x, y, 0, config.whistleTypes));
    }
  }

  if (whistles.length > 0) {
    return whistles;
  }

  return createFallbackWhistles(config.whistleTypes);
}

function generateEdgeWhistles(config: KiteDIYConfig): WhistleInstance[] {
  const density = clampDensity(config.whistleDensity);
  const edges = normalizeSelectedEdges(config.selectedEdges);
  const pointsPerEdge = mapDensityToEdgePointCount(density);
  const whistles: WhistleInstance[] = [];

  edges.forEach((edge) => {
    samplePointsAlongEdge(edge, pointsPerEdge).forEach((point) => {
      whistles.push(createWhistle(whistles.length, point.x, point.y, point.rotation, config.whistleTypes));
    });
  });

  if (whistles.length > 0) {
    return whistles;
  }

  return createFallbackWhistles(config.whistleTypes);
}

function mapDensityToRows(density: number): number {
  return Math.max(2, Math.round(2 + density * 4));
}

function mapDensityToCols(density: number): number {
  return Math.max(3, Math.round(3 + density * 6));
}

function mapDensityToEdgePointCount(density: number): number {
  return Math.max(3, Math.round(3 + density * 7));
}

function samplePointsAlongEdge(edge: EdgeKey, count: number): EdgePoint[] {
  const points: EdgePoint[] = [];
  const inset = 14;

  for (let index = 0; index < count; index += 1) {
    const ratio = count === 1 ? 0.5 : index / (count - 1);
    const value = interpolate(inset, 100 - inset, ratio);

    if (edge === "top") {
      points.push({ x: value, y: SAFE_AREA.minY, rotation: 0 });
    }

    if (edge === "right") {
      points.push({ x: SAFE_AREA.maxX, y: value, rotation: 90 });
    }

    if (edge === "bottom") {
      points.push({ x: value, y: SAFE_AREA.maxY, rotation: 180 });
    }

    if (edge === "left") {
      points.push({ x: SAFE_AREA.minX, y: value, rotation: -90 });
    }
  }

  return points;
}

function createWhistle(
  index: number,
  x: number,
  y: number,
  rotation: number,
  allowedTypes: WhistleType[],
): WhistleInstance {
  const type = pickWhistleType(index, y, allowedTypes);

  return {
    id: `w-${String(index + 1).padStart(3, "0")}`,
    x: roundCoordinate(x),
    y: roundCoordinate(y),
    type,
    size: getWhistleSize(type),
    rotation,
  };
}

function pickWhistleType(index: number, y: number, allowedTypes: WhistleType[]): WhistleType {
  const types = allowedTypes.length > 0 ? allowedTypes : (["low", "mid", "high"] satisfies WhistleType[]);
  const weightedType = getWeightedType(index, y);

  if (types.includes(weightedType)) {
    return weightedType;
  }

  return types[index % types.length];
}

function getWeightedType(index: number, y: number): WhistleType {
  if (y > 66 && index % 5 === 0) {
    return "low";
  }

  if (index % 10 < 3) {
    return "mid";
  }

  return "high";
}

function getWhistleSize(type: WhistleType): number {
  if (type === "low") {
    return 18;
  }

  if (type === "mid") {
    return 14;
  }

  return 10;
}

function normalizeSelectedEdges(selectedEdges: EdgeKey[]): EdgeKey[] {
  return selectedEdges.length > 0 ? selectedEdges : ["bottom"];
}

function createFallbackWhistles(allowedTypes: WhistleType[]): WhistleInstance[] {
  return [
    createWhistle(0, 42, 72, 0, allowedTypes),
    createWhistle(1, 50, 76, 0, allowedTypes),
    createWhistle(2, 58, 72, 0, allowedTypes),
  ];
}

function isInsideKiteSafeArea(x: number, y: number): boolean {
  const centerX = 50;
  const topY = 14;
  const bottomY = 90;
  const halfWidthAtY = 42 * (1 - Math.abs(y - 52) / (bottomY - topY));

  return y >= topY && y <= bottomY && x >= centerX - halfWidthAtY && x <= centerX + halfWidthAtY;
}

function isInsideCenterReservedArea(x: number, y: number): boolean {
  return x >= 40 && x <= 60 && y >= 38 && y <= 62;
}

function clampDensity(density: number): number {
  if (Number.isNaN(density)) {
    return 0.5;
  }

  return Math.min(1, Math.max(0, density));
}

function interpolate(start: number, end: number, ratio: number): number {
  return start + (end - start) * ratio;
}

function roundCoordinate(value: number): number {
  return Number(value.toFixed(2));
}
