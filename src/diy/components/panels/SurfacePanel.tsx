import { useState } from "react";
import {
  getBaseUnitType,
  getSurfaceIconAsset,
  surfacePatternOptions,
} from "../../data/surfaceAssets";
import type {
  BaseUnitType,
  KiteDIYConfig,
  SurfaceArea,
  SurfacePanelKey,
  SurfacePatternId,
} from "../../types/kite";
import type { SurfaceColorField } from "../KiteDIYPage";

type SurfaceColorControlId =
  | "center-fill"
  | "corner-fill"
  | "frame-primary";

const colorPresets = [
  "#38BDFF",
  "#F98D79",
  "#FFFEA3",
  "#D9FFFF",
  "#FFFFCC",
  "#F7F1D4",
  "#B4B4B4",
  "#111111",
];

interface SurfacePanelProps {
  activeSurfacePanel: SurfacePanelKey;
  centerPatternSelected: boolean;
  config: KiteDIYConfig;
  cornerPatternSelected: boolean;
  onCenterPatternChange: (patternId: SurfacePatternId) => void;
  onColorChange: (field: SurfaceColorField, value: string) => void;
  onCornerPatternChange: (patternId: SurfacePatternId) => void;
  onSurfacePanelChange: (panel: SurfacePanelKey) => void;
}

export function SurfacePanel({
  activeSurfacePanel,
  centerPatternSelected,
  config,
  cornerPatternSelected,
  onCenterPatternChange,
  onColorChange,
  onCornerPatternChange,
  onSurfacePanelChange,
}: SurfacePanelProps) {
  const [expandedColorControl, setExpandedColorControl] =
    useState<SurfaceColorControlId | null>(null);
  const baseUnitType = getBaseUnitType(config.kiteShape);

  function handlePanelChange(panel: SurfacePanelKey) {
    setExpandedColorControl(null);
    onSurfacePanelChange(panel);
  }

  function handleColorControlToggle(controlId: SurfaceColorControlId) {
    setExpandedColorControl((currentControlId) =>
      currentControlId === controlId ? null : controlId,
    );
  }

  if (activeSurfacePanel === "intro") {
    return <SurfaceIntroPanel onSurfacePanelChange={handlePanelChange} />;
  }

  if (activeSurfacePanel === "frameColor") {
    return (
      <FrameColorPanel
        baseUnitType={baseUnitType}
        config={config}
        expandedColorControl={expandedColorControl}
        onColorChange={onColorChange}
        onColorControlToggle={handleColorControlToggle}
      />
    );
  }

  return (
    <SurfacePatternEditor
      area={activeSurfacePanel === "center" ? "center" : "corner"}
      baseUnitType={baseUnitType}
      config={config}
      expandedColorControl={expandedColorControl}
      onColorChange={onColorChange}
      onColorControlToggle={handleColorControlToggle}
      onPatternChange={
        activeSurfacePanel === "center" ? onCenterPatternChange : onCornerPatternChange
      }
      patternSelected={
        activeSurfacePanel === "center" ? centerPatternSelected : cornerPatternSelected
      }
    />
  );
}

interface SurfaceIntroPanelProps {
  onSurfacePanelChange: (panel: SurfacePanelKey) => void;
}

function SurfaceIntroPanel({ onSurfacePanelChange }: SurfaceIntroPanelProps) {
  return (
    <div className="surface-intro-panel">
      <div className="surface-intro-copy">
        <p>鹞面纹样取意于古代鸟纹与羽饰，仿佛神鸟展开双翼，听见天候的讯息。</p>
        <p>传统板鹞常用红、黑、青、紫等色，并以金色点染；鹞面则多采用牛皮纸、高丽纸、棉布或丝绸，在轻薄与坚韧之间承接风力。</p>
        <p>东风起时，纹样随板鹞升入高空，鹞鸣九皋，其声闻于野。</p>
      </div>

      <p className="surface-intro-copy-en">
        The wind bears a message, and the whistle foretells the rain. Inspired by ancient
        bird and feather motifs, the kite surface evokes a mythical bird listening to
        changes in the weather. Traditional Bianyao kites often use red, black, cyan, and
        purple, accented with touches of gold.
      </p>

      <div className="surface-intro-actions" aria-label="鹞面设置入口">
        <SurfaceIntroAction
          cnLabel="骨架颜色"
          enLabel="Frame Color"
          onClick={() => onSurfacePanelChange("frameColor")}
        />
        <SurfaceIntroAction
          cnLabel="星中"
          enLabel="Star Center"
          onClick={() => onSurfacePanelChange("center")}
        />
        <SurfaceIntroAction
          cnLabel="星角"
          enLabel="Outer Triangles"
          onClick={() => onSurfacePanelChange("corner")}
        />
      </div>

      <p className="surface-panel-hint">点击为风筝选择自己喜欢的纹样和颜色</p>
    </div>
  );
}

