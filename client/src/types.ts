export interface Place {
  id: string
  name: string
  category: string
  address: string
  phone: string
  website: string
  brand: string
  confidence: number
  longitude: number
  latitude: number
}

export interface EnrichedPlace extends Place {
  openingHours: string | null
  isOpen: boolean | null
  foodTypes: string[]
  rating: number | null
  reviewCount: number | null
  priceLevel: string | null
  dineIn: boolean | null
  takeout: boolean | null
  delivery: boolean | null
  wheelchairAccessible: boolean | null
  photoUri: string | null
  briefing: string
}

export interface Ranking {
  topPick: string | null
  topPickReason: string
  alternatives: { id: string; whyNot: string }[]
  summary: string
}
