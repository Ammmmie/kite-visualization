import { useEffect, useMemo, useState } from "react";

export default function ImageLightbox({ image, alt, onClose }) {
  const [imageSize, setImageSize] = useState(null);

  useEffect(() => {
    if (!image) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [image, onClose]);

  useEffect(() => {
    setImageSize(null);
  }, [image]);

  const previewStyle = useMemo(() => {
    if (!imageSize) {
      return undefined;
    }

    const padding = 48;
    const viewportLimit = Math.min(window.innerWidth * 0.88, window.innerHeight * 0.88);
    const imageLimit = Math.max(120, viewportLimit - padding);
    const scale = Math.min(4, imageLimit / imageSize.width, imageLimit / imageSize.height);
    const width = imageSize.width * scale;
    const height = imageSize.height * scale;
    const frameSize = Math.max(width, height) + padding;

    return {
      "--preview-width": `${width}px`,
      "--preview-height": `${height}px`,
      "--preview-frame-size": `${frameSize}px`
    };
  }, [imageSize]);

  if (!image) {
    return null;
  }

  return (
    <div
      className="image-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={alt || "image preview"}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <button className="image-lightbox__close" type="button" onClick={onClose} aria-label="Close preview">
        x
      </button>
      <div className="image-lightbox__frame" style={previewStyle}>
        <img
          className="image-lightbox__image"
          src={image}
          alt={alt || ""}
          onLoad={(event) => {
            setImageSize({
              width: event.currentTarget.naturalWidth,
              height: event.currentTarget.naturalHeight
            });
          }}
        />
      </div>
    </div>
  );
}
