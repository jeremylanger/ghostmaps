import { useState, useRef } from 'react'
import { useIsSignedIn, useEvmAddress, useSendUserOperation } from '@coinbase/cdp-hooks'
import { useAppStore } from '../store'
import { extractPhotoGPS, isNearLocation } from '../lib/exif'
import {
  encodeReviewData,
  buildAttestCalldata,
  hashPhoto,
  EAS_CONTRACT,
  REVIEW_SCHEMA_UID,
  EAS_NETWORK,
  EASSCAN_URL,
} from '../lib/eas'
import type { ReviewData } from '../lib/eas'
import type { EvmAddress } from '@coinbase/cdp-core'

interface QualityResult {
  score: number
  label: string
  flags: string[]
  reason: string
}

type ReviewStep = 'form' | 'scoring' | 'submitting' | 'success' | 'error'

export default function ReviewForm() {
  const place = useAppStore((s) => s.selectedPlace)!
  const setShowReviewForm = useAppStore((s) => s.setShowReviewForm)
  const { isSignedIn } = useIsSignedIn()
  const { evmAddress } = useEvmAddress()
  const { sendUserOperation } = useSendUserOperation()

  const [step, setStep] = useState<ReviewStep>('form')
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [text, setText] = useState('')
  const [whatOrdered, setWhatOrdered] = useState('')
  const [oneThingToKnow, setOneThingToKnow] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoLocation, setPhotoLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [photoNearPlace, setPhotoNearPlace] = useState<boolean | null>(null)
  const [quality, setQuality] = useState<QualityResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [txHash, setTxHash] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))

    // Extract EXIF GPS
    const gps = await extractPhotoGPS(file)
    setPhotoLocation(gps)

    if (gps) {
      const near = isNearLocation(gps, {
        latitude: place.latitude,
        longitude: place.longitude,
      })
      setPhotoNearPlace(near)
    } else {
      setPhotoNearPlace(null)
    }
  }

  const handleSubmit = async () => {
    if (rating === 0 || text.trim().length < 5) return

    try {
      // Step 1: Venice quality scoring
      setStep('scoring')
      const scoreRes = await fetch('/api/reviews/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          text,
          hasPhoto: !!photo,
          structuredResponses: {
            whatOrdered: whatOrdered || undefined,
            oneThingToKnow: oneThingToKnow || undefined,
          },
        }),
      })
      const qualityResult: QualityResult = await scoreRes.json()
      setQuality(qualityResult)

      // Check for critical flags
      if (qualityResult.flags.includes('sentiment_mismatch')) {
        setErrorMsg('Your rating and review text seem to contradict each other. Please adjust before submitting.')
        setStep('error')
        return
      }

      // Step 2: Upload photo and submit on-chain
      setStep('submitting')

      let photoHashStr = '0x0000000000000000000000000000000000000000000000000000000000000000'
      if (photo) {
        // Upload photo to server for retrieval, and get hash
        const photoBuffer = await photo.arrayBuffer()
        const uploadRes = await fetch('/api/photos', {
          method: 'POST',
          headers: { 'Content-Type': photo.type },
          body: photoBuffer,
        })
        if (uploadRes.ok) {
          const { hash } = await uploadRes.json()
          photoHashStr = hash
        } else {
          // Fallback to client-side hash if upload fails
          photoHashStr = await hashPhoto(photo)
        }
      }

      const reviewData: ReviewData = {
        rating,
        text: [text, whatOrdered && `Ordered: ${whatOrdered}`, oneThingToKnow && `Tip: ${oneThingToKnow}`]
          .filter(Boolean)
          .join(' | '),
        placeId: place.id,
        placeName: place.name,
        photoHash: photoHashStr,
        lat: Math.round(place.latitude * 1e6),
        lng: Math.round(place.longitude * 1e6),
        qualityScore: qualityResult.score,
      }

      const encodedData = encodeReviewData(reviewData)
      const calldata = buildAttestCalldata(REVIEW_SCHEMA_UID, encodedData)

      const result = await sendUserOperation({
        calls: [
          {
            to: EAS_CONTRACT as EvmAddress,
            data: calldata as `0x${string}`,
          },
        ],
        network: EAS_NETWORK,
        evmSmartAccount: evmAddress as EvmAddress,
        useCdpPaymaster: true,
      })

      setTxHash(result.userOperationHash)
      setStep('success')
    } catch (err) {
      console.error('Review submission error:', err)
      setErrorMsg(err instanceof Error ? err.message : 'Failed to submit review')
      setStep('error')
    }
  }

  if (!isSignedIn) {
    return (
      <div className="review-form-overlay">
        <div className="review-form">
          <div className="review-form-header">
            <h3>Write a Review</h3>
            <button className="review-form-close" onClick={() => setShowReviewForm(false)}>&times;</button>
          </div>
          <p className="review-form-signin-prompt">Sign in with your email to write a review.</p>
        </div>
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div className="review-form-overlay">
        <div className="review-form">
          <div className="review-form-header">
            <h3>Review Submitted!</h3>
            <button className="review-form-close" onClick={() => setShowReviewForm(false)}>&times;</button>
          </div>
          <div className="review-success">
            <div className="review-success-icon">&#10003;</div>
            <p>Your review for <strong>{place.name}</strong> is now on-chain.</p>
            {quality && (
              <div className={`quality-badge quality-${quality.label}`}>
                Quality: {quality.label} ({quality.score}/100)
              </div>
            )}
            <p className="review-success-detail">
              Permanently stored on Base. No one can delete, modify, or censor it.
            </p>
            {txHash && (
              <a
                href={`${EASSCAN_URL}/schema/view/${REVIEW_SCHEMA_UID}`}
                target="_blank"
                rel="noopener noreferrer"
                className="review-tx-link"
              >
                View on EAS Explorer
              </a>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div className="review-form-overlay">
        <div className="review-form">
          <div className="review-form-header">
            <h3>Something went wrong</h3>
            <button className="review-form-close" onClick={() => setShowReviewForm(false)}>&times;</button>
          </div>
          <p className="review-error-msg">{errorMsg}</p>
          <button className="review-btn" onClick={() => setStep('form')}>Try Again</button>
        </div>
      </div>
    )
  }

  if (step === 'scoring') {
    return (
      <div className="review-form-overlay">
        <div className="review-form">
          <div className="review-form-status">
            <div className="review-spinner" />
            <p>AI is evaluating your review quality...</p>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'submitting') {
    return (
      <div className="review-form-overlay">
        <div className="review-form">
          <div className="review-form-status">
            <div className="review-spinner" />
            <p>Submitting your review...</p>
            {quality && (
              <div className={`quality-badge quality-${quality.label}`}>
                Quality score: {quality.score}/100 ({quality.label})
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Main form
  return (
    <div className="review-form-overlay">
      <div className="review-form">
        <div className="review-form-header">
          <h3>Review {place.name}</h3>
          <button className="review-form-close" onClick={() => setShowReviewForm(false)}>&times;</button>
        </div>

        {/* Star rating */}
        <div className="review-stars">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              className={`review-star ${n <= (hoverRating || rating) ? 'active' : ''}`}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHoverRating(n)}
              onMouseLeave={() => setHoverRating(0)}
            >
              ★
            </button>
          ))}
        </div>

        {/* Review text */}
        <textarea
          className="review-textarea"
          placeholder="What was your experience like?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
        />

        {/* Structured prompts */}
        <input
          className="review-input"
          placeholder="What did you order? (optional)"
          value={whatOrdered}
          onChange={(e) => setWhatOrdered(e.target.value)}
        />
        <input
          className="review-input"
          placeholder="One thing future visitors should know? (optional)"
          value={oneThingToKnow}
          onChange={(e) => setOneThingToKnow(e.target.value)}
        />

        {/* Photo upload */}
        <div className="review-photo-section">
          <button
            className="review-photo-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            {photo ? 'Change Photo' : 'Add Photo (proof of visit)'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoChange}
            hidden
          />
          {photoPreview && (
            <div className="review-photo-preview">
              <img src={photoPreview} alt="Review photo" />
              {photoNearPlace === true && (
                <span className="photo-location-badge verified">Location verified</span>
              )}
              {photoNearPlace === false && (
                <span className="photo-location-badge unverified">Photo taken elsewhere</span>
              )}
              {photoLocation === null && photo && (
                <span className="photo-location-badge no-gps">No GPS in photo</span>
              )}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          className="review-submit-btn"
          onClick={handleSubmit}
          disabled={rating === 0 || text.trim().length < 5}
        >
          Submit Review
        </button>

        <p className="review-footnote">
          Your review will be permanently stored on Base. Free, no fees.
        </p>
      </div>
    </div>
  )
}
