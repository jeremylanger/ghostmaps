import { formatDistanceLive, haversine } from "../lib/geo-utils";
import { maneuverIcon } from "../lib/nav-helpers";
import { useAppStore } from "../store";
import type { RouteInstruction } from "../types";

const IMMINENT_THRESHOLD_M = 152; // ~500 ft

interface Props {
  currentInst: RouteInstruction;
  nextInst: RouteInstruction | undefined;
}

export default function NavNextTurn({ currentInst, nextInst }: Props) {
  const userLocation = useAppStore((s) => s.userLocation);
  const currentSpeedLimit = useAppStore((s) => s.currentSpeedLimit);

  // Live distance to next maneuver point
  let distToNext = "";
  let isImminent = false;
  if (nextInst && userLocation) {
    const meters = haversine(
      userLocation.lat,
      userLocation.lng,
      nextInst.point[1],
      nextInst.point[0],
    );
    distToNext = formatDistanceLive(meters);
    isImminent = meters < IMMINENT_THRESHOLD_M;
  }

  return (
    <div className={`nav-next-turn ${isImminent ? "nav-imminent" : ""}`}>
      <div className="nav-next-turn-icon">{maneuverIcon(currentInst)}</div>
      <div className="nav-next-turn-content">
        <div className="nav-next-turn-text">{currentInst.message}</div>
        {currentInst.street && (
          <div className="nav-next-turn-street">{currentInst.street}</div>
        )}
        {distToNext && (
          <div className="nav-next-turn-distance">{distToNext}</div>
        )}
      </div>

      {currentSpeedLimit != null && currentSpeedLimit > 0 && (
        <div className="nav-speed-limit">
          <div className="speed-limit-sign">
            <span className="speed-limit-value">{currentSpeedLimit}</span>
            <span className="speed-limit-unit">mph</span>
          </div>
        </div>
      )}
    </div>
  );
}
