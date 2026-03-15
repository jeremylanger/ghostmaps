import { create } from 'zustand'
import type { Place, Ranking } from './types'

interface LatLng {
  lat: number
  lng: number
}

interface AppState {
  // Search
  searchResults: Place[]
  ranking: Ranking | null
  loading: boolean
  statusMessage: string | null
  error: string | null

  // Map
  selectedPlace: Place | null
  userLocation: LatLng | null
  flyTo: LatLng | null

  // Actions
  setSearchResults: (results: Place[]) => void
  setRanking: (ranking: Ranking | null) => void
  setLoading: (loading: boolean) => void
  setStatusMessage: (msg: string | null) => void
  setError: (error: string | null) => void
  selectPlace: (place: Place) => void
  clearSelection: () => void
  setUserLocation: (location: LatLng) => void
  clearSearch: () => void
}

export const useAppStore = create<AppState>((set) => ({
  searchResults: [],
  ranking: null,
  loading: false,
  statusMessage: null,
  error: null,
  selectedPlace: null,
  userLocation: null,
  flyTo: null,

  setSearchResults: (results) => set({ searchResults: results }),
  setRanking: (ranking) => set({ ranking }),
  setLoading: (loading) => set({ loading }),
  setStatusMessage: (statusMessage) => set({ statusMessage }),
  setError: (error) => set({ error }),

  selectPlace: (place) => set({
    selectedPlace: place,
    flyTo: { lng: place.longitude, lat: place.latitude },
  }),

  clearSelection: () => set({ selectedPlace: null }),

  setUserLocation: (location) => set({
    userLocation: location,
    flyTo: location,
  }),

  clearSearch: () => set({
    searchResults: [],
    selectedPlace: null,
    ranking: null,
    statusMessage: null,
    error: null,
  }),
}))
