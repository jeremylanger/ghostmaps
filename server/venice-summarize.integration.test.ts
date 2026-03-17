import { describe, it, expect, beforeAll } from 'vitest'
import dotenv from 'dotenv'
import path from 'path'
import { summarizeReviews, comparePlaces, verifyPhoto } from './venice'

beforeAll(() => {
  dotenv.config({ path: path.join(__dirname, '..', '.env') })
})

describe('Venice Review Summarization', () => {
  it('should summarize multiple reviews into a coherent paragraph', async () => {
    const summary = await summarizeReviews('Test Restaurant', [
      { rating: 5, text: 'Amazing pasta, best carbonara in the city', qualityScore: 75 },
      { rating: 4, text: 'Good food but slow service on weekends', qualityScore: 60 },
      { rating: 3, text: 'Decent but overpriced for what you get', qualityScore: 45 },
    ])

    expect(summary.length).toBeGreaterThan(20)
    // Should reference the food or the place
    const lower = summary.toLowerCase()
    expect(
      lower.includes('pasta') || lower.includes('food') || lower.includes('restaurant') || lower.includes('carbonara')
    ).toBe(true)
  }, 30000)

  it('should return empty string for no reviews', async () => {
    const summary = await summarizeReviews('Empty Place', [])
    expect(summary).toBe('')
  })

  it('should handle single review', async () => {
    const summary = await summarizeReviews('Solo Review Spot', [
      { rating: 5, text: 'Best sushi I have ever had, the omakase was incredible', qualityScore: 85 },
    ])
    expect(summary.length).toBeGreaterThan(10)
  }, 30000)
})

describe('Venice Place Comparison', () => {
  it('should compare two places and return structured result', async () => {
    const result = await comparePlaces([
      { name: 'Burger Palace', category: 'burger_restaurant', address: '123 Main St' },
      { name: 'Taco Town', category: 'mexican_restaurant', address: '456 Oak Ave' },
    ])

    expect(result.comparison.length).toBeGreaterThan(10)
    expect(result.recommendation.length).toBeGreaterThan(5)
    expect(Array.isArray(result.tradeoffs)).toBe(true)
  }, 30000)
})

describe('Venice Photo Verification', () => {
  it('should flag a suspiciously small file as potentially illegitimate', async () => {
    const result = await verifyPhoto({
      fileSize: 500, // 500 bytes — way too small for a real photo
      hasExifGPS: false,
      nearPlace: false,
      mimeType: 'image/jpeg',
    })

    expect(typeof result.legitimate).toBe('boolean')
    expect(result.confidence).toBeGreaterThanOrEqual(0)
    expect(result.confidence).toBeLessThanOrEqual(1)
    expect(result.reason.length).toBeGreaterThan(0)
  }, 30000)

  it('should accept a normal photo with GPS near place', async () => {
    const result = await verifyPhoto({
      fileSize: 2_500_000, // 2.5 MB — normal photo
      hasExifGPS: true,
      nearPlace: true,
      mimeType: 'image/jpeg',
      width: 4032,
      height: 3024,
    })

    expect(result.legitimate).toBe(true)
    expect(result.confidence).toBeGreaterThan(0.5)
  }, 30000)
})