interface SurfaceIntroActionProps {
  cnLabel: string;
  enLabel: string;
  onClick: () => void;
}

function SurfaceIntroAction({ cnLabel, enLabel, onClick }: SurfaceIntroActionProps) {
  return (
    <button className="surface-intro-action" onClick={onClick} type="button">
      <span>
        <strong>{cnLabel}</strong>
        <small>{enLabel}</small>
      </span>
      <i aria-hidden="true">{"\u2192"}</i>
    </button>
  );
}

interface SurfacePatternEditorProps {
  area: SurfaceArea;
  baseUnitType: BaseUnitType;
  config: KiteDIYConfig;
  expandedColorControl: SurfaceColorControlId | null;
  onColorChange: (field: SurfaceColorField, value: string) => void;
  onColorControlToggle: (controlId: SurfaceColorControlId) => void;
  onPatternChange: (patternId: SurfacePatternId) => void;
  patternSelected: boolean;
}

function SurfacePatternEditor({
  area,
  baseUnitType,
  config,
  expandedColorControl,
  onColorChange,
  onColorControlToggle,
  onPatternChange,
  patternSelected,
}: SurfacePatternEditorProps) {
  const isCenter = area === "center";
  const fillField: SurfaceColorField = isCenter
    ? "centerPatternPrimaryColor"
    : "cornerPatternPrimaryColor";
  const fillColor = isCenter
    ? config.centerPatternPrimaryColor
    : config.cornerPatternPrimaryColor;
  const fillControlId = `${area}-fill` as SurfaceColorControlId;
  const selectedPatternId = isCenter ? config.centerPatternId : config.cornerPatternId;

  return (
    <div className={`surface-subpanel surface-subpanel-${area}`}>
      <SurfaceUnitDiagram
        area={area}
        baseUnitType={baseUnitType}
      />

      <div className="surface-editor-colors surface-editor-colors-single">
        <ColorControl
          color={fillColor}
          controlId={fillControlId}
          field={fillField}
          isExpanded={expandedColorControl === fillControlId}
          label="Fill Area"
          onColorChange={onColorChange}
          onToggle={onColorControlToggle}
        />
      </div>

      <PatternGrid
        area={area}
        baseUnitType={baseUnitType}
        onPatternChange={onPatternChange}
        patternSelected={patternSelected}
        selectedPatternId={selectedPatternId}
      />

      <p className="surface-panel-hint">将纹样的分布拆解为星中和星角，来为风筝选择自己喜欢的纹样和颜色</p>
    </div>
  );
}

interface FrameColorPanelProps {
  baseUnitType: BaseUnitType;
  config: KiteDIYConfig;
  expandedColorControl: SurfaceColorControlId | null;
  onColorChange: (field: SurfaceColorField, value: string) => void;
  onColorControlToggle: (controlId: SurfaceColorControlId) => void;
}

function FrameColorPanel({
  baseUnitType,
  config,
  expandedColorControl,
  onColorChange,
  onColorControlToggle,
}: FrameColorPanelProps) {
  return (
    <div className="surface-subpanel surface-subpanel-frame-color">
      <SurfaceUnitDiagram
        area="frameColor"
        baseUnitType={baseUnitType}
      />

      <div className="surface-editor-colors surface-editor-colors-single">
        <ColorControl
          color={config.framePrimaryColor}
          controlId="frame-primary"
          field="framePrimaryColor"
          isExpanded={expandedColorControl === "frame-primary"}
          label="Frame Color"
          onColorChange={onColorChange}
          onToggle={onColorControlToggle}
        />
      </div>

      <p className="surface-panel-hint">来为风筝的骨架选择自己喜欢的颜色</p>
    </div>
  );
}

