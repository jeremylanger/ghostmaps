import type { Place } from './types'

const VENICE_PARSE_MODEL = 'mistral-small-3-2-24b-instruct'
const VENICE_RANK_MODEL = 'mistral-small-3-2-24b-instruct'
const VENICE_BRIEFING_MODEL = 'mistral-small-3-2-24b-instruct'
const VENICE_URL = 'https://api.venice.ai/api/v1/chat/completions'

async function veniceChat(
  messages: { role: string; content: string }[],
  model: string,
  options: { temperature?: number } = {}
): Promise<string> {
  console.log('[venice] Starting chat request...')
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 45000)

  try {
    const response = await fetch(VENICE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VENICE_API_KEY}`,
        'Content-Type': 'application/json',
        'Connection': 'close',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature ?? 0.1,
        max_tokens: 4000,
      }),
      signal: controller.signal,
      keepalive: false,
    } as RequestInit)

    console.log('[venice] Response status:', response.status)

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Venice API error: ${response.status} ${text}`)
    }

    const data = await response.json()
    const msg = data.choices?.[0]?.message
    const content = msg?.content || ''
    const reasoning = msg?.reasoning_content || ''
    console.log('[venice] content:', content.slice(0, 100) || '(empty)')
    console.log('[venice] reasoning:', reasoning.slice(0, 100) || '(empty)')
    // Venice sometimes puts structured output in reasoning_content when content is empty
    return content || reasoning
  } finally {
    clearTimeout(timeout)
  }
}

async function* veniceChatStream(
  messages: { role: string; content: string }[],
  options: { temperature?: number } = {}
): AsyncGenerator<string> {
  const response = await fetch(VENICE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.VENICE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: VENICE_MODEL,
      messages,
      temperature: options.temperature ?? 0.3,
      stream: true,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Venice API error: ${response.status} ${text}`)
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith('data: ') && line !== 'data: [DONE]') {
        try {
          const json = JSON.parse(line.slice(6))
          const content = json.choices?.[0]?.delta?.content || ''
          if (content) yield content
        } catch {
          // skip malformed chunks
        }
      }
    }
  }
}

interface ParsedQuery {
  categories: string[]
  time_filter: string | null
  attributes: string[]
  location_hint: string | null
  radius: number | null
}

const PARSE_SYSTEM_PROMPT = `You are a search query parser for a maps app. Extract structured search intent from natural language queries.

Return ONLY valid JSON (no markdown, no code blocks) with these fields:
- categories: array of Overture Maps place categories (use snake_case like: restaurant, coffee_shop, pizza_restaurant, mexican_restaurant, bar, pub, brewery, gym, park, museum, hotel, gas_station, pharmacy, grocery_store, bakery, ice_cream_shop, bookstore, hair_salon, dentist, hospital, bank, parking, library, nightclub, movie_theater, spa, clothing_store, electronics_store, supermarket, shopping_mall, steakhouse, seafood_restaurant, sushi_restaurant, indian_restaurant, thai_restaurant, chinese_restaurant, italian_restaurant, japanese_restaurant, korean_restaurant, vietnamese_restaurant, burger_restaurant, breakfast_restaurant, barbecue_restaurant, ramen_restaurant, cafe, tea_house, juice_bar, dessert_shop)
- time_filter: "open_now", "late_night", "morning", "lunch", or null
- attributes: relevant attributes like ["outdoor_seating", "wifi", "delivery", "takeout", "pet_friendly", "live_music", "happy_hour", "vegan_options"]
- location_hint: a neighborhood or area name if mentioned, or null
- radius: search radius in meters if implied (e.g. "nearby" = 1000, "walking distance" = 800), or null

Examples:
"best coffee near me" → {"categories":["coffee_shop","cafe"],"time_filter":null,"attributes":[],"location_hint":null,"radius":1000}
"late night tacos with outdoor seating" → {"categories":["mexican_restaurant"],"time_filter":"late_night","attributes":["outdoor_seating"],"location_hint":null,"radius":null}
"quiet bar in silverlake" → {"categories":["bar","pub"],"time_filter":null,"attributes":[],"location_hint":"silverlake","radius":null}`

export async function parseQuery(query: string): Promise<ParsedQuery> {
  try {
    const content = await veniceChat([
      { role: 'system', content: PARSE_SYSTEM_PROMPT },
      { role: 'user', content: query },
    ], VENICE_PARSE_MODEL, { temperature: 0.1 })

    // Extract JSON from possible markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content]
    const parsed = JSON.parse(jsonMatch[1]!.trim())

    return {
      categories: parsed.categories || ['restaurant'],
      time_filter: parsed.time_filter || null,
      attributes: parsed.attributes || [],
      location_hint: parsed.location_hint || null,
      radius: parsed.radius || null,
    }
  } catch (err) {
    console.error('Venice parse error:', err)
    return {
      categories: [query.toLowerCase().replace(/\s+/g, '_')],
      time_filter: null,
      attributes: [],
      location_hint: null,
      radius: null,
    }
  }
}

const RANK_SYSTEM_PROMPT = `You are a local guide AI for Ghost Maps, a private maps app. Pick the BEST place and explain why. For others, give a brief "why not" (max 5 words each).

Return ONLY valid JSON (no markdown, no code blocks):
{
  "top_pick": {"id": "the place id", "reason": "1-2 sentence recommendation"},
  "alternatives": [{"id": "place id", "why_not": "max 5 words"}],
  "summary": "1 sentence overview"
}

Be concise and opinionated. Prefer places with higher confidence scores, real addresses, and phone numbers.`

export async function rankResults(
  query: string,
  places: Place[],
  attributes: string[]
): Promise<{ topPick: string | null; topPickReason: string; alternatives: { id: string; whyNot: string }[]; summary: string }> {
  if (places.length === 0) {
    return { topPick: null, topPickReason: '', alternatives: [], summary: 'No results found.' }
  }

  if (places.length === 1) {
    return {
      topPick: places[0].id,
      topPickReason: `${places[0].name} is your best option nearby.`,
      alternatives: [],
      summary: `Found ${places[0].name}.`,
    }
  }

  try {
    const placeSummaries = places.slice(0, 5).map((p) => ({
      id: p.id,
      name: p.name,
      address: p.address || 'unknown',
      confidence: Math.round(p.confidence * 100),
    }))

    const userContext = attributes.length > 0
      ? `\nUser wants: ${attributes.join(', ')}`
      : ''

    const content = await veniceChat([
      { role: 'system', content: RANK_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Query: "${query}"${userContext}\n\nResults:\n${JSON.stringify(placeSummaries)}`,
      },
    ], VENICE_RANK_MODEL, { temperature: 0.3 })

    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content]
    const parsed = JSON.parse(jsonMatch[1]!.trim())

    return {
      topPick: parsed.top_pick?.id || places[0].id,
      topPickReason: parsed.top_pick?.reason || '',
      alternatives: (parsed.alternatives || []).map((a: { id: string; why_not: string }) => ({
        id: a.id,
        whyNot: a.why_not,
      })),
      summary: parsed.summary || `Found ${places.length} results.`,
    }
  } catch (err) {
    console.error('Venice rank error:', err)
    return {
      topPick: places[0].id,
      topPickReason: '',
      alternatives: places.slice(1, 6).map((p) => ({ id: p.id, whyNot: '' })),
      summary: `Found ${places.length} results.`,
    }
  }
}

