import { useEffect, useState, type CSSProperties } from "react";
import { frameOptions } from "../../data/frameOptions";
import {
  getSurfaceLayoutAsset,
  usesSingleUnitCenterFallback,
} from "../../data/surfaceAssets";
import {
  getWhistleEdgeChooseAsset,
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
import { WhistleEdgeHitAreas } from "./WhistleEdgeHitAreas";

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
  const canUseEdgeHitAreas =
    isEdgeMode &&
    (config.kiteShape === "hexagon" ||
      config.kiteShape === "seven-star" ||
      config.kiteShape === "eight-star" ||
      config.kiteShape === "nineteen-star");
  const hoveredEdgeAsset = hoveredWhistleAxisGroupId
    ? getWhistleEdgeChooseAsset(config.kiteShape, hoveredWhistleAxisGroupId)
    : undefined;
  const shouldShowHoverLayer =
    canUseEdgeHitAreas &&
    hoveredWhistleAxisGroupId !== null &&
    !config.selectedWhistleAxisGroupIds.includes(hoveredWhistleAxisGroupId) &&
    hoveredEdgeAsset !== undefined;

  return (
    <section className="preview-area" aria-label="风筝实时预览">
      {previewEnabled && frameAsset ? (
        <div
          className={`kite-preview-stage kite-frame-preview-unified kite-preview-shape-${config.kiteShape}`}
        >
          <ColorizedFrameLayer
            frameAsset={frameAsset}
            color={config.framePrimaryColor}
          />

          {surfaceEnabled ? (
            <>
              <SurfaceBaseLayer className="kite-surface-base-layer" frameAsset={frameAsset} />
              {centerPatternSelected ? (
                <SurfaceLayoutLayer
                  area="center"
                  fillColor={config.centerPatternPrimaryColor}
                  kiteShape={config.kiteShape}
                  patternId={config.centerPatternId}
                />
              ) : null}
              {cornerPatternSelected ? (
                <SurfaceLayoutLayer
                  area="corner"
                  fillColor={config.cornerPatternPrimaryColor}
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

          {whistlesEnabled && canUseEdgeHitAreas ? (
            <div className="whistle-layer whistle-edge-layer" aria-hidden="true">
              {config.selectedWhistleAxisGroupIds.map((axisGroupId) => {
                const edgeAsset = getWhistleEdgeChooseAsset(config.kiteShape, axisGroupId);

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

          {canUseEdgeHitAreas ? (
            <div className="whistle-edge-hit-layer" aria-label="边缘式哨口轴组">
              <WhistleEdgeHitAreas
                hoveredAxisGroupId={hoveredWhistleAxisGroupId}
                kiteShape={config.kiteShape}
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
  fillColor: string;
  kiteShape: KiteShape;
  patternId: SurfacePatternId;
}

function SurfaceLayoutLayer({
  area,
  fillColor,
  kiteShape,
  patternId,
}: SurfaceLayoutLayerProps) {
  const asset = getSurfaceLayoutAsset(area, kiteShape, patternId);
  const usesFallback = usesSingleUnitCenterFallback(area, kiteShape);
  const layerClassName = `kite-surface-pattern-layer kite-surface-${area}-layer${
    usesFallback ? " kite-surface-single-unit-center" : ""
  }`;

  return (
    <RecoloredSurfaceSvgLayer
      asset={asset}
      className={layerClassName}
      fillColor={fillColor}
    />
  );
}

interface ColorizedFrameLayerProps {
  frameAsset: string;
  color: string;
}

function ColorizedFrameLayer({ frameAsset, color }: ColorizedFrameLayerProps) {
  const maskStyle = {
    "--frame-mask": `url("${frameAsset}")`,
  } as CSSProperties;

  return (
    <div
      aria-hidden="true"
      className="kite-frame-preview-image kite-frame-preview-color"
      style={{ ...maskStyle, backgroundColor: color }}
    />
  );
}

interface RecoloredSurfaceSvgLayerProps {
  asset: string;
  className: string;
  fillColor: string;
}

function RecoloredSurfaceSvgLayer({
  asset,
  className,
  fillColor,
}: RecoloredSurfaceSvgLayerProps) {
  const [recoloredAsset, setRecoloredAsset] = useState(asset);

  useEffect(() => {
    let isMounted = true;

    fetch(asset)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Unable to load surface SVG: ${asset}`);
        }

        return response.text();
      })
      .then((svgText) => {
        if (!isMounted) {
          return;
        }

        const recoloredSvg = recolorSurfaceSvg(svgText, fillColor);
        setRecoloredAsset(
          `data:image/svg+xml;charset=utf-8,${encodeURIComponent(recoloredSvg)}`,
        );
      })
      .catch((error) => {
        console.warn("Failed to recolor surface SVG.", error);
        if (isMounted) {
          setRecoloredAsset(asset);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [asset, fillColor]);

  return (
    <img
      aria-hidden="true"
      alt=""
      className={`${className} kite-surface-svg-layer`}
      src={recoloredAsset}
    />
  );
}

function recolorSurfaceSvg(svgText: string, fillColor: string): string {
  return svgText
    .replace(/\sstroke="(?!none)[^"]*"/gi, ` stroke="${fillColor}"`)
    .replace(/\sfill="(?!none)[^"]*"/gi, ` fill="${fillColor}"`)
    .replace(/stroke:\s*(?!none)[^;"}]+/gi, `stroke: ${fillColor}`)
    .replace(/fill:\s*(?!none)[^;"}]+/gi, `fill: ${fillColor}`);
}
