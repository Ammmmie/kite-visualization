import type { KeyboardEvent, ReactNode, SVGProps } from "react";
import type { KiteShape, WhistleEdgeAxisGroupId } from "../../types/kite";

interface WhistleEdgeHitAreasProps {
  debug?: boolean;
  hoveredAxisGroupId: WhistleEdgeAxisGroupId | null;
  kiteShape: KiteShape;
  onHover: (axisGroupId: WhistleEdgeAxisGroupId | null) => void;
  onToggle: (axisGroupId: WhistleEdgeAxisGroupId) => void;
  selectedAxisGroupIds: WhistleEdgeAxisGroupId[];
}

const axisGroupLabels: Record<WhistleEdgeAxisGroupId, string> = {
  "choose-a": "轴组 A",
  "choose-b": "轴组 B",
  "choose-c": "轴组 C",
  "choose-d": "轴组 D",
  "choose-e": "轴组 E",
  "choose-f": "轴组 F",
  "choose-g": "轴组 G",
  "choose-h": "轴组 H",
  "choose-i": "轴组 I",
};

export function WhistleEdgeHitAreas({
  debug = false,
  hoveredAxisGroupId,
  kiteShape,
  onHover,
  onToggle,
  selectedAxisGroupIds,
}: WhistleEdgeHitAreasProps) {
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

  const hitArea = getHitAreaSvg(kiteShape, getSharedGroupProps);

  if (!hitArea) {
    return null;
  }

  return (
    <svg
      aria-label="边缘式哨口热区"
      className={`whistle-edge-hit-svg${debug ? " whistle-edge-hit-svg-debug" : ""}`}
      fill="none"
      viewBox={hitArea.viewBox}
      xmlns="http://www.w3.org/2000/svg"
    >
      {hitArea.children}
    </svg>
  );
}

