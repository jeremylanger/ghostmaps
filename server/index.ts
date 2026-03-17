import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { searchOverture } from './search'
import { parseQuery, rankResults, generatePlaceBriefing, scoreReviewQuality, summarizeReviews, comparePlaces } from './venice'
import { enrichPlace } from './google-places'
import { fetchReviewsForPlace, fetchAccountAge } from './eas-reader'
import { storePhoto, getPhotoPath } from './photos'
import type { Place } from './types'

dotenv.config({ path: path.join(__dirname, '..', '.env') })

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// In-memory place cache (search results are ephemeral, this lets us look up by ID)
const placeCache = new Map<string, Place>()

function cachePlaces(places: Place[]) {
  for (const p of places) placeCache.set(p.id, p)
}

// Basic search (category mapping, no AI)
app.get('/api/search', async (req, res) => {
  try {
    const { q, lat, lng } = req.query as { q?: string; lat?: string; lng?: string }

    if (!q) {
      res.status(400).json({ error: 'Query parameter "q" is required' })
      return
    }

    const results = await searchOverture(q, lat, lng, process.env.OVERTURE_API_KEY)
    cachePlaces(results)
    res.json({ results })
  } catch (err) {
    console.error('Search error:', err)
    res.status(500).json({ error: 'Search failed' })
  }
})

// AI-powered search (non-streaming)
app.get('/api/ai-search', async (req, res) => {
  try {
    const { q, lat, lng } = req.query as { q?: string; lat?: string; lng?: string }

    if (!q) {
      res.status(400).json({ error: 'Query parameter "q" is required' })
      return
    }

    console.log(`AI search: "${q}"`)

    const parsed = await parseQuery(q)
    console.log('Parsed:', parsed)

    const results = await searchOverture(
      parsed.categories[0],
      lat, lng,
      process.env.OVERTURE_API_KEY,
      parsed.categories,
      parsed.radius || undefined
    )
    cachePlaces(results)

    const ranking = await rankResults(q, results, parsed.attributes)

    res.json({ results, ranking, parsed })
  } catch (err) {
    console.error('AI search error:', err)
    res.status(500).json({ error: 'AI search failed' })
  }
})

// SSE streaming AI search
app.get('/api/ai-search/stream', async (req, res) => {
  const { q, lat, lng } = req.query as { q?: string; lat?: string; lng?: string }

  if (!q) {
    res.status(400).json({ error: 'Query parameter "q" is required' })
    return
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  })

  const send = (event: string, data: unknown) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
  }

  try {
    send('status', { message: 'Understanding your search...' })
    const parsed = await parseQuery(q)
    send('parsed', parsed)

    send('status', { message: 'Finding places...' })
    const results = await searchOverture(
      parsed.categories[0],
      lat, lng,
      process.env.OVERTURE_API_KEY,
      parsed.categories,
      parsed.radius || undefined
    )
    cachePlaces(results)
    send('results', results)

    if (results.length === 0) {
      send('done', {})
      res.end()
      return
    }

    send('status', { message: 'Picking the best options...' })
    try {
      const ranking = await rankResults(q, results, parsed.attributes)
      send('ranking', ranking)
    } catch (err) {
      console.error('Ranking failed (non-fatal):', err)
    }

    send('done', {})
  } catch (err) {
    console.error('Stream error:', err)
    send('error', { message: 'Search failed. Please try again.' })
  }

  res.end()
})

// Place details with enrichment
app.get('/api/places/:id', async (req, res) => {
  try {
    const { id } = req.params
    const place = placeCache.get(id)

    if (!place) {
      res.status(404).json({ error: 'Place not found. Search first.' })
      return
    }

    // Enrich with Google Places data if API key available
    let enrichment = null
    const googleKey = process.env.GOOGLE_PLACES_API_KEY
    if (googleKey) {
      enrichment = await enrichPlace(place, googleKey)
    }

    // Generate Venice briefing with all available data
    let briefing = ''
    try {
      briefing = await generatePlaceBriefing({
        name: place.name,
        category: place.category,
        address: place.address,
        phone: enrichment?.phone || place.phone,
        website: enrichment?.website || place.website,
        brand: place.brand,
        openingHours: enrichment?.openingHours || null,
        isOpen: enrichment?.isOpen ?? null,
        foodTypes: enrichment?.foodTypes || [],
      })
    } catch (err) {
      console.error('Briefing failed (non-fatal):', err)
    }

    res.json({
      ...place,
      phone: enrichment?.phone || place.phone,
      website: enrichment?.website || place.website,
      openingHours: enrichment?.openingHours || null,
      isOpen: enrichment?.isOpen ?? null,
      foodTypes: enrichment?.foodTypes || [],
      rating: enrichment?.rating ?? null,
      reviewCount: enrichment?.reviewCount ?? null,
      priceLevel: enrichment?.priceLevel ?? null,
      dineIn: enrichment?.dineIn ?? null,
      takeout: enrichment?.takeout ?? null,
      delivery: enrichment?.delivery ?? null,
      wheelchairAccessible: enrichment?.wheelchairAccessible ?? null,
      photoUri: enrichment?.photoUri ?? null,
      briefing,
    })
  } catch (err) {
    console.error('Place detail error:', err)
    res.status(500).json({ error: 'Failed to get place details' })
  }
})

