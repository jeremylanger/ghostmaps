const R = 6371000; // Earth radius in meters

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversine(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function bearing(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLng = toRad(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/** Project a point onto a line segment and return the projected [lng, lat]. */
function projectOntoSegment(
  lat: number,
  lng: number,
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): [number, number] {
  const dx = lng2 - lng1;
  const dy = lat2 - lat1;
  if (dx === 0 && dy === 0) return [lng1, lat1];
  let t = ((lng - lng1) * dx + (lat - lat1) * dy) / (dx * dx + dy * dy);
  t = Math.max(0, Math.min(1, t));
  return [lng1 + t * dx, lat1 + t * dy];
}

/** Distance in meters from a point to the nearest point on a line segment. */
function distanceToSegment(
  lat: number,
  lng: number,
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const [pLng, pLat] = projectOntoSegment(lat, lng, lat1, lng1, lat2, lng2);
  return haversine(lat, lng, pLat, pLng);
}

/** Find the closest segment on a route to a given position. */
export function closestSegmentOnRoute(
  lat: number,
  lng: number,
  coordinates: [number, number][],
): { index: number; distance: number } {
  let minDist = Infinity;
  let minIdx = 0;

  for (let i = 0; i < coordinates.length - 1; i++) {
    const [lng1, lat1] = coordinates[i];
    const [lng2, lat2] = coordinates[i + 1];
    const d = distanceToSegment(lat, lng, lat1, lng1, lat2, lng2);
    if (d < minDist) {
      minDist = d;
      minIdx = i;
    }
  }

  return { index: minIdx, distance: minDist };
}

/** Return route coordinates from the user's projected position forward. */
export function trimRouteAhead(
  coordinates: [number, number][],
  segmentIndex: number,
  userLng: number,
  userLat: number,
): [number, number][] {
  if (segmentIndex >= coordinates.length - 1) {
    return [coordinates[coordinates.length - 1]];
  }
  const [sLng, sLat] = coordinates[segmentIndex];
  const [eLng, eLat] = coordinates[segmentIndex + 1];
  const projected = projectOntoSegment(
    userLat,
    userLng,
    sLat,
    sLng,
    eLat,
    eLng,
  );
  return [projected, ...coordinates.slice(segmentIndex + 1)];
}

export function formatDistanceLive(meters: number): string {
  const miles = meters / 1609.34;
  if (miles < 0.1) return `${Math.round(meters * 3.281)} ft`;
  return `${miles.toFixed(1)} mi`;
}