function getHitAreaSvg(
  kiteShape: KiteShape,
  getSharedGroupProps: (
    axisGroupId: WhistleEdgeAxisGroupId,
  ) => SVGProps<SVGGElement>,
): { viewBox: string; children: ReactNode } | null {
  if (kiteShape === "hexagon") {
    return {
      viewBox: "0 0 204 209",
      children: (
        <>
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
        </>
      ),
    };
  }

  if (kiteShape === "eight-star") {
    return {
      viewBox: "0 0 200 200",
      children: (
        <>
          <g {...getSharedGroupProps("choose-a")}>
            <rect
              className="whistle-edge-hit-shape"
              height="53"
              transform="rotate(-45.9642 126 35.0645)"
              width="14"
              x="126"
              y="35.0645"
            />
            <rect
              className="whistle-edge-hit-shape"
              height="53"
              transform="matrix(-0.695108 -0.718905 -0.718905 0.695108 74.8335 35.0645)"
              width="14"
            />
          </g>
          <g {...getSharedGroupProps("choose-b")}>
            <rect
              className="whistle-edge-hit-shape"
              height="53"
              transform="matrix(0.695108 0.718905 0.718905 -0.695108 126 161.841)"
              width="14"
            />
            <rect
              className="whistle-edge-hit-shape"
              height="53"
              transform="rotate(134.036 74.8335 161.841)"
              width="14"
              x="74.8335"
              y="161.841"
            />
          </g>
          <g {...getSharedGroupProps("choose-c")}>
            <rect className="whistle-edge-hit-shape" height="51" width="16" x="163" y="73" />
            <rect className="whistle-edge-hit-shape" height="51" width="16" x="21" y="72" />
          </g>
          <g {...getSharedGroupProps("choose-d")}>
            <rect
              className="whistle-edge-hit-shape"
              height="51"
              transform="rotate(90 125 161)"
              width="16"
              x="125"
              y="161"
            />
            <rect
              className="whistle-edge-hit-shape"
              height="51"
              transform="rotate(90 126 19)"
              width="16"
              x="126"
              y="19"
            />
          </g>
          <g {...getSharedGroupProps("choose-e")}>
            <rect className="whistle-edge-hit-shape" height="44" width="46" x="79" y="76" />
          </g>
        </>
      ),
    };
  }

  if (kiteShape === "nineteen-star") {
    return {
      viewBox: "0 0 321 319",
      children: (
        <>
          <g {...getSharedGroupProps("choose-a")}>
            <path
              className="whistle-edge-hit-shape"
              d="M129 61L62 125H72.5L129 70.5L160.5 102L193 70.5L251.5 127.5L261.5 125L193 61L160.5 92.5L129 61Z"
            />
          </g>
          <g {...getSharedGroupProps("choose-b")}>
            <path
              className="whistle-edge-hit-shape"
              d="M129 131.5L62 67.5H72.5L129 122L160.5 90.5L193 122L251.5 65L261.5 67.5L193 131.5L160.5 100L129 131.5Z"
            />
          </g>
          <g {...getSharedGroupProps("choose-c")}>
            <rect className="whistle-edge-hit-shape" height="191" width="12" x="74" y="63" />
            <rect className="whistle-edge-hit-shape" height="191" width="12" x="235" y="64" />
          </g>
          <g {...getSharedGroupProps("choose-d")}>
            <path
              className="whistle-edge-hit-shape"
              d="M96 122.5L29.5 188L39.5 189.5L96 135L128.5 167.5L161.5 135L193.5 167.5L224.5 136.5L285 191.5L293.5 188L224.5 122.5L193.5 154L161.5 122.5L128.5 154L96 122.5Z"
            />
          </g>
          <g {...getSharedGroupProps("choose-e")}>
            <path
              className="whistle-edge-hit-shape"
              d="M96 197.5L29.5 132L39.5 130.5L96 185L128.5 152.5L161.5 185L193.5 152.5L224.5 183.5L285 128.5L293.5 132L224.5 197.5L193.5 166L161.5 197.5L128.5 166L96 197.5Z"
            />
          </g>
          <g {...getSharedGroupProps("choose-f")}>
            <rect className="whistle-edge-hit-shape" height="314.355" width="12" x="106" y="3" />
            <rect className="whistle-edge-hit-shape" height="314.355" width="12" x="203" y="2.64551" />
          </g>
          <g {...getSharedGroupProps("choose-g")}>
            <path
              className="whistle-edge-hit-shape"
              d="M129 187L62 251H72.5L129 196.5L160.5 228L193 196.5L251.5 253.5L261.5 251L193 187L160.5 218.5L129 187Z"
            />
          </g>
          <g {...getSharedGroupProps("choose-h")}>
            <path
              className="whistle-edge-hit-shape"
              d="M128 258.5L61 194.5H71.5L128 249L159.5 217.5L192 249L250.5 192L260.5 194.5L192 258.5L159.5 227L128 258.5Z"
            />
          </g>
          <g {...getSharedGroupProps("choose-i")}>
            <rect className="whistle-edge-hit-shape" height="314.355" width="12" x="138" y="3" />
            <rect className="whistle-edge-hit-shape" height="314.355" width="12" x="170" y="6" />
          </g>
        </>
      ),
    };
  }

  if (kiteShape === "seven-star") {
    return {
      viewBox: "0 0 301 301",
      children: (
        <>
          <g {...getSharedGroupProps("choose-a")}>
            <path
              className="whistle-edge-hit-shape"
              d="M161.294 49.8982L208.882 99.2911L198.975 108.927L151.387 59.5343L104.551 108.319L94.5549 98.6583L151.263 40.3933L161.294 49.8982Z"
            />
          </g>
          <g {...getSharedGroupProps("choose-b")}>
            <path
              className="whistle-edge-hit-shape"
              d="M160.294 251.262L207.882 201.869L197.975 192.233L150.387 241.626L103.551 192.841L93.5549 202.502L150.263 260.767L160.294 251.262Z"
            />
          </g>
          <g {...getSharedGroupProps("choose-c")}>
            <rect className="whistle-edge-hit-shape" height="296" width="11" x="70" y="1" />
            <rect className="whistle-edge-hit-shape" height="296" width="10" x="221" y="2" />
          </g>
          <g {...getSharedGroupProps("choose-d")}>
            <path
              className="whistle-edge-hit-shape"
              d="M151 91L45 194.5L40 199H59.5L151 110L243 199H261L151 91Z"
            />
          </g>
          <g {...getSharedGroupProps("choose-e")}>
            <path
              className="whistle-edge-hit-shape"
              d="M149.5 209L43.5 105.5L38.5 101H58L149.5 190L241.5 101H259.5L149.5 209Z"
            />
          </g>
          <g {...getSharedGroupProps("choose-f")}>
            <rect className="whistle-edge-hit-shape" height="296" width="11" x="119" y="1" />
            <rect className="whistle-edge-hit-shape" height="296" width="11" x="170" y="1" />
          </g>
          <g {...getSharedGroupProps("choose-g")}>
            <rect className="whistle-edge-hit-shape" height="10" width="300" x="1" y="145" />
          </g>
        </>
      ),
    };
  }

  return null;
}
