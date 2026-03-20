import { formatDistanceLive } from "../lib/geo-utils";
import { formatDuration, maneuverIcon } from "../lib/nav-helpers";
import { useAppStore } from "../store";
import NavBottomBar from "./NavBottomBar";
import NavLaneGuidance from "./NavLaneGuidance";
import NavNextTurn from "./NavNextTurn";
import NavStepList from "./NavStepList";

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
      <div className="navigation-panel nav-preview">
        <div className="nav-preview-summary">
          <span className="nav-preview-duration">
            {formatDuration(summary.travelTimeInSeconds)}
          </span>
          <span className="nav-preview-distance">
            {formatDistanceLive(summary.lengthInMeters)}
          </span>
          {summary.trafficDelayInSeconds > 60 && (
            <span className="nav-preview-traffic">
              +{formatDuration(summary.trafficDelayInSeconds)} traffic
            </span>
          )}
        </div>
        <NavStepList />
        <div className="nav-footer">
          <button
            className="nav-start-btn"
            onClick={() => useAppStore.getState().setNavigating(true)}
          >
            Start Navigation
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Top: next turn + steps */}
      <div className="nav-top-overlay">
        {rerouting && <div className="nav-rerouting">Rerouting...</div>}
        <NavNextTurn currentInst={currentInst} nextInst={nextInst} />
        {currentLanes && currentLanes.length > 0 && (
          <NavLaneGuidance lanes={currentLanes} />
        )}
        {peekInst && nextInst && (
          <div className="nav-upcoming">
            <span className="nav-upcoming-icon">{maneuverIcon(nextInst)}</span>
            <span className="nav-upcoming-text">
              Then {nextInst.message.toLowerCase()}
            </span>
          </div>
        )}
        <NavStepList />
      </div>

      {/* Bottom: ETA bar with hero numbers */}
      <div className="nav-bottom-overlay">
        <NavBottomBar summary={summary} />
      </div>
    </>
  );
}
