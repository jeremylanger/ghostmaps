const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const path = require('path')

dotenv.config({ path: path.join(__dirname, '..', '.env') })

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Common query-to-category mappings
const CATEGORY_MAP = {
  // Food & Drink
  restaurant: 'restaurant',
  restaurants: 'restaurant',
  food: 'restaurant',
  eat: 'restaurant',
  dining: 'restaurant',
  pizza: 'pizza_restaurant',
  burger: 'burger_restaurant',
  burgers: 'burger_restaurant',
  sushi: 'sushi_restaurant',
  chinese: 'chinese_restaurant',
  mexican: 'mexican_restaurant',
  italian: 'italian_restaurant',
  indian: 'indian_restaurant',
  thai: 'thai_restaurant',
  japanese: 'japanese_restaurant',
  korean: 'korean_restaurant',
  vietnamese: 'vietnamese_restaurant',
  tacos: 'mexican_restaurant',
  ramen: 'ramen_restaurant',
  seafood: 'seafood_restaurant',
  bbq: 'barbecue_restaurant',
  barbecue: 'barbecue_restaurant',
  steakhouse: 'steakhouse',
  steak: 'steakhouse',
  breakfast: 'breakfast_restaurant',
  brunch: 'breakfast_restaurant',
  cafe: 'cafe',
  coffee: 'coffee_shop',
  'coffee shop': 'coffee_shop',
  bakery: 'bakery',
  bar: 'bar',
  bars: 'bar',
  pub: 'pub',
  brewery: 'brewery',
  'ice cream': 'ice_cream_shop',
  dessert: 'dessert_shop',
  juice: 'juice_bar',
  tea: 'tea_house',
  // Shopping
  grocery: 'grocery_store',
  groceries: 'grocery_store',
  supermarket: 'supermarket',
  pharmacy: 'pharmacy',
  bookstore: 'bookstore',
  clothing: 'clothing_store',
  shoes: 'shoe_store',
  electronics: 'electronics_store',
  mall: 'shopping_mall',
  // Services
  gas: 'gas_station',
  'gas station': 'gas_station',
  bank: 'bank',
  atm: 'atm',
  hospital: 'hospital',
  doctor: 'doctor',
  dentist: 'dentist',
  gym: 'gym',
  salon: 'hair_salon',
  'hair salon': 'hair_salon',
  laundry: 'laundromat',
  parking: 'parking',
  hotel: 'hotel',
  hotels: 'hotel',
  motel: 'motel',
  // Entertainment
  park: 'park',
  parks: 'park',
  museum: 'museum',
  theater: 'movie_theater',
  cinema: 'movie_theater',
  movies: 'movie_theater',
  library: 'library',
  nightclub: 'nightclub',
  club: 'nightclub',
  spa: 'spa',
}

function queryToCategories(query) {
  const lower = query.toLowerCase().trim()

  // Direct match
  if (CATEGORY_MAP[lower]) return [CATEGORY_MAP[lower]]

  // Check if query contains any mapped terms
  const matches = []
  for (const [term, category] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(term) && !matches.includes(category)) {
      matches.push(category)
    }
  }

  // Return matches, or fallback to using the query as a category directly
  return matches.length > 0 ? matches.slice(0, 3) : [lower.replace(/\s+/g, '_')]
}

// Search endpoint
app.get('/api/search', async (req, res) => {
  try {
    const { q, lat, lng } = req.query

    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' })
    }

    const results = await searchOverture(q, lat, lng)
    res.json({ results })
  } catch (err) {
    console.error('Search error:', err)
    res.status(500).json({ error: 'Search failed' })
  }
})

// Place details
app.get('/api/places/:id', async (req, res) => {
  try {
    const { id } = req.params
    // For now, return from search cache or re-fetch
    res.status(501).json({ error: 'Not implemented yet' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to get place details' })
  }
})

async function searchOverture(query, lat, lng) {
  const categories = queryToCategories(query)

  const params = new URLSearchParams()
  params.set('lat', lat || '34.0522')
  params.set('lng', lng || '-118.2437')
  params.set('radius', '5000')
  params.set('categories', categories.join(','))
  params.set('min_confidence', '0.5')
  params.set('limit', '20')
  params.set('format', 'json')

  const url = `https://api.overturemapsapi.com/places?${params}`
  console.log('Overture search:', url)

  const response = await fetch(url, {
    headers: {
      'x-api-key': process.env.OVERTURE_API_KEY || 'DEMO-API-KEY',
    },
  })

  if (!response.ok) {
    const text = await response.text()
    console.error('Overture API error:', response.status, text)
    throw new Error(`Overture API error: ${response.status}`)
  }

  const data = await response.json()

  // API returns a bare array in json format
  const places = Array.isArray(data) ? data : (data.features || [])

  return places.map(formatPlace).slice(0, 20)
}

function formatPlace(item) {
  // Handle both raw array format and GeoJSON
  const props = item.properties || item
  const coords = item.geometry?.coordinates || [props.longitude || 0, props.latitude || 0]

  // Extract address
  let address = ''
  const addrs = props.addresses || []
  if (addrs.length > 0) {
    const addr = addrs[0]
    address = addr.freeform || [addr.street, addr.locality, addr.region].filter(Boolean).join(', ')
  }

  // Extract phone
  let phone = ''
  const phones = props.phones || []
  if (phones.length > 0) {
    phone = phones[0]
  }

  // Extract website
  let website = ''
  const websites = props.websites || []
  if (websites.length > 0) {
    website = websites[0]
  }

  return {
    id: item.id || props.id || `${coords[0]}-${coords[1]}`,
    name: props.names?.primary || props.name || 'Unknown',
    category: props.categories?.primary || props.category || '',
    address,
    phone,
    website,
    brand: props.brand?.names?.primary || props.brand?.name || '',
    confidence: props.confidence || 0,
    longitude: coords[0],
    latitude: coords[1],
  }
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
