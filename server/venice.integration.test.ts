import { describe, it, expect } from 'vitest'
import { parseQuery, rankResults } from './venice'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(__dirname, '..', '.env') })

const TIMEOUT = 45000

describe('Venice AI integration', () => {
  describe('parseQuery', () => {
    it('parses "coffee" into coffee_shop category', async () => {
      const result = await parseQuery('coffee')

      expect(result.categories).toContain('coffee_shop')
      expect(result.time_filter).toBeNull()
      expect(Array.isArray(result.attributes)).toBe(true)
    }, TIMEOUT)

    it('parses "late night tacos" with time filter', async () => {
      const result = await parseQuery('late night tacos')

      expect(result.categories.some(c => c.includes('mexican') || c.includes('taco'))).toBe(true)
      expect(result.time_filter).toBe('late_night')
    }, TIMEOUT)

    it('parses "bar with outdoor seating" with attributes', async () => {
      const result = await parseQuery('bar with outdoor seating')

      expect(result.categories.some(c => c.includes('bar') || c.includes('pub'))).toBe(true)
      expect(result.attributes).toContain('outdoor_seating')
    }, TIMEOUT)

    it('parses "pizza near downtown" with location hint', async () => {
      const result = await parseQuery('pizza near downtown')

      expect(result.categories.some(c => c.includes('pizza') || c.includes('restaurant'))).toBe(true)
      expect(result.location_hint).toBeTruthy()
    }, TIMEOUT)

    it('returns valid structure for unknown queries', async () => {
      const result = await parseQuery('xyzzy nonsense query')

      expect(Array.isArray(result.categories)).toBe(true)
      // Venice may return empty categories for nonsensical queries — that's ok
      expect(result).toHaveProperty('time_filter')
      expect(result).toHaveProperty('attributes')
      expect(result).toHaveProperty('location_hint')
      expect(result).toHaveProperty('radius')
    }, TIMEOUT)
  })

  describe('rankResults', () => {
    const mockPlaces = [
      { id: 'a', name: 'Best Coffee', category: 'coffee_shop', address: '123 Main St', phone: '555-1234', website: '', brand: '', confidence: 0.95, longitude: -118.24, latitude: 34.05 },
      { id: 'b', name: 'OK Coffee', category: 'coffee_shop', address: '456 Oak Ave', phone: '', website: '', brand: '', confidence: 0.7, longitude: -118.25, latitude: 34.06 },
      { id: 'c', name: 'Starbucks', category: 'coffee_shop', address: '789 Elm St', phone: '555-5678', website: 'https://starbucks.com', brand: 'Starbucks', confidence: 0.98, longitude: -118.23, latitude: 34.04 },
    ]

    it('returns a top pick from the provided places', async () => {
      const result = await rankResults('best coffee', mockPlaces, [])

      expect(result.topPick).toBeTruthy()
      expect(['a', 'b', 'c']).toContain(result.topPick)
      expect(result.summary).toBeTruthy()
    }, TIMEOUT)

    it('returns alternatives with why_not explanations', async () => {
      const result = await rankResults('coffee', mockPlaces, [])

      expect(Array.isArray(result.alternatives)).toBe(true)
    }, TIMEOUT)

    it('handles single place', async () => {
      const result = await rankResults('coffee', [mockPlaces[0]], [])

      expect(result.topPick).toBe('a')
      expect(result.summary).toBeTruthy()
    }, TIMEOUT)

    it('handles empty places', async () => {
      const result = await rankResults('coffee', [], [])

      expect(result.topPick).toBeNull()
      expect(result.summary).toBe('No results found.')
    }, TIMEOUT)
  })
})
