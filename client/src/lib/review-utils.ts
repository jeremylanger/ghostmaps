/** Pure logic helpers for review display — extracted for testability. */

/** Parse review text that uses " | " delimiters for structured fields. */
export function parseReviewText(text: string): {
  body: string;
  ordered: string | undefined;
  tip: string | undefined;
} {
  const parts = text.split(" | ");
  const body = parts[0];
  const ordered = parts.find((p) => p.startsWith("Ordered: "))?.slice(9);
  const tip = parts.find((p) => p.startsWith("Tip: "))?.slice(5);
  return { body, ordered, tip };
}

/** Build the review data object for on-chain submission. */
export function buildReviewData(input: {
  rating: number;
  text: string;
  whatOrdered: string;
  oneThingToKnow: string;
  placeId: string;
  placeName: string;
  photoHash: string;
  photoGPS: { lat: number; lng: number } | null;
  qualityScore: number;
}) {
  return {
    rating: input.rating,
    text: [
      input.text,
      input.whatOrdered && `Ordered: ${input.whatOrdered}`,
      input.oneThingToKnow && `Tip: ${input.oneThingToKnow}`,
    ]
      .filter(Boolean)
      .join(" | "),
    placeId: input.placeId,
    placeName: input.placeName,
    photoHash: input.photoHash,
    lat: input.photoGPS ? Math.round(input.photoGPS.lat * 1e6) : 0,
    lng: input.photoGPS ? Math.round(input.photoGPS.lng * 1e6) : 0,
    qualityScore: input.qualityScore,
  };
}

/** Returns true when a review has non-zero GPS coordinates. */
export function isGpsVerified(lat: number, lng: number): boolean {
  return lat !== 0 && lng !== 0;
}

/** Human-friendly relative timestamp from a Unix epoch (seconds). */
export function timeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 2592000)}mo ago`;
}

/** Display label for how old an account is based on firstSeen (Unix seconds). */
export function accountAgeLabel(firstSeen: number): string {
  if (!firstSeen) return "New";
  const days = Math.floor((Date.now() / 1000 - firstSeen) / 86400);
  if (days < 1) return "New today";
  if (days < 7) return `${days}d old`;
  if (days < 30) return `${Math.floor(days / 7)}w old`;
  return `${Math.floor(days / 30)}mo old`;
}
