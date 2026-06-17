import { useEffect, useMemo, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { getWhistleEdgeHitAreaAssets } from "../../data/whistleAssets";
import type { KiteShape, WhistleEdgeAxisGroupId } from "../../types/kite";

interface WhistleEdgeHitAreasProps {
  debug?: boolean;
  hoveredAxisGroupId: WhistleEdgeAxisGroupId | null;
  kiteShape: KiteShape;
  onHover: (axisGroupId: WhistleEdgeAxisGroupId | null) => void;
  onToggle: (axisGroupId: WhistleEdgeAxisGroupId) => void;
  selectedAxisGroupIds: WhistleEdgeAxisGroupId[];
}

interface LoadedHitArea {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  id: WhistleEdgeAxisGroupId;
  src: string;
}

export function WhistleEdgeHitAreas({
  debug = false,
  hoveredAxisGroupId,
  kiteShape,
  onHover,
  onToggle,
  selectedAxisGroupIds,
}: WhistleEdgeHitAreasProps) {
  const layerRef = useRef<HTMLDivElement | null>(null);
  const hitAreaAssets = useMemo(() => getWhistleEdgeHitAreaAssets(kiteShape), [kiteShape]);
  const [loadedHitAreas, setLoadedHitAreas] = useState<LoadedHitArea[]>([]);

  useEffect(() => {
    let isMounted = true;

    Promise.all(hitAreaAssets.map(loadHitAreaImage))
      .then((hitAreas) => {
        if (isMounted) {
          setLoadedHitAreas(hitAreas.filter((hitArea): hitArea is LoadedHitArea => hitArea !== null));
        }
      })
      .catch((error) => {
        console.warn("Failed to load whistle edge hit areas.", error);
        if (isMounted) {
          setLoadedHitAreas([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [hitAreaAssets]);

  function getAxisGroupAtClientPoint(clientX: number, clientY: number) {
    const layer = layerRef.current;

    if (!layer) {
      return null;
    }

    const rect = layer.getBoundingClientRect();
    const ratioX = (clientX - rect.left) / rect.width;
    const ratioY = (clientY - rect.top) / rect.height;

    if (ratioX < 0 || ratioX > 1 || ratioY < 0 || ratioY > 1) {
      return null;
    }

    for (const hitArea of loadedHitAreas) {
      const x = Math.floor(ratioX * hitArea.canvas.width);
      const y = Math.floor(ratioY * hitArea.canvas.height);
      const alpha = hitArea.context.getImageData(x, y, 1, 1).data[3];

      if (alpha > 8) {
        return hitArea.id;
      }
    }

    return null;
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const nextHoveredAxisGroupId = getAxisGroupAtClientPoint(event.clientX, event.clientY);

    if (nextHoveredAxisGroupId !== hoveredAxisGroupId) {
      onHover(nextHoveredAxisGroupId);
    }
  }

  function handleClick(event: MouseEvent<HTMLDivElement>) {
    const axisGroupId = getAxisGroupAtClientPoint(event.clientX, event.clientY);

    if (axisGroupId) {
      onToggle(axisGroupId);
    }
  }

  if (hitAreaAssets.length === 0) {
    return null;
  }

  return (
    <div
      aria-label="边缘式哨口热区"
      className={`whistle-edge-hit-canvas-layer${debug ? " whistle-edge-hit-canvas-layer-debug" : ""}`}
      onClick={handleClick}
      onPointerLeave={() => onHover(null)}
      onPointerMove={handlePointerMove}
      ref={layerRef}
      role="presentation"
    >
      {debug
        ? hitAreaAssets.map((hitArea) => (
            <img
              alt=""
              className={`whistle-edge-hit-debug-image${
                hoveredAxisGroupId === hitArea.id ? " whistle-edge-hit-debug-image-hovered" : ""
              }${
                selectedAxisGroupIds.includes(hitArea.id)
                  ? " whistle-edge-hit-debug-image-selected"
                  : ""
              }`}
              key={hitArea.id}
              src={hitArea.src}
            />
          ))
        : null}
    </div>
  );
}

function loadHitAreaImage(hitArea: {
  id: WhistleEdgeAxisGroupId;
  src: string;
}): Promise<LoadedHitArea | null> {
  return fetch(hitArea.src)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Unable to load hit area: ${hitArea.src}`);
      }

      return response.arrayBuffer();
    })
    .then((buffer) => {
      const blob = new Blob([buffer], { type: getHitAreaMimeType(buffer) });
      const objectUrl = URL.createObjectURL(blob);

      return new Promise<LoadedHitArea | null>((resolve) => {
        const image = new Image();

        image.onload = () => {
          const width = image.naturalWidth || image.width;
          const height = image.naturalHeight || image.height;
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d", { willReadFrequently: true });

          URL.revokeObjectURL(objectUrl);

          if (!width || !height || !context) {
            resolve(null);
            return;
          }

          canvas.width = width;
          canvas.height = height;
          context.drawImage(image, 0, 0, width, height);
          resolve({
            canvas,
            context,
            id: hitArea.id,
            src: hitArea.src,
          });
        };

        image.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          resolve(null);
        };

        image.src = objectUrl;
      });
    })
    .catch(() => null);
}

function getHitAreaMimeType(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer.slice(0, 4));

  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return "image/png";
  }

  return "image/svg+xml";
}
