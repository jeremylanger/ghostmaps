import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { searchOverture } from './search'

dotenv.config({ path: path.join(__dirname, '..', '.env') })

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

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
