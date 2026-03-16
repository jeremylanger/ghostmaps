import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { searchOverture } from './search'
import { parseQuery, rankResults, generatePlaceBriefing } from './venice'
import { enrichPlace } from './google-places'
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
