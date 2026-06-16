import { edgeOptions, whistleLayoutOptions, whistleTypeOptions } from "../../data/whistleOptions";
import type { EdgeKey, KiteDIYConfig, WhistleLayoutMode } from "../../types/kite";

interface WhistlePanelProps {
  config: KiteDIYConfig;
  onDensityChange: (density: number) => void;
  onEdgeToggle: (edge: EdgeKey) => void;
  onLayoutChange: (layoutMode: WhistleLayoutMode) => void;
}

export function WhistlePanel({ config, onDensityChange, onEdgeToggle, onLayoutChange }: WhistlePanelProps) {
  return (
    <div className="whistle-panel">
      <div className="layout-options">
        {whistleLayoutOptions.map((option) => (
          <button
            aria-pressed={option.id === config.whistleLayoutMode}
            className={`option-card option-card-button option-card-compact${
              option.id === config.whistleLayoutMode ? " option-card-selected" : ""
            }`}
            key={option.id}
            onClick={() => onLayoutChange(option.id)}
            type="button"
          >
            <h3>{option.label}</h3>
            <p>{option.description}</p>
          </button>
        ))}
      </div>

      <div className="density-readout">
        <label htmlFor="whistle-density">疏密</label>
        <input
          id="whistle-density"
          max="1"
          min="0"
          onChange={(event) => onDensityChange(Number(event.target.value))}
          step="0.01"
          type="range"
          value={config.whistleDensity}
        />
        <strong>{Math.round(config.whistleDensity * 100)}%</strong>
      </div>

      <div className="edge-row" aria-label="边缘选择">
        {edgeOptions.map((edge) => (
          <button
            aria-pressed={config.selectedEdges.includes(edge.id)}
            className={config.selectedEdges.includes(edge.id) ? "edge-chip edge-chip-selected" : "edge-chip"}
            key={edge.id}
            onClick={() => onEdgeToggle(edge.id)}
            type="button"
          >
            {edge.label}
          </button>
        ))}
      </div>

      <div className="whistle-type-row" aria-label="哨口类型">
        {whistleTypeOptions.map((type) => (
          <span className={`whistle-type whistle-type-${type.id}`} key={type.id}>
            <img alt="" src={type.iconSrc} />
            {type.label}
          </span>
        ))}
      </div>
    </div>
  );
}
