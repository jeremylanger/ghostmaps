import exifr from "exifr";
import { haversine } from "./geo-utils";

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
  return (
    haversine(
      photo.latitude,
      photo.longitude,
      target.latitude,
      target.longitude,
    ) <= radiusMeters
  );
}
