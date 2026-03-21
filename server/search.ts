import type { Place } from "./types";

/** Haversine distance in meters. */
function haversine(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Add distanceMeters to each place based on user location. Preserves original order. */
export function addDistanceToResults(
  places: Place[],
  userLat: number,
  userLng: number,
): (Place & { distanceMeters: number })[] {
  return places.map((p) => ({
    ...p,
    distanceMeters: Math.round(
      haversine(userLat, userLng, p.latitude, p.longitude),
    ),
  }));
}

/** Parse raw coordinates from a string like "34.0522, -118.2437". */
export function parseCoordinates(
  query: string,
): { lat: number; lng: number } | null {
  const match = query.match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/);
  if (!match) return null;
  const lat = Number.parseFloat(match[1]);
  const lng = Number.parseFloat(match[2]);
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}
