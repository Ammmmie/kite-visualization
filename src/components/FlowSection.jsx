import { useEffect, useMemo, useRef, useState } from "react";

export default function FlowSection({
  children,
  className = "",
  initialStep = 0,
  canEnterStep = () => true
}) {
  const panes = useMemo(() => (Array.isArray(children) ? children : [children]), [children]);
  const [step, setStep] = useState(initialStep);
  const [maxReached, setMaxReached] = useState(initialStep);
  const [leavingSteps, setLeavingSteps] = useState([]);
  const leavingTimersRef = useRef(new Map());

  useEffect(() => {
    document.body.classList.add("flow-scroll-locked");
    document.documentElement.classList.add("flow-scroll-locked");

    return () => {
      document.body.classList.remove("flow-scroll-locked");
      document.documentElement.classList.remove("flow-scroll-locked");
      leavingTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
      leavingTimersRef.current.clear();
    };
  }, []);

  const setLeavingStep = (leavingStep) => {
    setLeavingSteps((currentLeavingSteps) =>
      currentLeavingSteps.includes(leavingStep)
        ? currentLeavingSteps
        : [...currentLeavingSteps, leavingStep]
    );

    const existingTimer = leavingTimersRef.current.get(leavingStep);
    if (existingTimer) {
      window.clearTimeout(existingTimer);
    }

    const timerId = window.setTimeout(() => {
      setLeavingSteps((currentLeavingSteps) =>
        currentLeavingSteps.filter((currentLeavingStep) => currentLeavingStep !== leavingStep)
      );
      leavingTimersRef.current.delete(leavingStep);
    }, 560);

    leavingTimersRef.current.set(leavingStep, timerId);
  };

  const transitionTo = (targetStep) => {
    if (targetStep === step) {
      return true;
    }

    setLeavingStep(step);
    setLeavingSteps((currentLeavingSteps) =>
      currentLeavingSteps.filter((currentLeavingStep) => currentLeavingStep !== targetStep)
    );
    setStep(targetStep);
    return true;
  };

  const goTo = (targetStep) => {
    if (targetStep < 0 || targetStep >= panes.length) {
      return false;
    }

    if (targetStep > maxReached || !canEnterStep(targetStep)) {
      return false;
    }

    return transitionTo(targetStep);
  };

  const goNext = () => {
    const nextStep = step + 1;
    if (nextStep >= panes.length || !canEnterStep(nextStep)) {
      return false;
    }

    transitionTo(nextStep);
    setMaxReached((currentMaxReached) => Math.max(currentMaxReached, nextStep));
    return true;
  };

  return (
    <section className={`flow-section ${className}`.trim()}>
      <div className="flow-section__viewport">
        <div className="flow-section__track">
          {panes.map((pane, index) => (
            <section
              className={[
                "flow-section__pane",
                index === step
                  ? "flow-section__pane--active"
                  : leavingSteps.includes(index)
                    ? "flow-section__pane--leaving"
                    : "flow-section__pane--entering"
              ].join(" ")}
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
