import type { CSSProperties } from "react";
import { frameOptions } from "../../data/frameOptions";
import {
  getSurfaceLayoutAsset,
  usesSingleUnitCenterFallback,
} from "../../data/surfaceAssets";
import {
  getHexagonEdgeChooseAsset,
  getWhistleFillLayers,
} from "../../data/whistleAssets";
import type {
  KiteDIYConfig,
  KiteShape,
  SurfaceArea,
  SurfacePatternId,
  WhistleEdgeAxisGroupId,
} from "../../types/kite";
import { SurfaceBaseLayer } from "./SurfaceBaseLayer";
import { HexagonWhistleHitAreas } from "./HexagonWhistleHitAreas";

const SHOW_WHISTLE_HITAREA_DEBUG = false;

interface KitePreviewProps {
  centerPatternSelected: boolean;
  config: KiteDIYConfig;
  cornerPatternSelected: boolean;
  hoveredWhistleAxisGroupId: WhistleEdgeAxisGroupId | null;
  onWhistleAxisGroupHover: (axisGroupId: WhistleEdgeAxisGroupId | null) => void;
  onWhistleAxisGroupToggle: (axisGroupId: WhistleEdgeAxisGroupId) => void;
  previewEnabled: boolean;
  surfaceEnabled: boolean;
  whistlesEnabled: boolean;
}

export function KitePreview({
  centerPatternSelected,
  config,
  cornerPatternSelected,
  hoveredWhistleAxisGroupId,
  onWhistleAxisGroupHover,
  onWhistleAxisGroupToggle,
  previewEnabled,
  surfaceEnabled,
  whistlesEnabled,
}: KitePreviewProps) {
  const frameAsset = frameOptions.find((option) => option.id === config.kiteShape)?.assetSrc;
  const whistleFillLayers = getWhistleFillLayers(
    config.kiteShape,
    config.whistleFillDensity,
    config.selectedWhistleSizes,
  );
  const isEdgeMode = config.whistleLayoutMode === "edge";
  const canUseHexagonEdge = isEdgeMode && config.kiteShape === "hexagon";
  const hoveredEdgeAsset = hoveredWhistleAxisGroupId
    ? getHexagonEdgeChooseAsset(hoveredWhistleAxisGroupId)
    : undefined;
  const shouldShowHoverLayer =
    canUseHexagonEdge &&
    hoveredWhistleAxisGroupId !== null &&
    !config.selectedWhistleAxisGroupIds.includes(hoveredWhistleAxisGroupId) &&
    hoveredEdgeAsset !== undefined;

  return (
    <section className="preview-area" aria-label="风筝实时预览">
      {previewEnabled && frameAsset ? (
        <div
          className={`kite-preview-stage kite-frame-preview-unified kite-preview-shape-${config.kiteShape}`}
        >
          <img alt="" className="kite-frame-preview-image" src={frameAsset} />

          {surfaceEnabled ? (
            <>
              <SurfaceBaseLayer className="kite-surface-base-layer" frameAsset={frameAsset} />
              {centerPatternSelected ? (
                <SurfaceLayoutLayer
                  area="center"
                  color={config.centerPatternPrimaryColor}
                  kiteShape={config.kiteShape}
                  patternId={config.centerPatternId}
                />
              ) : null}
              {cornerPatternSelected ? (
                <SurfaceLayoutLayer
                  area="corner"
                  color={config.cornerPatternPrimaryColor}
                  kiteShape={config.kiteShape}
                  patternId={config.cornerPatternId}
                />
              ) : null}
            </>
          ) : null}

          {whistlesEnabled && !isEdgeMode ? (
            <div className="whistle-layer" aria-hidden="true">
              {whistleFillLayers.map((layer) => (
                <img
                  alt=""
                  className={`whistle-fill-image whistle-fill-image-${layer.size}`}
                  key={layer.id}
                  src={layer.src}
                />
              ))}
            </div>
          ) : null}

          {whistlesEnabled && canUseHexagonEdge ? (
            <div className="whistle-layer whistle-edge-layer" aria-hidden="true">
              {config.selectedWhistleAxisGroupIds.map((axisGroupId) => {
                const edgeAsset = getHexagonEdgeChooseAsset(axisGroupId);

                return edgeAsset ? (
                  <img
                    alt=""
                    className="whistle-fill-image whistle-edge-selected-layer"
                    key={axisGroupId}
                    src={edgeAsset}
                  />
                ) : null;
              })}
              {shouldShowHoverLayer ? (
                <img
                  alt=""
                  className="whistle-fill-image whistle-edge-hover-layer"
                  src={hoveredEdgeAsset}
                />
              ) : null}
            </div>
          ) : null}

          {canUseHexagonEdge ? (
            <div className="whistle-edge-hit-layer" aria-label="六角星边缘式哨口轴组">
              <HexagonWhistleHitAreas
                hoveredAxisGroupId={hoveredWhistleAxisGroupId}
                onHover={onWhistleAxisGroupHover}
                onToggle={onWhistleAxisGroupToggle}
                selectedAxisGroupIds={config.selectedWhistleAxisGroupIds}
                debug={SHOW_WHISTLE_HITAREA_DEBUG}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

interface SurfaceLayoutLayerProps {
  area: SurfaceArea;
  color: string;
  kiteShape: KiteShape;
  patternId: SurfacePatternId;
}

function SurfaceLayoutLayer({ area, color, kiteShape, patternId }: SurfaceLayoutLayerProps) {
  const asset = getSurfaceLayoutAsset(area, kiteShape, patternId);
  const usesFallback = usesSingleUnitCenterFallback(area, kiteShape);

  return (
    <div
      aria-hidden="true"
      className={`kite-surface-pattern-layer kite-surface-${area}-layer${
        usesFallback ? " kite-surface-single-unit-center" : ""
      }`}
      style={
        {
          "--surface-mask": `url("${asset}")`,
          backgroundColor: color,
        } as CSSProperties
      }
    />
  );
}
