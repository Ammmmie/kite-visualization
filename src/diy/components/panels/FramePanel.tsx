import { frameOptions } from "../../data/frameOptions";
import type { KiteShape } from "../../types/kite";

interface FramePanelProps {
  onShapeChange: (shape: KiteShape) => void;
  selectedShape: KiteShape | null;
}

export function FramePanel({ onShapeChange, selectedShape }: FramePanelProps) {
  return (
    <div className="frame-grid">
      {frameOptions.map((option) => (
        <button
          aria-pressed={option.id === selectedShape}
          className={`option-card option-card-button frame-option-card frame-option-${option.id}${
            option.id === selectedShape ? " option-card-selected" : ""
          }`}
          key={option.id}
          onClick={() => onShapeChange(option.id)}
          type="button"
        >
          <div className="frame-thumb" aria-hidden="true">
            {option.assetSrc ? <img alt="" src={option.assetSrc} /> : <span>{option.label.slice(0, 1)}</span>}
          </div>
          <div>
            <h3>{option.label}</h3>
            <p>{option.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
