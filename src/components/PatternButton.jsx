export default function PatternButton({ children, className = "", icon, onClick }) {
  return (
    <button className={`pattern-button ${className}`} type="button" onClick={onClick}>
      <img className="pattern-button__icon" src={icon} alt="" aria-hidden="true" />
      <span>{children}</span>
    </button>
  );
}
