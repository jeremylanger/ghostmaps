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

export interface OvertureFeature {
  id?: string
  geometry?: {
    coordinates: [number, number]
  }
  properties?: OvertureProperties
  // Flat format (when properties are at top level)
  names?: { primary: string }
  categories?: { primary: string }
  addresses?: OvertureAddress[]
  phones?: string[]
  websites?: string[]
  brand?: { names?: { primary: string }; name?: string }
  confidence?: number
  longitude?: number
  latitude?: number
  name?: string
  category?: string
}

export interface OvertureProperties {
  id?: string
  names?: { primary: string }
  name?: string
  categories?: { primary: string }
  category?: string
  addresses?: OvertureAddress[]
  phones?: string[]
  websites?: string[]
  brand?: { names?: { primary: string }; name?: string }
  confidence?: number
  longitude?: number
  latitude?: number
}

export interface OvertureAddress {
  freeform?: string
  street?: string
  locality?: string
  region?: string
}
