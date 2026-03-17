import { useReviews } from '../hooks/useReviews'
import { EASSCAN_URL } from '../lib/eas'
import type { OnChainReview, ReviewIdentity } from '../types'

function qualityLabel(score: number): string {
  if (score >= 81) return 'exceptional'
  if (score >= 51) return 'detailed'
  if (score >= 21) return 'decent'
  return 'generic'
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`
  return `${Math.floor(seconds / 2592000)}mo ago`
}

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

function accountAgeLabel(firstSeen: number): string {
  if (!firstSeen) return 'New'
  const days = Math.floor((Date.now() / 1000 - firstSeen) / 86400)
  if (days < 1) return 'New today'
  if (days < 7) return `${days}d old`
  if (days < 30) return `${Math.floor(days / 7)}w old`
  return `${Math.floor(days / 30)}mo old`
}

function ReviewCard({ review, identity }: { review: OnChainReview; identity?: ReviewIdentity }) {
  const label = qualityLabel(review.qualityScore)

  return (
    <div className="review-card">
      <div className="review-card-header">
        <div className="review-card-identity">
          <span className="review-card-address">{truncateAddress(review.attester)}</span>
          {identity && (
            <span className="review-card-account-age">
              {accountAgeLabel(identity.firstSeen)}
              {identity.totalReviews > 1 && ` \u00b7 ${identity.totalReviews} reviews`}
            </span>
          )}
        </div>
        <span className="review-card-time">{timeAgo(review.time)}</span>
      </div>

      <div className="review-card-rating">
        <span className="rating-stars">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
        <span className={`quality-badge-sm quality-${label}`}>{label}</span>
      </div>

      <p className="review-card-text">{review.text}</p>

      {review.photoHash && (
        <img
          className="review-card-photo"
          src={`/api/photos/${review.photoHash}`}
          alt="Review photo"
          loading="lazy"
        />
      )}

      <a
        href={`${EASSCAN_URL}/attestation/view/${review.uid}`}
        target="_blank"
        rel="noopener noreferrer"
        className="review-card-proof"
      >
        On-chain proof
      </a>
    </div>
  )
}

export default function ReviewList({ placeId }: { placeId: string }) {
  const { data, isLoading, error } = useReviews(placeId)

  if (isLoading) {
    return (
      <div className="reviews-section">
        <h3 className="reviews-heading">Community Reviews</h3>
        <div className="reviews-loading">Loading on-chain reviews...</div>
      </div>
    )
  }

  if (error || !data) return null

  const { reviews, identities, summary } = data

  if (reviews.length === 0) {
    return (
      <div className="reviews-section">
        <h3 className="reviews-heading">Community Reviews</h3>
        <p className="reviews-empty">No reviews yet. Be the first to review this place!</p>
      </div>
    )
  }

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

  return (
    <div className="reviews-section">
      <h3 className="reviews-heading">
        Community Reviews
        <span className="reviews-count">
          {reviews.length} on-chain {reviews.length === 1 ? 'review' : 'reviews'}
        </span>
      </h3>

      <div className="reviews-aggregate">
        <span className="rating-stars">{'★'.repeat(Math.round(avgRating))}</span>
        <span className="reviews-avg">{avgRating.toFixed(1)}</span>
        <span className="reviews-chain-badge">Verified on Base</span>
      </div>

      {summary && (
        <div className="reviews-summary">{summary}</div>
      )}

      <div className="reviews-list">
        {reviews.map((review) => (
          <ReviewCard
            key={review.uid}
            review={review}
            identity={identities[review.attester]}
          />
        ))}
      </div>
    </div>
  )
}
