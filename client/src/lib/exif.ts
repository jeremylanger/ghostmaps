import exifr from "exifr";

export interface PhotoLocation {
  latitude: number;
  longitude: number;
}

/** Extract GPS coordinates from a photo's EXIF data. Returns null if no GPS. */
export async function extractPhotoGPS(
  file: File,
): Promise<PhotoLocation | null> {
  try {
    const gps = await exifr.gps(file);
    if (
      gps &&
      typeof gps.latitude === "number" &&
      typeof gps.longitude === "number"
    ) {
      return { latitude: gps.latitude, longitude: gps.longitude };
    }
    return null;
  } catch {
    return null;
  }
}

/** Check if photo GPS is within a given radius (meters) of a target location */
export function isNearLocation(
  photo: PhotoLocation,
  target: { latitude: number; longitude: number },
  radiusMeters = 200,
): boolean {
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(target.latitude - photo.latitude);
  const dLng = toRad(target.longitude - photo.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(photo.latitude)) *
      Math.cos(toRad(target.latitude)) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c <= radiusMeters;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
