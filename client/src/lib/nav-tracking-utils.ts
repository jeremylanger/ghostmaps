import type { RouteInstruction } from "../types";
import { bearing, haversine } from "./geo-utils";

/** Maximum GPS accuracy (meters) to trust for instruction advancement. */
const MAX_ACCURACY_M = 50;

/** Maximum distance (meters) from an instruction point to consider "arrived." */
const ARRIVAL_RADIUS_M = 80;

/** Stop scanning instructions when user is farther than this from both points. */
const SCAN_ABORT_RADIUS_M = ARRIVAL_RADIUS_M * 3; // 240m

/** Snap to next instruction when user is within this distance of it. */
const SNAP_RADIUS_M = ARRIVAL_RADIUS_M / 2; // 40m

/**
 * Find the best matching instruction index by scanning forward from currentIndex.
 * Uses proximity + dot-product direction check. Never goes backwards.
 * Ignores GPS fixes with poor accuracy (>50m).
 */
export function findBestInstruction(
  currentIndex: number,
  instructions: RouteInstruction[],
  userLat: number,
  userLng: number,
  accuracy: number,
): number {
  if (accuracy > MAX_ACCURACY_M) return currentIndex;
  if (currentIndex >= instructions.length - 1) return currentIndex;

  let bestIndex = currentIndex;

  for (let i = currentIndex; i < instructions.length - 1; i++) {
    const cur = instructions[i].point; // [lng, lat]
    const nxt = instructions[i + 1].point;

    const distToPoint = haversine(userLat, userLng, cur[1], cur[0]);
    const distToNext = haversine(userLat, userLng, nxt[1], nxt[0]);

    // If user is far from both this point and the next, stop scanning
    if (distToPoint > SCAN_ABORT_RADIUS_M && distToNext > SCAN_ABORT_RADIUS_M)
      break;

    // Dot product: positive means user has passed this point in route direction
    const routeDx = nxt[0] - cur[0];
    const routeDy = nxt[1] - cur[1];
    const userDx = userLng - cur[0];
    const userDy = userLat - cur[1];
    const dot = userDx * routeDx + userDy * routeDy;

    // Advance if: within radius AND past the point, OR very close to next point
    if (
      (distToPoint <= ARRIVAL_RADIUS_M && dot > 0) ||
      distToNext <= SNAP_RADIUS_M
    ) {
      bestIndex = i + 1;
    }
  }

  return bestIndex;
}

/**
 * Check if user's movement direction diverges from the route segment direction.
 * Returns true if user is heading >60° away from the route (likely on wrong road).
 * Returns true if no previous position is available (assume off-route).
 */
export function isMovingAwayFromRoute(
  loc: { lat: number; lng: number },
  prevLoc: { lat: number; lng: number } | null,
  coordinates: [number, number][],
  closestSegIdx: number,
): boolean {
  if (!prevLoc) return true;

  // User's travel bearing
  const userBearing = bearing(prevLoc.lat, prevLoc.lng, loc.lat, loc.lng);

  // Route segment bearing
  const [lng1, lat1] = coordinates[closestSegIdx];
  const [lng2, lat2] =
    coordinates[Math.min(closestSegIdx + 1, coordinates.length - 1)];
  const routeBearing = bearing(lat1, lng1, lat2, lng2);

  // Angle difference (0-180)
  let diff = Math.abs(userBearing - routeBearing);
  if (diff > 180) diff = 360 - diff;

  return diff > 60;
}