// Review quality scoring
app.post('/api/reviews/score', async (req, res) => {
  try {
    const { rating, text, hasPhoto, structuredResponses } = req.body

    if (!rating || !text) {
      res.status(400).json({ error: 'Rating and text are required' })
      return
    }

    const result = await scoreReviewQuality({ rating, text, hasPhoto, structuredResponses })
    res.json(result)
  } catch (err) {
    console.error('Review scoring error:', err)
    res.status(500).json({ error: 'Failed to score review' })
  }
})

// Upload a review photo (returns SHA-256 hash)
app.post('/api/photos', express.raw({ type: 'image/*', limit: '10mb' }), (req, res) => {
  try {
    const contentType = req.headers['content-type'] || 'image/jpeg'
    const hash = storePhoto(req.body, contentType)
    res.json({ hash })
  } catch (err) {
    console.error('Photo upload error:', err)
    res.status(500).json({ error: 'Failed to upload photo' })
  }
})

// Serve a review photo by hash
app.get('/api/photos/:hash', (req, res) => {
  const filepath = getPhotoPath(req.params.hash)
  if (!filepath) {
    res.status(404).json({ error: 'Photo not found' })
    return
  }
  res.sendFile(filepath)
})

// Fetch on-chain reviews for a place
app.get('/api/reviews/:placeId', async (req, res) => {
  try {
    const { placeId } = req.params
    const reviews = await fetchReviewsForPlace(placeId)

    // Fetch account age for each unique attester
    const attesters = [...new Set(reviews.map((r) => r.attester))]
    const identities: Record<string, { firstSeen: number; totalReviews: number }> = {}
    await Promise.all(
      attesters.map(async (addr) => {
        try {
          identities[addr] = await fetchAccountAge(addr)
        } catch {
          identities[addr] = { firstSeen: 0, totalReviews: 0 }
        }
      })
    )

    // Generate Venice summary if there are reviews
    let summary = ''
    if (reviews.length > 0) {
      const place = placeCache.get(placeId)
      try {
        summary = await summarizeReviews(
          place?.name || reviews[0].placeName,
          reviews.map((r) => ({ rating: r.rating, text: r.text, qualityScore: r.qualityScore }))
        )
      } catch (err) {
        console.error('Review summarization failed (non-fatal):', err)
      }
    }

    res.json({ reviews, identities, summary })
  } catch (err) {
    console.error('Review fetch error:', err)
    res.status(500).json({ error: 'Failed to fetch reviews' })
  }
})

// Compare places
app.post('/api/compare', async (req, res) => {
  try {
    const { placeIds } = req.body as { placeIds: string[] }

    if (!placeIds || placeIds.length < 2 || placeIds.length > 5) {
      res.status(400).json({ error: 'Provide 2-5 place IDs to compare' })
      return
    }

    const places = placeIds
      .map((id) => placeCache.get(id))
      .filter((p): p is Place => !!p)

    if (places.length < 2) {
      res.status(400).json({ error: 'Not enough places found in cache. Search first.' })
      return
    }

    // Fetch reviews for each place
    const placesWithReviews = await Promise.all(
      places.map(async (p) => {
        try {
          const reviews = await fetchReviewsForPlace(p.id)
          return {
            name: p.name,
            category: p.category,
            address: p.address,
            reviews: reviews.map((r) => ({ rating: r.rating, text: r.text })),
          }
        } catch {
          return { name: p.name, category: p.category, address: p.address }
        }
      })
    )

    const result = await comparePlaces(placesWithReviews)
    res.json(result)
  } catch (err) {
    console.error('Compare error:', err)
    res.status(500).json({ error: 'Failed to compare places' })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
