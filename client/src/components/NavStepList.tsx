import { useEffect, useRef } from "react";
import { formatDistance, maneuverIcon } from "../lib/nav-helpers";
import { useAppStore } from "../store";

export default function NavStepList() {
  const routeData = useAppStore((s) => s.routeData);
  const navigating = useAppStore((s) => s.navigating);
  const currentIndex = useAppStore((s) => s.currentInstructionIndex);
  const showSteps = useAppStore((s) => s.showSteps);
  const setShowSteps = useAppStore((s) => s.setShowSteps);
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showSteps) {
      activeRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [currentIndex, showSteps]);

  if (!routeData) return null;
  const { instructions } = routeData;

  return (
    <>
      <button
        className="nav-steps-toggle"
        onClick={() => setShowSteps(!showSteps)}
      >
        {showSteps ? "Hide Steps" : `Steps (${instructions.length})`}
      </button>

      {showSteps && (
        <div className="nav-step-list">
          {instructions.map((inst, i) => {
            const isActive = i === currentIndex;
            const isPast = navigating && i < currentIndex;
            const nextDist = instructions[i + 1]
              ? instructions[i + 1].distance - inst.distance
              : 0;

            return (
              <div
                key={i}
                ref={isActive ? activeRef : undefined}
                className={`nav-instruction ${isActive ? "active" : ""} ${isPast ? "past" : ""}`}
              >
                <div className="nav-instruction-icon">{maneuverIcon(inst)}</div>
                <div className="nav-instruction-content">
                  <div className="nav-instruction-text">{inst.message}</div>
                  {inst.street && (
                    <div className="nav-instruction-street">{inst.street}</div>
                  )}
                  {nextDist > 0 && (
                    <div className="nav-instruction-distance">
                      {formatDistance(nextDist)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
