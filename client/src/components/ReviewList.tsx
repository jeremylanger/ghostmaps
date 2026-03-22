import { useReviews } from "../hooks/useReviews";
import { EASSCAN_URL } from "../lib/eas";
import { isNearLocation } from "../lib/exif";
import {
  accountAgeLabel,
  isGpsVerified,
  parseReviewText,
  timeAgo,
} from "../lib/review-utils";
import { QUALITY_STYLES, qualityLabel } from "../lib/theme";
import type { OnChainReview, ReviewIdentity } from "../types";

function ReviewText({ text }: { text: string }) {
  const { body, ordered, tip } = parseReviewText(text);

  return (
    <div className="mb-1">
      <p className="text-sm text-bone leading-snug">{body}</p>
      {(ordered || tip) && (
        <div className="flex flex-col gap-1 mt-1.5">
          {ordered && (
            <span className="text-sm text-blue-gray">
              Ordered: <span className="text-bone">{ordered}</span>
            </span>
          )}
          {tip && (
            <span className="text-sm text-blue-gray">
              Tip: <span className="text-bone">{tip}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function ReviewCard({
  review,
  identity,
  placeLat,
  placeLng,
}: {
  review: OnChainReview;
  identity?: ReviewIdentity;
  placeLat: number;
  placeLng: number;
}) {
  const label = qualityLabel(review.qualityScore);
  const nearPlace =
    isGpsVerified(review.lat, review.lng) &&
    isNearLocation(
      { latitude: review.lat, longitude: review.lng },
      { latitude: placeLat, longitude: placeLng },
    );

  return (
    <div className="bg-surface-raised rounded-lg p-3 border border-edge/50">
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-1.5">
          {identity && (
            <span className="text-xs text-blue-gray">
              {accountAgeLabel(identity.firstSeen)}
              {identity.totalReviews > 1 &&
                ` · ${identity.totalReviews} reviews`}
            </span>
          )}
        </div>
        <span className="text-[11px] text-muted shrink-0">
          {timeAgo(review.time)}
        </span>
      </div>

      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-amber text-sm">
          {"★".repeat(review.rating)}
          {"☆".repeat(5 - review.rating)}
        </span>
        <span
          className={`text-[10px] font-semibold px-1.5 py-px rounded ${QUALITY_STYLES[label]}`}
        >
          {label} review depth
        </span>
        {nearPlace && (
          <span className="text-[10px] font-semibold px-1.5 py-px rounded bg-emerald-900/40 text-emerald-400">
            GPS Verified
          </span>
        )}
      </div>

      <ReviewText text={review.text} />

      {review.photoHash && (
        <img
          className="w-full max-h-[200px] object-cover rounded-md mb-1"
          src={`/api/photos/${review.photoHash}`}
          alt="Review photo"
          loading="lazy"
        />
      )}

      <a
        href={`${EASSCAN_URL}/attestation/view/${review.uid}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[11px] text-cyan no-underline hover:underline"
      >
        On-chain proof
      </a>
    </div>
  );
}

export default function ReviewList({
  placeId,
  placeLat,
  placeLng,
}: {
  placeId: string;
  placeLat: number;
  placeLng: number;
}) {
  const { data, isLoading, error } = useReviews(placeId);

  if (isLoading) {
    return (
      <div className="mt-4 px-6">
        <h3 className="text-base font-bold text-bone mb-2 font-display">
          Community Reviews
        </h3>
        <div className="flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="bg-surface-raised rounded-lg p-3 flex flex-col gap-2"
            >
              <div className="h-3 w-2/5 rounded-md bg-gradient-to-r from-edge via-edge-bright to-edge bg-[length:200%_100%] animate-shimmer" />
              <div className="h-3.5 w-[30%] rounded-md bg-gradient-to-r from-edge via-edge-bright to-edge bg-[length:200%_100%] animate-shimmer" />
              <div className="h-3 w-full rounded-md bg-gradient-to-r from-edge via-edge-bright to-edge bg-[length:200%_100%] animate-shimmer" />
              <div className="h-3 w-[70%] rounded-md bg-gradient-to-r from-edge via-edge-bright to-edge bg-[length:200%_100%] animate-shimmer" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) return null;

  const { reviews, identities, summary } = data;

  if (reviews.length === 0) {
    return (
      <div className="mt-4 px-6">
        <h3 className="text-base font-bold text-bone mb-2 font-display">
          Community Reviews
        </h3>
        <p className="text-sm text-muted">
          No reviews yet. Be the first to review this place!
        </p>
      </div>
    );
  }

  const sortedReviews = [...reviews].sort(
    (a, b) => b.qualityScore - a.qualityScore,
  );
  const avgRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div className="mt-4 px-6">
      <h3 className="text-base font-bold text-bone mb-2 font-display flex items-baseline gap-2">
        Community Reviews
        <span className="text-xs font-normal text-muted">
          {reviews.length} on-chain{" "}
          {reviews.length === 1 ? "review" : "reviews"}
        </span>
      </h3>

      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-amber text-sm">
          {"★".repeat(Math.round(avgRating))}
        </span>
        <span className="font-semibold text-sm text-bone">
          {avgRating.toFixed(1)}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan bg-cyan-muted px-1.5 py-0.5 rounded">
          Verified on Base
        </span>
      </div>

      {summary && (
        <div className="text-sm text-bone leading-relaxed p-2.5 bg-surface-raised rounded-lg border-l-2 border-l-cyan mb-2.5">
          {summary}
        </div>
      )}

      <div className="flex flex-col gap-2">
        {sortedReviews.map((review) => (
          <ReviewCard
            key={review.uid}
            review={review}
            identity={identities[review.attester]}
            placeLat={placeLat}
            placeLng={placeLng}
          />
        ))}
      </div>
    </div>
  );
}
