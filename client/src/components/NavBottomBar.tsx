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

/** Sum haversine distances along remaining route segments from closestSegIdx onward. */
function remainingRouteDistance(
  coordinates: [number, number][],
  closestSegIdx: number,
  userLat: number,
  userLng: number,
): number {
  if (closestSegIdx >= coordinates.length - 1) return 0;

  // Distance from user to next route point
  const [nextLng, nextLat] = coordinates[closestSegIdx + 1];
  let total = haversine(userLat, userLng, nextLat, nextLng);

  // Sum remaining segments
  for (let i = closestSegIdx + 1; i < coordinates.length - 1; i++) {
    const [lng1, lat1] = coordinates[i];
    const [lng2, lat2] = coordinates[i + 1];
    total += haversine(lat1, lng1, lat2, lng2);
  }

  return total;
}

export default function NavBottomBar({ summary }: Props) {
  const clearRoute = useAppStore((s) => s.clearRoute);
  const userLocation = useAppStore((s) => s.userLocation);
  const routeData = useAppStore((s) => s.routeData);
  const closestSegmentIndex = useAppStore((s) => s.closestSegmentIndex);

  // Compute remaining distance along route segments (not straight-line)
  let remainingDistance = summary.lengthInMeters;
  if (userLocation && routeData?.coordinates.length) {
    remainingDistance = remainingRouteDistance(
      routeData.coordinates,
      closestSegmentIndex,
      userLocation.lat,
      userLocation.lng,
    );
  }

  // Estimate remaining time based on proportion of distance remaining
  const avgSpeedMps =
    summary.travelTimeInSeconds > 0
      ? summary.lengthInMeters / summary.travelTimeInSeconds
      : 1;
  const remainingTime =
    avgSpeedMps > 0
      ? remainingDistance / avgSpeedMps
      : summary.travelTimeInSeconds;

  const eta = formatClockETA(undefined, remainingTime);

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
