export default function SectionTitle({ children, className = "", icon }) {
  return (
    <div className={`section-title ${className}`}>
      <img className="section-title__mark" src={icon} alt="" aria-hidden="true" />
      <h2>{children}</h2>
    </div>
  );
}
