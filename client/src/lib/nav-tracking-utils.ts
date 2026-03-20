import type { RouteInstruction } from "../types";
import { bearing } from "./geo-utils";

/**
 * Check if user should advance to the next instruction.
 * Uses dot product: positive means user has passed the current instruction
 * point in the direction of the next instruction.
 * Returns the new instruction index (unchanged if not advancing).
 */
export function shouldAdvanceInstruction(
  currentIndex: number,
  instructions: RouteInstruction[],
  userLat: number,
  userLng: number,
): number {
  if (currentIndex >= instructions.length - 1) return currentIndex;

  const cur = instructions[currentIndex].point;
  const nxt = instructions[currentIndex + 1].point;

  // Vector from current instruction point to next instruction point
  const routeDx = nxt[0] - cur[0];
  const routeDy = nxt[1] - cur[1];

  // Vector from current instruction point to user position
  const userDx = userLng - cur[0];
  const userDy = userLat - cur[1];

  // Dot product: positive means user is "past" the current point
  const dot = userDx * routeDx + userDy * routeDy;

  return dot > 0 ? currentIndex + 1 : currentIndex;
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
