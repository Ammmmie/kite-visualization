import { useEffect } from "react";
import buttonIcon from "../assets/figma/小icon2.png?url";

export default function StepInfoPopover({ step, position, onClose }) {
  useEffect(() => {
    if (!step) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const handleScroll = (event) => {
      const target = event.target;
      if (target === document || target === document.documentElement || target === document.body || target === window) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [step, onClose]);

  if (!step || !position) {
    return null;
  }

  return (
    <div className="step-info-popover-layer" onClick={onClose}>
      <aside
        className="step-info-popover"
        style={{ left: position.left, top: position.top }}
        role="dialog"
        aria-label={`${step.number} ${step.title}说明`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="step-info-popover__pill">
          <img className="step-info-popover__icon" src={buttonIcon} alt="" aria-hidden="true" />
          <span>{step.title}</span>
        </div>
        <p className="step-info-popover__body">{step.description}</p>
      </aside>
    </div>
  );
}
