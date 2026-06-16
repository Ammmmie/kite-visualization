import { useEffect, useState, type CSSProperties } from "react";

const filledFrameMaskCache = new Map<string, string>();

interface SurfaceBaseLayerProps {
  className?: string;
  frameAsset: string;
}

export function SurfaceBaseLayer({ className = "", frameAsset }: SurfaceBaseLayerProps) {
  const [maskAsset, setMaskAsset] = useState(() => filledFrameMaskCache.get(frameAsset) ?? "");

  useEffect(() => {
    let isCurrent = true;
    const cachedMask = filledFrameMaskCache.get(frameAsset);

    if (cachedMask) {
      setMaskAsset(cachedMask);
      return () => {
        isCurrent = false;
      };
    }

    setMaskAsset("");

    void fetch(frameAsset)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Unable to load frame asset: ${frameAsset}`);
        }

        return response.text();
      })
      .then((svgText) => {
        const filledSvg = svgText.replace(
          /(<svg\b[^>]*?)\sfill="none"/,
          '$1 fill="white"',
        );
        const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(filledSvg)}`;

        filledFrameMaskCache.set(frameAsset, dataUrl);

        if (isCurrent) {
          setMaskAsset(dataUrl);
        }
      })
      .catch((error: unknown) => {
        console.warn("Failed to create the kite surface base layer.", error);
      });

    return () => {
      isCurrent = false;
    };
  }, [frameAsset]);

  if (!maskAsset) {
    return null;
  }

  return (
    <span
      aria-hidden="true"
      className={`surface-base-layer${className ? ` ${className}` : ""}`}
      style={
        {
          "--surface-base-mask": `url("${maskAsset}")`,
        } as CSSProperties
      }
    />
  );
}
