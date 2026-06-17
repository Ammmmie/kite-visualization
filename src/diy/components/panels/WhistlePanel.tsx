import {
  whistleFillDensityOptions,
  whistleLayoutOptions,
  whistleSizeOptions,
} from "../../data/whistleOptions";
import type {
  EdgeKey,
  KiteDIYConfig,
  WhistleFillDensity,
  WhistleLayoutMode,
  WhistleSize,
} from "../../types/kite";

interface WhistlePanelProps {
  config: KiteDIYConfig;
  onDensityChange: (density: WhistleFillDensity) => void;
  onEdgeToggle: (edge: EdgeKey) => void;
  onLayoutChange: (layoutMode: WhistleLayoutMode) => void;
  onWhistleSizeToggle: (whistleSize: WhistleSize) => void;
}

export function WhistlePanel({
  config,
  onDensityChange,
  onLayoutChange,
  onWhistleSizeToggle,
}: WhistlePanelProps) {
  const isFillMode = config.whistleLayoutMode === "horizontal-staggered";
  const supportsEdgeMode =
    config.kiteShape === "hexagon" ||
    config.kiteShape === "seven-star" ||
    config.kiteShape === "eight-star" ||
    config.kiteShape === "nineteen-star";
  const edgeModeNote =
    supportsEdgeMode
      ? "悬停风筝主轴预览哨口，点击选择，再次点击取消"
      : "边缘式当前先支持六角星、七连星、八角星、十九连星测试";

  return (
    <div className="whistle-panel">
      <div className="layout-options">
        {whistleLayoutOptions.map((option) => (
          <button
            aria-pressed={option.id === config.whistleLayoutMode}
            className={`option-card option-card-button option-card-compact whistle-layout-card${
              option.id === config.whistleLayoutMode ? " option-card-selected" : ""
            }`}
            key={option.id}
            onClick={() => onLayoutChange(option.id)}
            type="button"
          >
            <img alt="" className="whistle-layout-icon" src={option.iconSrc} />
            <h3>{option.label}</h3>
            <p>{option.description}</p>
          </button>
        ))}
      </div>

      <div className="whistle-control-group">
        <span className="whistle-control-label">密度</span>
        <div className="whistle-segmented-row" aria-label="覆盖式密度">
          {whistleFillDensityOptions.map((density) => (
            <button
              aria-pressed={density.id === config.whistleFillDensity}
              className={`whistle-choice-button${
                density.id === config.whistleFillDensity ? " whistle-choice-button-selected" : ""
              }`}
              disabled={!isFillMode}
              key={density.id}
              onClick={() => onDensityChange(density.id)}
              type="button"
            >
              {density.label}
            </button>
          ))}
        </div>
      </div>

      <div className="whistle-control-group">
        <span className="whistle-control-label">哨口</span>
        <div className="whistle-size-row" aria-label="哨口大小">
          {whistleSizeOptions.map((size) => (
            <button
              aria-pressed={config.selectedWhistleSizes.includes(size.id)}
              className={`whistle-choice-button whistle-size-button${
                config.selectedWhistleSizes.includes(size.id)
                  ? " whistle-choice-button-selected"
                  : ""
              }`}
              disabled={!isFillMode}
              key={size.id}
              onClick={() => onWhistleSizeToggle(size.id)}
              title={size.description}
              type="button"
            >
              {size.label}
            </button>
          ))}
        </div>
      </div>

      {!isFillMode ? <p className="whistle-panel-note">{edgeModeNote}</p> : null}
    </div>
  );
}
