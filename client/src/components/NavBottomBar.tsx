import { haversine } from "../lib/geo-utils";
import {
  formatClockETA,
  formatDistance,
  formatDuration,
} from "../lib/nav-helpers";
import { useAppStore } from "../store";
import type { RouteSummary } from "../types";
import { Button } from "./ui/button";

interface Props {
  summary: RouteSummary;
}

function remainingRouteDistance(
  coordinates: [number, number][],
  closestSegIdx: number,
  userLat: number,
  userLng: number,
): number {
  if (closestSegIdx >= coordinates.length - 1) return 0;

  const [nextLng, nextLat] = coordinates[closestSegIdx + 1];
  let total = haversine(userLat, userLng, nextLat, nextLng);

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

  let remainingDistance = summary.lengthInMeters;
  if (userLocation && routeData?.coordinates.length) {
    remainingDistance = remainingRouteDistance(
      routeData.coordinates,
      closestSegmentIndex,
      userLocation.lat,
      userLocation.lng,
    );
  }

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
    <div className="flex items-center justify-between px-5 py-4 bg-surface/95 backdrop-blur-md shadow-panel-up border-t border-edge">
      <div className="flex items-baseline gap-4">
        <span className="text-[28px] font-extrabold text-cyan font-mono">
          {eta}
        </span>
        <span className="text-[22px] font-bold text-bone font-mono">
          {formatDuration(remainingTime)}
        </span>
        <span className="text-lg font-semibold text-blue-gray font-mono">
          {formatDistance(remainingDistance)}
        </span>
      </div>
      <Button variant="destructive" onClick={clearRoute}>
        End
      </Button>
    </div>
  );
}
