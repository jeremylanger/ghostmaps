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

export interface OnChainReview {
  uid: string
  attester: string
  time: number
  rating: number
  text: string
  placeId: string
  placeName: string
  photoHash: string
  lat: number
  lng: number
  qualityScore: number
}

export interface ReviewIdentity {
  firstSeen: number
  totalReviews: number
}

export interface ReviewsResponse {
  reviews: OnChainReview[]
  identities: Record<string, ReviewIdentity>
  summary: string
}

export interface RouteSummary {
  lengthInMeters: number
  travelTimeInSeconds: number
  trafficDelayInSeconds: number
  departureTime: string
  arrivalTime: string
}

export interface RouteInstruction {
  distance: number
  travelTime: number
  point: [number, number]
  instructionType: string
  street: string
  message: string
  maneuver: string
  turnAngle: number
}

export interface RouteData {
  coordinates: [number, number][]
  instructions: RouteInstruction[]
  summary: RouteSummary
}
