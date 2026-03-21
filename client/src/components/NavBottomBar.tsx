import { haversine } from "../lib/geo-utils";
import {
  formatClockETA,
  formatDistance,
  formatDuration,
} from "../lib/nav-helpers";
import { useAppStore } from "../store";
import type { RouteSummary } from "../types";
import { Button } from "./ui/button";

function ValueWithUnit({
  text,
  className,
}: { text: string; className: string }) {
  const lastSpace = text.lastIndexOf(" ");
  if (lastSpace === -1)
    return (
      <span className={`text-xl font-bold font-mono ${className}`}>{text}</span>
    );
  const value = text.slice(0, lastSpace);
  const unit = text.slice(lastSpace + 1);
  return (
    <span className={`font-mono ${className}`}>
      <span className="text-xl font-bold">{value}</span>
      <span className="text-sm font-semibold ml-0.5">{unit}</span>
    </span>
  );
}

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
      <div className="flex items-baseline justify-between flex-1 mr-4">
        <ValueWithUnit text={eta} className="text-cyan" />
        <ValueWithUnit
          text={formatDuration(remainingTime)}
          className="text-bone"
        />
        <ValueWithUnit
          text={formatDistance(remainingDistance)}
          className="text-blue-gray"
        />
      </div>
      <Button variant="destructive" onClick={clearRoute}>
        End
      </Button>
    </div>
  );
}
