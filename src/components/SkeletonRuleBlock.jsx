import AutoScrollStrip from "./AutoScrollStrip.jsx";

export default function SkeletonRuleBlock({
  className = "",
  title,
  shadowText,
  ruleText,
  images,
  transformItems,
  onImageClick
}) {
  return (
    <section className={`skeleton-rule ${className}`} aria-label={title}>
      <div className="skeleton-rule__shadow">
        <p>Shadowshape</p>
        <p>{shadowText}</p>
      </div>

      <p className="skeleton-rule__title">{title}</p>
      <p className="skeleton-rule__rule">{ruleText}</p>

      <div className="skeleton-rule__examples" aria-hidden="true">
        {images.map((image) => (
          <button
            key={image.src}
            className="skeleton-rule__image-button"
            type="button"
            onClick={() => onImageClick?.({ src: image.src, alt: `${title} skeleton image` })}
            style={{
              left: image.x,
              top: image.y,
              width: image.width,
              height: image.height
            }}
          >
            <img className={`skeleton-rule__image ${image.className || ""}`} src={image.src} alt="" />
          </button>
        ))}
      </div>

      <AutoScrollStrip
        className="skeleton-rule__transform-strip"
        title={title}
        items={transformItems}
        imageClassName="auto-scroll-strip__image--skeleton"
        onImageClick={onImageClick}
      />
    </section>
  );
}
