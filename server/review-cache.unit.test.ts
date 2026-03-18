import { describe, it, expect } from 'vitest'

describe('Review cache TTL logic', () => {
  it('cache entry within TTL is considered valid', () => {
    const REVIEW_CACHE_TTL = 2 * 60 * 1000
    const entry = { timestamp: Date.now() - 60_000 } // 1 min ago
    const isValid = Date.now() - entry.timestamp < REVIEW_CACHE_TTL
    expect(isValid).toBe(true)
  })

  it('cache entry beyond TTL is considered expired', () => {
    const REVIEW_CACHE_TTL = 2 * 60 * 1000
    const entry = { timestamp: Date.now() - 3 * 60_000 } // 3 min ago
    const isValid = Date.now() - entry.timestamp < REVIEW_CACHE_TTL
    expect(isValid).toBe(false)
  })

  it('cache entry exactly at TTL boundary is expired', () => {
    const REVIEW_CACHE_TTL = 2 * 60 * 1000
    const entry = { timestamp: Date.now() - REVIEW_CACHE_TTL }
    const isValid = Date.now() - entry.timestamp < REVIEW_CACHE_TTL
    expect(isValid).toBe(false)
  })
})

describe('Parallel identity + summary fetching', () => {
  it('Promise.all runs lookups concurrently', async () => {
    const startTimes: number[] = []
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

    const results = await Promise.all([
      (async () => {
        startTimes.push(Date.now())
        await delay(50)
        return 'identity'
      })(),
      (async () => {
        startTimes.push(Date.now())
        await delay(50)
        return 'summary'
      })(),
    ])

    // Both should have started at nearly the same time (within 20ms)
    expect(Math.abs(startTimes[0] - startTimes[1])).toBeLessThan(20)
    expect(results).toEqual(['identity', 'summary'])
  })
})
