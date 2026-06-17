import type { KeyboardEvent } from "react";
import type { WhistleEdgeAxisGroupId } from "../../types/kite";

interface HexagonWhistleHitAreasProps {
  debug?: boolean;
  hoveredAxisGroupId: WhistleEdgeAxisGroupId | null;
  onHover: (axisGroupId: WhistleEdgeAxisGroupId | null) => void;
  onToggle: (axisGroupId: WhistleEdgeAxisGroupId) => void;
  selectedAxisGroupIds: WhistleEdgeAxisGroupId[];
}

const axisGroupLabels: Record<WhistleEdgeAxisGroupId, string> = {
  "choose-a": "上方轴组",
  "choose-b": "下方轴组",
  "choose-c": "左右轴组",
  "choose-d": "中心轴组",
  "choose-e": "轴组 E",
  "choose-f": "轴组 F",
  "choose-g": "轴组 G",
  "choose-h": "轴组 H",
  "choose-i": "轴组 I",
};

export function HexagonWhistleHitAreas({
  debug = false,
  hoveredAxisGroupId,
  onHover,
  onToggle,
  selectedAxisGroupIds,
}: HexagonWhistleHitAreasProps) {
  function handleKeyDown(event: KeyboardEvent<SVGGElement>, axisGroupId: WhistleEdgeAxisGroupId) {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    onToggle(axisGroupId);
  }

  function getGroupClassName(axisGroupId: WhistleEdgeAxisGroupId): string {
    return [
      "whistle-edge-hit-group",
      hoveredAxisGroupId === axisGroupId ? "whistle-edge-hit-group-hovered" : "",
      selectedAxisGroupIds.includes(axisGroupId) ? "whistle-edge-hit-group-selected" : "",
    ]
      .filter(Boolean)
      .join(" ");
  }

  function getSharedGroupProps(axisGroupId: WhistleEdgeAxisGroupId) {
    return {
      "aria-label": axisGroupLabels[axisGroupId],
      "aria-pressed": selectedAxisGroupIds.includes(axisGroupId),
      "data-axis-group": axisGroupId,
      className: getGroupClassName(axisGroupId),
      onClick: () => onToggle(axisGroupId),
      onFocus: () => onHover(axisGroupId),
      onKeyDown: (event: KeyboardEvent<SVGGElement>) => handleKeyDown(event, axisGroupId),
      onMouseEnter: () => onHover(axisGroupId),
      onMouseLeave: () => onHover(null),
      role: "button",
      tabIndex: 0,
    };
  }

  return (
    <svg
      aria-label="六角星边缘式哨口热区"
      className={`whistle-edge-hit-svg${debug ? " whistle-edge-hit-svg-debug" : ""}`}
      fill="none"
      viewBox="0 0 204 209"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g {...getSharedGroupProps("choose-a")}>
        <path
          className="whistle-edge-hit-shape"
          d="M64.5 64.5L39.2461 53.2537L92.7461 2.65283L113.246 2.65283L169.746 58.0925L145 64.5L104.746 35.342L64.5 64.5Z"
        />
      </g>
      <g {...getSharedGroupProps("choose-b")}>
        <path
          className="whistle-edge-hit-shape"
          d="M57.5 149.5L37.2461 159.021L90 209L112 209L167.746 154.182L148 149.5L102.746 176.932L57.5 149.5Z"
        />
      </g>
      <g {...getSharedGroupProps("choose-c")}>
        <path className="whistle-edge-hit-shape" d="M34 66H66V147H34V66Z" />
        <rect className="whistle-edge-hit-shape" height="81" width="32" x="138" y="66" />
      </g>
      <g {...getSharedGroupProps("choose-d")}>
        <rect className="whistle-edge-hit-shape" height="40" width="40" x="82" y="87" />
      </g>
    </svg>
  );
}
