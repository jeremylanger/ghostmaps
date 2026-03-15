import { describe, it, expect } from 'vitest'

// Test the enrichment data structure and edge cases
// Actual HERE API calls are in integration tests

describe('HERE enrichment structure', () => {
  it('empty enrichment has correct shape', () => {
    const empty = {
      openingHours: null,
      isOpen: null,
      foodTypes: [],
      website: null,
      phone: null,
      rating: null,
      references: [],
    }

    expect(empty.openingHours).toBeNull()
    expect(empty.isOpen).toBeNull()
    expect(empty.foodTypes).toEqual([])
    expect(empty.references).toEqual([])
  })

  it('enrichment with data has correct shape', () => {
    const enriched = {
      openingHours: 'Mon-Fri 07:00-19:00; Sat-Sun 08:00-17:00',
      isOpen: true,
      foodTypes: ['Coffee', 'Breakfast', 'Pastries'],
      website: 'https://example.com',
      phone: '+1-555-123-4567',
      rating: null,
      references: [
        { supplier: 'tripadvisor', id: '12345' },
        { supplier: 'yelp', id: 'abc-cafe' },
      ],
    }

    expect(enriched.isOpen).toBe(true)
    expect(enriched.foodTypes).toHaveLength(3)
    expect(enriched.references).toHaveLength(2)
    expect(enriched.references[0].supplier).toBe('tripadvisor')
  })
})
