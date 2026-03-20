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
        className="w-full py-2.5 bg-surface-raised border-none border-b border-b-edge text-sm font-semibold text-cyan cursor-pointer transition-colors hover:bg-edge shrink-0"
        onClick={() => setShowSteps(!showSteps)}
      >
        {showSteps ? "Hide Steps" : `Steps (${instructions.length})`}
      </button>

      {showSteps && (
        <div className="max-h-[50vh] overflow-y-auto bg-surface border-t border-edge">
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
                className={`flex items-start gap-3 px-4 py-3 border-b border-edge/50 transition-colors ${
                  isActive
                    ? "bg-cyan-muted border-l-[3px] border-l-cyan pl-[13px]"
                    : ""
                } ${isPast ? "opacity-40" : ""}`}
              >
                <div className="text-xl w-7 text-center shrink-0 mt-px">
                  {maneuverIcon(inst)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-bone leading-tight">
                    {inst.message}
                  </div>
                  {inst.street && (
                    <div className="text-sm text-blue-gray mt-0.5">
                      {inst.street}
                    </div>
                  )}
                  {nextDist > 0 && (
                    <div className="text-xs text-muted mt-1 font-mono">
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