const BRIEFING_SYSTEM_PROMPT = `You are a concise local guide for Ghost Maps. Given a place's data, write a 2-3 sentence intelligence briefing that helps someone decide whether to visit.

Include: what makes it notable, vibe/atmosphere hints from the category and name, and any practical info (hours, cuisine type). Be opinionated but fair. If data is sparse, say what you can and note what's unknown.

Return plain text only — no JSON, no markdown.`

export interface PlaceBriefingData {
  name: string
  category: string
  address: string
  phone: string
  website: string
  brand: string
  openingHours: string | null
  isOpen: boolean | null
  foodTypes: string[]
}

export async function generatePlaceBriefing(data: PlaceBriefingData): Promise<string> {
  try {
    const details = [
      `Name: ${data.name}`,
      `Category: ${data.category.replace(/_/g, ' ')}`,
      data.address && `Address: ${data.address}`,
      data.phone && `Phone: ${data.phone}`,
      data.website && `Website: ${data.website}`,
      data.brand && `Brand: ${data.brand}`,
      data.openingHours && `Hours: ${data.openingHours}`,
      data.isOpen !== null && `Currently: ${data.isOpen ? 'Open' : 'Closed'}`,
      data.foodTypes.length > 0 && `Cuisine: ${data.foodTypes.join(', ')}`,
    ].filter(Boolean).join('\n')

    const content = await veniceChat([
      { role: 'system', content: BRIEFING_SYSTEM_PROMPT },
      { role: 'user', content: details },
    ], VENICE_BRIEFING_MODEL, { temperature: 0.4 })

    return content.trim()
  } catch (err) {
    console.error('Venice briefing error:', err)
    return ''
  }
}
