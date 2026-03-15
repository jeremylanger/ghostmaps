import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { searchOverture } from './search'
import { parseQuery, rankResults } from './venice'

dotenv.config({ path: path.join(__dirname, '..', '.env') })

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Basic search (category mapping, no AI)
app.get('/api/search', async (req, res) => {
  try {
    const { q, lat, lng } = req.query as { q?: string; lat?: string; lng?: string }

    if (!q) {
      res.status(400).json({ error: 'Query parameter "q" is required' })
      return
    }

    const results = await searchOverture(q, lat, lng, process.env.OVERTURE_API_KEY)
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
    // Step 1: Parse query
    send('status', { message: 'Understanding your search...' })
    const parsed = await parseQuery(q)
    send('parsed', parsed)

    // Step 2: Search Overture
    send('status', { message: 'Finding places...' })
    const results = await searchOverture(
      parsed.categories[0],
      lat, lng,
      process.env.OVERTURE_API_KEY,
      parsed.categories,
      parsed.radius || undefined
    )
    send('results', results)

    if (results.length === 0) {
      send('done', {})
      res.end()
      return
    }

    // Step 3: Rank results (non-fatal if it fails)
    send('status', { message: 'Picking the best options...' })
    try {
      const ranking = await rankResults(q, results, parsed.attributes)
      send('ranking', ranking)
    } catch (err) {
      console.error('Ranking failed (non-fatal):', err)
      // Send results without ranking — still useful
    }

    send('done', {})
  } catch (err) {
    console.error('Stream error:', err)
    send('error', { message: 'Search failed. Please try again.' })
  }

  res.end()
})

// Place details
app.get('/api/places/:id', async (req, res) => {
  try {
    res.status(501).json({ error: 'Not implemented yet' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to get place details' })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
