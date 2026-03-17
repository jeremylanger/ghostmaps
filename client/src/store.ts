import { create } from 'zustand'
import type { Place, Ranking, RouteData } from './types'

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

  // Review
  showReviewForm: boolean

  // Navigation
  routeData: RouteData | null
  navigating: boolean
  routeLoading: boolean
  currentInstructionIndex: number

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
  setShowReviewForm: (show: boolean) => void
  setRouteData: (route: RouteData | null) => void
  setNavigating: (navigating: boolean) => void
  setRouteLoading: (loading: boolean) => void
  setCurrentInstructionIndex: (index: number) => void
  clearRoute: () => void
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
  showReviewForm: false,
  routeData: null,
  navigating: false,
  routeLoading: false,
  currentInstructionIndex: 0,

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

  setShowReviewForm: (show) => set({ showReviewForm: show }),

  setRouteData: (routeData) => set({ routeData }),
  setNavigating: (navigating) => set({ navigating }),
  setRouteLoading: (routeLoading) => set({ routeLoading }),
  setCurrentInstructionIndex: (currentInstructionIndex) => set({ currentInstructionIndex }),

  clearRoute: () => set({
    routeData: null,
    navigating: false,
    routeLoading: false,
    currentInstructionIndex: 0,
  }),
}))
