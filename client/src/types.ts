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
  references: { supplier: string; id: string }[]
  briefing: string
}

export interface Ranking {
  topPick: string | null
  topPickReason: string
  alternatives: { id: string; whyNot: string }[]
  summary: string
}
