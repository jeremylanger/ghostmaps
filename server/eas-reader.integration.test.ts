import { describe, it, expect } from 'vitest'
import { fetchReviewsForPlace, fetchAccountAge } from './eas-reader'

const REVIEW_SCHEMA_UID = '0x968e91f0274b78a31037839b55e59b942dd1521daebf9190268137e450b7d69f'
const EAS_GRAPHQL = 'https://base-sepolia.easscan.org/graphql'

describe('EAS Reader Integration (Base Sepolia)', () => {
  it('should fetch reviews and return valid OnChainReview objects', async () => {
    // First, get any attestation to find a placeId that exists
    const res = await fetch(EAS_GRAPHQL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query { attestations(where: { schemaId: { equals: "${REVIEW_SCHEMA_UID}" } }, take: 1, orderBy: [{ time: desc }]) { decodedDataJson } }`,
      }),
    })
    const data = await res.json()
    const attestation = data.data?.attestations?.[0]

    if (!attestation) {
      console.log('No attestations found — skipping review fetch test')
      return
    }

    const decoded = JSON.parse(attestation.decodedDataJson)
    const placeId = decoded.find((f: { name: string }) => f.name === 'placeId')?.value?.value

    expect(placeId).toBeTruthy()

    // Now fetch reviews for that placeId
    const reviews = await fetchReviewsForPlace(placeId)
    expect(reviews.length).toBeGreaterThanOrEqual(1)

    const review = reviews[0]
    expect(review.uid).toMatch(/^0x[0-9a-f]{64}$/i)
    expect(review.attester).toMatch(/^0x[0-9a-fA-F]{40}$/)
    expect(review.rating).toBeGreaterThanOrEqual(1)
    expect(review.rating).toBeLessThanOrEqual(5)
    expect(review.text.length).toBeGreaterThan(0)
    expect(review.placeId).toBe(placeId)
    expect(review.qualityScore).toBeGreaterThanOrEqual(0)
    expect(review.qualityScore).toBeLessThanOrEqual(100)
    expect(review.time).toBeGreaterThan(0)
  })

  it('should return empty array for a non-existent placeId', async () => {
    const reviews = await fetchReviewsForPlace('nonexistent-place-id-12345')
    expect(reviews).toEqual([])
  })

  it('should fetch account age for a known attester', async () => {
    // Get any attester address
    const res = await fetch(EAS_GRAPHQL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query { attestations(where: { schemaId: { equals: "${REVIEW_SCHEMA_UID}" } }, take: 1) { attester } }`,
      }),
    })
    const data = await res.json()
    const attester = data.data?.attestations?.[0]?.attester

    if (!attester) {
      console.log('No attestations found — skipping account age test')
      return
    }

    const age = await fetchAccountAge(attester)
    expect(age.firstSeen).toBeGreaterThan(0)
    expect(age.totalReviews).toBeGreaterThanOrEqual(1)
  })

  it('should return zero values for unknown attester', async () => {
    const age = await fetchAccountAge('0x0000000000000000000000000000000000000001')
    expect(age.firstSeen).toBe(0)
    expect(age.totalReviews).toBe(0)
  })
})
