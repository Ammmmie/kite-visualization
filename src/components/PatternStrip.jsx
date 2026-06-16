import AutoScrollStrip from "./AutoScrollStrip.jsx";

export default function PatternStrip({ id, className = "", label, detailItems = [], onImageClick }) {
  return (
    <section id={id} className={`pattern-strip ${className}`} aria-label={label}>
      <AutoScrollStrip
        title={label}
        items={detailItems}
        imageClassName="auto-scroll-strip__image--pattern"
        onImageClick={onImageClick}
      />
    </section>
  );
}
