import { haversine } from "../lib/geo-utils";
import {
  formatClockETA,
  formatDistance,
  formatDuration,
} from "../lib/nav-helpers";
import { useAppStore } from "../store";
import type { RouteSummary } from "../types";

interface Props {
  summary: RouteSummary;
}

export default function NavBottomBar({ summary }: Props) {
  const clearRoute = useAppStore((s) => s.clearRoute);
  const userLocation = useAppStore((s) => s.userLocation);
  const routeData = useAppStore((s) => s.routeData);

  // Compute remaining distance from user to end of route
  let remainingDistance = summary.lengthInMeters;
  const remainingTime = summary.travelTimeInSeconds;
  if (userLocation && routeData?.coordinates.length) {
    const endCoord = routeData.coordinates[routeData.coordinates.length - 1];
    remainingDistance = haversine(
      userLocation.lat,
      userLocation.lng,
      endCoord[1],
      endCoord[0],
    );
  }

  const eta = formatClockETA(summary.arrivalTime, remainingTime);

  return (
    <div className="nav-bottom-bar">
      <div className="nav-bottom-info">
        <span className="nav-bottom-eta">{eta}</span>
        <span className="nav-bottom-duration">
          {formatDuration(remainingTime)}
        </span>
        <span className="nav-bottom-distance">
          {formatDistance(remainingDistance)}
        </span>
      </div>
      <button className="nav-end-btn" onClick={clearRoute}>
        End
      </button>
    </div>
  );
}