interface ColorControlProps {
  color: string;
  controlId: SurfaceColorControlId;
  field: SurfaceColorField;
  isExpanded: boolean;
  label: string;
  onColorChange: (field: SurfaceColorField, value: string) => void;
  onToggle: (controlId: SurfaceColorControlId) => void;
}

function ColorControl({
  color,
  controlId,
  field,
  isExpanded,
  label,
  onColorChange,
  onToggle,
}: ColorControlProps) {
  return (
    <div className="surface-color-block">
      <button
        aria-expanded={isExpanded}
        className={`surface-color-button${isExpanded ? " surface-color-button-open" : ""}`}
        onClick={() => onToggle(controlId)}
        type="button"
      >
        <span className="surface-color-label">{label}</span>
        <span className="surface-color-button-value">
          <span className="surface-color-swatch" style={{ backgroundColor: color }} />
          <span>{color.toUpperCase()}</span>
        </span>
      </button>

      {isExpanded ? (
        <ColorPalette color={color} field={field} onColorChange={onColorChange} />
      ) : null}
    </div>
  );
}

interface ColorPaletteProps {
  color: string;
  field: SurfaceColorField;
  onColorChange: (field: SurfaceColorField, value: string) => void;
}

function ColorPalette({ color, field, onColorChange }: ColorPaletteProps) {
  return (
    <div className="surface-color-palette">
      <div className="surface-color-preset-grid">
        {colorPresets.map((presetColor) => (
          <button
            aria-label={`选择颜色 ${presetColor}`}
            aria-pressed={presetColor.toUpperCase() === color.toUpperCase()}
            className="surface-color-preset"
            key={presetColor}
            onClick={() => onColorChange(field, presetColor)}
            style={{ backgroundColor: presetColor }}
            type="button"
          />
        ))}
      </div>
      <label className="surface-native-color">
        <span>Custom</span>
        <input
          aria-label="自定义颜色"
          onChange={(event) => onColorChange(field, event.target.value)}
          type="color"
          value={color}
        />
      </label>
    </div>
  );
}

interface PatternGridProps {
  area: SurfaceArea;
  baseUnitType: BaseUnitType;
  onPatternChange: (patternId: SurfacePatternId) => void;
  patternSelected: boolean;
  selectedPatternId: SurfacePatternId;
}

function PatternGrid({
  area,
  baseUnitType,
  onPatternChange,
  patternSelected,
  selectedPatternId,
}: PatternGridProps) {
  return (
    <div className="surface-new-pattern-grid" aria-label={`${area === "center" ? "星中" : "星角"}纹样`}>
      {surfacePatternOptions.map((option) => {
        const iconAsset = getSurfaceIconAsset(area, option.id, baseUnitType);
        const isSelected = patternSelected && option.id === selectedPatternId;

        return (
          <button
            aria-label={`${area === "center" ? "星中" : "星角"}${option.label}`}
            aria-pressed={isSelected}
            className={`surface-new-pattern-option${
              isSelected ? " surface-new-pattern-option-selected" : ""
            }`}
            key={option.id}
            onClick={() => onPatternChange(option.id)}
            type="button"
          >
            <img className="surface-new-pattern-image" src={iconAsset} alt="" />
          </button>
        );
      })}
    </div>
  );
}

interface SurfaceUnitDiagramProps {
  area: SurfaceArea | "frameColor";
  baseUnitType: BaseUnitType;
}

function SurfaceUnitDiagram({
  area,
  baseUnitType,
}: SurfaceUnitDiagramProps) {
  const familyLabel = baseUnitType === "hexagon" ? "六角星" : "八角星";
  const iconLabel =
    area === "center" ? "星中" : area === "corner" ? "星角" : "骨架";
  const iconAsset = `/diy-assets/icons/${familyLabel}-${iconLabel}.svg`;

  return (
    <div
      className={`surface-unit-diagram surface-unit-diagram-${baseUnitType} surface-unit-diagram-${area}`}
      aria-hidden="true"
    >
      <img className="surface-unit-diagram-image" src={iconAsset} alt="" />
    </div>
  );
}
