import type { CSSProperties } from "react";
import { whistleLayoutIconAssets } from "../../data/whistleAssets";
import { whistleSizeOptions } from "../../data/whistleOptions";
import type {
  EdgeKey,
  KiteDIYConfig,
  WhistleFillDensity,
  WhistleLayoutMode,
  WhistlePanelKey,
  WhistleSize,
} from "../../types/kite";

interface WhistlePanelProps {
  activeWhistlePanel: WhistlePanelKey;
  config: KiteDIYConfig;
  onDensityChange: (density: WhistleFillDensity) => void;
  onDensityPercentChange: (densityPercent: number) => void;
  onEdgeToggle: (edge: EdgeKey) => void;
  onLayoutChange: (layoutMode: WhistleLayoutMode) => void;
  onPanelChange: (panel: WhistlePanelKey) => void;
  onWhistleSizeToggle: (whistleSize: WhistleSize) => void;
}

const whistleTypeConsoleLabels: Record<WhistleSize, string> = {
  large: "large",
  medium: "medium",
  small: "small",
};

export function WhistlePanel({
  activeWhistlePanel,
  config,
  onDensityPercentChange,
  onPanelChange,
  onWhistleSizeToggle,
}: WhistlePanelProps) {
  if (activeWhistlePanel === "coverage") {
    return (
      <WhistleArrangementEditor
        activeWhistlePanel="coverage"
        config={config}
        onDensityPercentChange={onDensityPercentChange}
        onPanelChange={onPanelChange}
        onWhistleSizeToggle={onWhistleSizeToggle}
      />
    );
  }

  if (activeWhistlePanel === "edge") {
    return (
      <WhistleArrangementEditor
        activeWhistlePanel="edge"
        config={config}
        onDensityPercentChange={onDensityPercentChange}
        onPanelChange={onPanelChange}
        onWhistleSizeToggle={onWhistleSizeToggle}
      />
    );
  }

  return <WhistleIntroPanel onPanelChange={onPanelChange} />;
}

interface WhistleIntroPanelProps {
  onPanelChange: (panel: WhistlePanelKey) => void;
}

function WhistleIntroPanel({ onPanelChange }: WhistleIntroPanelProps) {
  return (
    <div className="whistle-new-panel whistle-intro-panel">
      <div className="whistle-intro-copy">
        <h3>Whistle Arrangement</h3>
        <p>
          板鹞之所以能够“凌空发声”，关键在于鹞面上数量众多、大小不一的哨口。
          筒形者称“哨”，球形者称“口”，它们通常由哨面与哨筒组成。
        </p>
        <p>
          传统材料包括竹管、鹅毛管、秸秆、葫芦以及白果壳、板栗壳、桂圆壳等果壳，
          也有将蚕茧浸泡桐油后制成球形哨口。近代则逐渐出现铝箔、胶片、碳纤维等材料。
        </p>
        <p className="whistle-intro-copy-en">
          Bianyao kites are able to “sound in the sky” because numerous whistles of
          different sizes are installed across the kite surface. Cylindrical whistles are
          called shao, while spherical ones are called kou; together, they are known as
          shaokou.
        </p>
      </div>

      <div className="whistle-arrangement-entry-list" aria-label="哨口排布方式">
        <WhistleArrangementEntry
          iconSrc={whistleLayoutIconAssets.coverage}
          label="覆盖式排布"
          englishLabel="Coverage Layout"
          onClick={() => onPanelChange("coverage")}
        />
        <WhistleArrangementEntry
          iconSrc={whistleLayoutIconAssets.edge}
          label="自选式排布"
          englishLabel="Edge Layout"
          onClick={() => onPanelChange("edge")}
        />
      </div>

      <p className="whistle-panel-footnote">选择一种哨口排布方式，探究不同哨口的不同排布逻辑</p>
    </div>
  );
}

interface WhistleArrangementEntryProps {
  englishLabel: string;
  iconSrc: string;
  label: string;
  onClick: () => void;
}

function WhistleArrangementEntry({
  englishLabel,
  iconSrc,
  label,
  onClick,
}: WhistleArrangementEntryProps) {
  return (
    <button className="whistle-arrangement-entry" onClick={onClick} type="button">
      <img alt="" className="whistle-arrangement-entry-icon" src={iconSrc} />
      <span className="whistle-arrangement-entry-copy">
        <strong>{label}</strong>
        <small>{englishLabel}</small>
      </span>
      <span className="whistle-arrangement-arrow" aria-hidden="true">
        {"\u2192"}
      </span>
    </button>
  );
}

interface WhistleArrangementEditorProps {
  activeWhistlePanel: "coverage" | "edge";
  config: KiteDIYConfig;
  onDensityPercentChange: (densityPercent: number) => void;
  onPanelChange: (panel: WhistlePanelKey) => void;
  onWhistleSizeToggle: (whistleSize: WhistleSize) => void;
}

