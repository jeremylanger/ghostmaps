import { ArrowLeft } from "lucide-react";
import { formatDistanceLive } from "../lib/geo-utils";
import { formatDuration, maneuverIcon } from "../lib/nav-helpers";
import { useAppStore } from "../store";
import NavBottomBar from "./NavBottomBar";
import NavLaneGuidance from "./NavLaneGuidance";
import NavNextTurn from "./NavNextTurn";
import NavStepList from "./NavStepList";
import { Button } from "./ui/button";

export default function NavigationPanel() {
  const routeData = useAppStore((s) => s.routeData);
  const navigating = useAppStore((s) => s.navigating);
  const currentIndex = useAppStore((s) => s.currentInstructionIndex);
  const currentLanes = useAppStore((s) => s.currentLanes);
  const rerouting = useAppStore((s) => s.rerouting);

  if (!routeData) return null;

  const { instructions, summary } = routeData;
  const currentInst = instructions[currentIndex] || instructions[0];
  const nextInst = instructions[currentIndex + 1];
  const peekInst = instructions[currentIndex + 2];

  if (!navigating) {
    return (
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[640px] z-10 bg-surface/95 backdrop-blur-md border-t border-edge rounded-t-2xl shadow-panel-up max-h-[70vh] flex flex-col animate-decloak">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-edge">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-blue-gray hover:text-cyan size-8"
            onClick={() => useAppStore.getState().clearRoute()}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <span className="text-[1.4rem] font-bold text-cyan font-mono">
            {formatDuration(summary.travelTimeInSeconds)}
          </span>
          <span className="text-base text-blue-gray">
            {formatDistanceLive(summary.lengthInMeters)}
          </span>
          {summary.trafficDelayInSeconds > 60 && (
            <span className="text-sm font-medium text-coral">
              +{formatDuration(summary.trafficDelayInSeconds)} traffic
            </span>
          )}
        </div>
        <NavStepList />
        <div className="px-5 py-4 border-t border-edge shrink-0">
          <Button
            size="lg"
            className="w-full font-display text-[15px] h-12 rounded-xl shadow-glow"
            onClick={() => useAppStore.getState().setNavigating(true)}
          >
            Start Navigation
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Top: next turn + steps */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[640px] z-20 bg-surface/95 backdrop-blur-md rounded-b-xl shadow-panel overflow-hidden border-b border-edge">
        {rerouting && (
          <div className="bg-cyan text-void text-center py-1.5 text-sm font-semibold animate-pulse">
            Rerouting...
          </div>
        )}
        <NavNextTurn currentInst={currentInst} nextInst={nextInst} />
        {currentLanes && currentLanes.length > 0 && (
          <NavLaneGuidance lanes={currentLanes} />
        )}
        {peekInst && nextInst && (
          <div className="flex items-center gap-2 px-4 py-2 bg-surface-raised border-b border-edge text-sm text-blue-gray shrink-0">
            <span className="text-base w-5 text-center">
              {maneuverIcon(nextInst)}
            </span>
            <span className="flex-1">
              Then {nextInst.message.toLowerCase()}
            </span>
          </div>
        )}
        <NavStepList />
      </div>

      {/* Bottom: ETA bar */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[640px] z-20">
        <NavBottomBar summary={summary} />
      </div>
    </>
  );
}
