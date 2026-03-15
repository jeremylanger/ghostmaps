import type { Place } from './types'

const HERE_BASE = 'https://discover.search.hereapi.com/v1'

export interface HereEnrichment {
  openingHours: string | null
  isOpen: boolean | null
  foodTypes: string[]
  website: string | null
  phone: string | null
  rating: number | null
  // TripAdvisor/Yelp reference IDs
  references: { supplier: string; id: string }[]
}

interface HerePlace {
  title: string
  position: { lat: number; lng: number }
  distance: number
  categories?: { id: string; name: string; primary?: boolean }[]
  foodTypes?: { id: string; name: string; primary?: boolean }[]
  openingHours?: { text: string[]; isOpen: boolean }[]
  contacts?: { phone?: { value: string }[]; www?: { value: string }[] }[]
  references?: { supplier: { id: string }; id: string }[]
}

export async function enrichPlace(place: Place, apiKey: string): Promise<HereEnrichment> {
  try {
    // Search HERE for the same place by name + location
    const params = new URLSearchParams({
      q: place.name,
      at: `${place.latitude},${place.longitude}`,
      limit: '1',
      apiKey,
    })

    const response = await fetch(`${HERE_BASE}/discover?${params}`)

    if (!response.ok) {
      console.error('HERE API error:', response.status)
      return emptyEnrichment()
    }

    const data = await response.json()
    const items: HerePlace[] = data.items || []

    if (items.length === 0) return emptyEnrichment()

    const item = items[0]

    // Only use the result if it's within ~200m of our place
    if (item.distance > 200) return emptyEnrichment()

    return {
      openingHours: item.openingHours?.[0]?.text?.join('; ') || null,
      isOpen: item.openingHours?.[0]?.isOpen ?? null,
      foodTypes: (item.foodTypes || []).map((f) => f.name),
      website: item.contacts?.[0]?.www?.[0]?.value || null,
      phone: item.contacts?.[0]?.phone?.[0]?.value || null,
      rating: null, // HERE doesn't include ratings directly
      references: (item.references || []).map((r) => ({
        supplier: r.supplier.id,
        id: r.id,
      })),
    }
  } catch (err) {
    console.error('HERE enrichment error:', err)
    return emptyEnrichment()
  }
}

export async function enrichPlaces(
  places: Place[],
  apiKey: string,
  maxEnrich: number = 5
): Promise<Map<string, HereEnrichment>> {
  const enrichments = new Map<string, HereEnrichment>()

  // Only enrich top N places to conserve API quota
  const toEnrich = places.slice(0, maxEnrich)

  const results = await Promise.allSettled(
    toEnrich.map(async (place) => {
      const enrichment = await enrichPlace(place, apiKey)
      return { id: place.id, enrichment }
    })
  )

  for (const result of results) {
    if (result.status === 'fulfilled') {
      enrichments.set(result.value.id, result.value.enrichment)
    }
  }

  return enrichments
}

function emptyEnrichment(): HereEnrichment {
  return {
    openingHours: null,
    isOpen: null,
    foodTypes: [],
    website: null,
    phone: null,
    rating: null,
    references: [],
  }
}