function WhistleArrangementEditor({
  activeWhistlePanel,
  config,
  onDensityPercentChange,
  onPanelChange,
  onWhistleSizeToggle,
}: WhistleArrangementEditorProps) {
  const densityPercent = getDensityPercent(config);
  const isCoverage = activeWhistlePanel === "coverage";

  return (
    <div className={`whistle-new-panel whistle-editor whistle-editor-${activeWhistlePanel}`}>
      <h3>{isCoverage ? "覆盖式排布" : "边缘式排布"}</h3>

      <div className="whistle-layout-toggle-row" aria-label="排布方式">
        <WhistleLayoutPreviewButton
          active={isCoverage}
          iconSrc={whistleLayoutIconAssets.coverage}
          label="覆盖式"
          onClick={() => onPanelChange("coverage")}
        />
        <WhistleLayoutPreviewButton
          active={!isCoverage}
          iconSrc={whistleLayoutIconAssets.edge}
          label="边缘式"
          onClick={() => onPanelChange("edge")}
        />
      </div>

      {isCoverage ? (
        <section className="whistle-editor-section">
          <div className="whistle-editor-section-heading">
            <strong>哨口种类</strong>
            <small>Whistle Types</small>
          </div>
          <div className="whistle-type-list">
            {whistleSizeOptions.map((size) => (
              <WhistleTypeButton
                isSelected={config.selectedWhistleSizes.includes(size.id)}
                key={size.id}
                label={size.label}
                onPlay={() => console.log(`play ${whistleTypeConsoleLabels[size.id]} whistle`)}
                onSelect={() => onWhistleSizeToggle(size.id)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {isCoverage ? (
        <section className="whistle-editor-section whistle-density-section">
          <div className="whistle-editor-section-heading whistle-density-heading">
            <span>
              <strong>排布疏密度</strong>
              <small>Arrangement Density</small>
            </span>
            <output>{densityPercent}%</output>
          </div>
          <input
            aria-label="排布疏密度"
            className="whistle-density-slider"
            max={100}
            min={0}
            onChange={(event) => onDensityPercentChange(Number(event.target.value))}
            style={{ "--density-percent": `${densityPercent}%` } as CSSProperties}
            type="range"
            value={densityPercent}
          />
        </section>
      ) : (
        <section className="whistle-editor-section whistle-edge-instruction">
          <div className="whistle-editor-section-heading">
            <strong>边缘选择</strong>
            <small>Edge Selection</small>
          </div>
          <p>
            在左侧风筝主轴热区上悬停可预览哨口，点击选择，再次点击取消。系统会根据已导出的图层保持左右对称与传统排布规律。
          </p>
        </section>
      )}

      <p className="whistle-panel-footnote">
        {isCoverage
          ? "拖动滑轨调整覆盖式哨口的排布密度，系统会自动匹配低、中、高三档素材。"
          : "自选式排布通过左侧风筝上的透明热区完成选择，热区本身不会作为视觉元素显示。"}
      </p>
    </div>
  );
}

interface WhistleLayoutPreviewButtonProps {
  active: boolean;
  iconSrc: string;
  label: string;
  onClick: () => void;
}

function WhistleLayoutPreviewButton({
  active,
  iconSrc,
  label,
  onClick,
}: WhistleLayoutPreviewButtonProps) {
  return (
    <button
      aria-label={label}
      aria-pressed={active}
      className={`whistle-layout-preview-button${
        active ? " whistle-layout-preview-button-active" : ""
      }`}
      onClick={onClick}
      type="button"
    >
      <img alt="" src={iconSrc} />
    </button>
  );
}

interface WhistleTypeButtonProps {
  isSelected: boolean;
  label: string;
  onPlay: () => void;
  onSelect: () => void;
}

function WhistleTypeButton({ isSelected, label, onPlay, onSelect }: WhistleTypeButtonProps) {
  return (
    <div className={`whistle-type-item${isSelected ? " whistle-type-item-selected" : ""}`}>
      <button
        aria-pressed={isSelected}
        className="whistle-type-select-button"
        onClick={onSelect}
        type="button"
      >
        {label}
      </button>
      <button
        aria-label={`试听${label}`}
        className="whistle-type-play-button"
        onClick={onPlay}
        type="button"
      >
        {"\u25b6"}
      </button>
    </div>
  );
}

function getDensityPercent(config: KiteDIYConfig): number {
  if (typeof config.whistleDensity === "number") {
    return Math.round(Math.max(0, Math.min(1, config.whistleDensity)) * 100);
  }

  if (config.whistleFillDensity === "low") {
    return 33;
  }

  if (config.whistleFillDensity === "high") {
    return 100;
  }

  return 67;
}
