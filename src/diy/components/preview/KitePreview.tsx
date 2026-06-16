import type { CSSProperties } from "react";
import { frameOptions } from "../../data/frameOptions";
import {
  getSurfaceLayoutAsset,
  usesSingleUnitCenterFallback,
} from "../../data/surfaceAssets";
import { whistleTypeOptions } from "../../data/whistleOptions";
import type {
  KiteDIYConfig,
  KiteShape,
  SurfaceArea,
  SurfacePatternId,
  WhistleType,
} from "../../types/kite";
import { SurfaceBaseLayer } from "./SurfaceBaseLayer";

const whistleIconByType = whistleTypeOptions.reduce<Record<WhistleType, string>>(
  (icons, option) => ({
    ...icons,
    [option.id]: option.iconSrc,
  }),
  {
    high: "/diy-assets/whistles/whistle.png",
    low: "/diy-assets/whistles/whistle.png",
    mid: "/diy-assets/whistles/whistle.png",
  },
);

interface KitePreviewProps {
  centerPatternSelected: boolean;
  config: KiteDIYConfig;
  cornerPatternSelected: boolean;
  previewEnabled: boolean;
  surfaceEnabled: boolean;
  whistlesEnabled: boolean;
}

export function KitePreview({
  centerPatternSelected,
  config,
  cornerPatternSelected,
  previewEnabled,
  surfaceEnabled,
  whistlesEnabled,
}: KitePreviewProps) {
  const frameAsset = frameOptions.find((option) => option.id === config.kiteShape)?.assetSrc;

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

          {whistlesEnabled ? (
            <div className="whistle-layer" aria-hidden="true">
              {config.generatedWhistles.map((whistle) => (
                <img
                  alt=""
                  className={`whistle-icon whistle-icon-${whistle.type}`}
                  key={whistle.id}
                  src={whistleIconByType[whistle.type]}
                  style={{
                    height: `${Math.max(10, whistle.size * 1.12)}px`,
                    left: `${whistle.x}%`,
                    top: `${whistle.y}%`,
                    transform: `translate(-50%, -50%) rotate(${whistle.rotation}deg)`,
                    width: `${Math.max(12, whistle.size * 1.32)}px`,
                  }}
                />
              ))}
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
