import type { CSSProperties } from "react";
import {
  getBaseUnitType,
  getKiteFrameAsset,
  getSurfaceIconAsset,
  getSurfaceInitialCornerAsset,
  getSurfaceLayoutAsset,
  surfacePatternOptions,
} from "../../data/surfaceAssets";
import type { KiteDIYConfig, SurfaceArea, SurfacePatternId } from "../../types/kite";
import type { SurfaceColorField } from "../KiteDIYPage";
import { SurfaceBaseLayer } from "../preview/SurfaceBaseLayer";

interface SurfacePanelProps {
  centerPatternSelected: boolean;
  centerPlaceholderColor: string;
  config: KiteDIYConfig;
  cornerPatternSelected: boolean;
  cornerPlaceholderColor: string;
  onCenterPatternChange: (patternId: SurfacePatternId) => void;
  onColorChange: (field: SurfaceColorField, value: string) => void;
  onCornerPatternChange: (patternId: SurfacePatternId) => void;
}

export function SurfacePanel({
  centerPatternSelected,
  centerPlaceholderColor,
  config,
  cornerPatternSelected,
  cornerPlaceholderColor,
  onCenterPatternChange,
  onColorChange,
  onCornerPatternChange,
}: SurfacePanelProps) {
  const baseUnitType = getBaseUnitType(config.kiteShape);

  return (
    <div className="surface-panel">
      <SurfacePart
        area="center"
        baseUnitType={baseUnitType}
        color={config.centerPatternPrimaryColor}
        colorField="centerPatternPrimaryColor"
        label="星中"
        onColorChange={onColorChange}
        onPatternChange={onCenterPatternChange}
        patternId={config.centerPatternId}
        patternSelected={centerPatternSelected}
        placeholderColor={centerPlaceholderColor}
      />
      <SurfacePart
        area="corner"
        baseUnitType={baseUnitType}
        color={config.cornerPatternPrimaryColor}
        colorField="cornerPatternPrimaryColor"
        label="星角"
        onColorChange={onColorChange}
        onPatternChange={onCornerPatternChange}
        patternId={config.cornerPatternId}
        patternSelected={cornerPatternSelected}
        placeholderColor={cornerPlaceholderColor}
      />
    </div>
  );
}

interface SurfacePartProps {
  area: SurfaceArea;
  baseUnitType: "hexagon" | "eight-star";
  color: string;
  colorField: SurfaceColorField;
  label: string;
  onColorChange: (field: SurfaceColorField, value: string) => void;
  onPatternChange: (patternId: SurfacePatternId) => void;
  patternId: SurfacePatternId;
  patternSelected: boolean;
  placeholderColor: string;
}

function SurfacePart({
  area,
  baseUnitType,
  color,
  colorField,
  label,
  onColorChange,
  onPatternChange,
  patternId,
  patternSelected,
  placeholderColor,
}: SurfacePartProps) {
  const selectedIconAsset = getSurfaceIconAsset(area, patternId, baseUnitType);
  const colorPresentation = getColorPresentation(color);

  return (
    <section className="surface-part">
      <div className="surface-part-identity">
        <h3>{label}</h3>
        <SurfaceUnitPreview
          area={area}
          baseUnitType={baseUnitType}
          color={color}
          patternAsset={selectedIconAsset}
          patternId={patternId}
          patternSelected={patternSelected}
          placeholderColor={placeholderColor}
        />
      </div>
      <div className="surface-part-controls">
        <label className="surface-color-control">
          <span className="surface-control-label">颜色</span>
          <span className="surface-color-value">
            <span className="surface-color-swatch" style={{ backgroundColor: color }} />
            <output className="surface-color-code">{colorPresentation.hex}</output>
            <span className="surface-color-opacity">{colorPresentation.opacity}</span>
            <input
              aria-label={`${label}颜色`}
              onChange={(event) => onColorChange(colorField, event.target.value)}
              type="color"
              value={color}
            />
          </span>
        </label>

        <div className="surface-pattern-control">
          <span className="surface-control-label">纹样</span>
          <div className="surface-pattern-grid" aria-label={`${label}纹样`}>
            {surfacePatternOptions.map((option) => {
              const iconAsset = getSurfaceIconAsset(area, option.id, baseUnitType);

              return (
                <button
                  aria-label={`${label}${option.label}`}
                  aria-pressed={patternSelected && option.id === patternId}
                  className={`surface-pattern-option${
                    patternSelected && option.id === patternId
                      ? " surface-pattern-option-selected"
                      : ""
                  }`}
                  key={option.id}
                  onClick={() => onPatternChange(option.id)}
                  type="button"
                >
                  <img alt="" src={iconAsset} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function getColorPresentation(color: string): { hex: string; opacity: string } {
  const normalizedColor = color.trim();
  const eightDigitHex = normalizedColor.match(/^#([0-9a-f]{6})([0-9a-f]{2})$/i);

  if (eightDigitHex) {
    return {
      hex: eightDigitHex[1].toUpperCase(),
      opacity: `${Math.round((Number.parseInt(eightDigitHex[2], 16) / 255) * 100)} %`,
    };
  }

  const sixDigitHex = normalizedColor.match(/^#([0-9a-f]{6})$/i);

  if (sixDigitHex) {
    return {
      hex: sixDigitHex[1].toUpperCase(),
      opacity: "100 %",
    };
  }

  return {
    hex: normalizedColor.toUpperCase(),
    opacity: "100 %",
  };
}

interface SurfaceUnitPreviewProps {
  area: SurfaceArea;
  baseUnitType: "hexagon" | "eight-star";
  color: string;
  patternAsset: string;
  patternId: SurfacePatternId;
  patternSelected: boolean;
  placeholderColor: string;
}

function SurfaceUnitPreview({
  area,
  baseUnitType,
  color,
  patternAsset,
  patternId,
  patternSelected,
  placeholderColor,
}: SurfaceUnitPreviewProps) {
  const baseUnitShape = baseUnitType === "hexagon" ? "hexagon" : "eight-star";
  const frameAsset = getKiteFrameAsset(baseUnitShape);
  const previewAsset = patternSelected
    ? area === "corner"
      ? getSurfaceLayoutAsset("corner", baseUnitShape, patternId)
      : patternAsset
    : area === "corner"
      ? getSurfaceInitialCornerAsset(baseUnitType)
      : "";
  const patternStyle = {
    ...(previewAsset ? { "--surface-mask": `url("${previewAsset}")` } : {}),
    backgroundColor: patternSelected ? color : placeholderColor,
  } as CSSProperties;

  return (
    <div
      className={`surface-unit-preview surface-unit-preview-${baseUnitType}${
        area === "corner" ? " surface-unit-preview-layout" : ""
      }`}
      aria-hidden="true"
    >
      <SurfaceBaseLayer className="surface-unit-base-layer" frameAsset={frameAsset} />
      <img
        className="surface-unit-frame"
        src={frameAsset}
        alt=""
      />
      {area === "center" ? (
        <span
          className={
            patternSelected
              ? "surface-unit-center-pattern"
              : "surface-unit-center-placeholder"
          }
          style={patternStyle}
        />
      ) : (
        <span className="surface-unit-corner-layout" style={patternStyle} />
      )}
    </div>
  );
}
