import { useEffect, useMemo, useState } from "react";

export default function FlowSection({
  children,
  className = "",
  initialStep = 0,
  canEnterStep = () => true
}) {
  const panes = useMemo(() => (Array.isArray(children) ? children : [children]), [children]);
  const [step, setStep] = useState(initialStep);
  const [maxReached, setMaxReached] = useState(initialStep);

  useEffect(() => {
    document.body.classList.add("flow-scroll-locked");
    document.documentElement.classList.add("flow-scroll-locked");

    return () => {
      document.body.classList.remove("flow-scroll-locked");
      document.documentElement.classList.remove("flow-scroll-locked");
    };
  }, []);

  const goTo = (targetStep) => {
    if (targetStep < 0 || targetStep >= panes.length) {
      return false;
    }

    if (targetStep > maxReached || !canEnterStep(targetStep)) {
      return false;
    }

    setStep(targetStep);
    return true;
  };

  const goNext = () => {
    const nextStep = step + 1;
    if (nextStep >= panes.length || !canEnterStep(nextStep)) {
      return false;
    }

    setStep(nextStep);
    setMaxReached((currentMaxReached) => Math.max(currentMaxReached, nextStep));
    return true;
  };

  return (
    <section className={`flow-section ${className}`.trim()}>
      <div className="flow-section__viewport">
        <div
          className="flow-section__track"
          style={{ transform: `translateX(-${step * 33.3333}%)` }}
        >
          {panes.map((pane, index) => (
            <section
              className="flow-section__pane"
              data-active={index === step ? "true" : "false"}
              key={index}
            >
              {typeof pane === "function" ? pane({ step, maxReached, goNext, goTo }) : pane}
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
