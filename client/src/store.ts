import { create } from "zustand";
import type { Lane, Place, Ranking, RouteData } from "./types";

interface LatLng {
  lat: number;
  lng: number;
}

interface AppState {
  // Search
  searchResults: Place[];
  ranking: Ranking | null;
  loading: boolean;
  statusMessage: string | null;
  error: string | null;

  // Map
  selectedPlace: Place | null;
  userLocation: LatLng | null;
  flyTo: LatLng | null;

  // Review
  showReviewForm: boolean;

  // Navigation
  routeData: RouteData | null;
  navigating: boolean;
  routeLoading: boolean;
  currentInstructionIndex: number;
  showSteps: boolean;
  currentSpeedLimit: number | null;
  currentLanes: Lane[] | null;
  rerouting: boolean;

  // UI
  showPrivacy: boolean;

  // Actions
  setSearchResults: (results: Place[]) => void;
  setRanking: (ranking: Ranking | null) => void;
  setLoading: (loading: boolean) => void;
  setStatusMessage: (msg: string | null) => void;
  setError: (error: string | null) => void;
  selectPlace: (place: Place) => void;
  clearSelection: () => void;
  setUserLocation: (location: LatLng) => void;
  clearSearch: () => void;
  setShowReviewForm: (show: boolean) => void;
  setRouteData: (route: RouteData | null) => void;
  setNavigating: (navigating: boolean) => void;
  setRouteLoading: (loading: boolean) => void;
  setCurrentInstructionIndex: (index: number) => void;
  setShowSteps: (show: boolean) => void;
  setCurrentSpeedLimit: (limit: number | null) => void;
  setCurrentLanes: (lanes: Lane[] | null) => void;
  setRerouting: (rerouting: boolean) => void;
  setShowPrivacy: (show: boolean) => void;
  clearRoute: () => void;
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
  showSteps: false,
  currentSpeedLimit: null,
  currentLanes: null,
  rerouting: false,
  showPrivacy: false,

  setSearchResults: (results) => set({ searchResults: results }),
  setRanking: (ranking) => set({ ranking }),
  setLoading: (loading) => set({ loading }),
  setStatusMessage: (statusMessage) => set({ statusMessage }),
  setError: (error) => set({ error }),

  selectPlace: (place) =>
    set({
      selectedPlace: place,
      flyTo: { lng: place.longitude, lat: place.latitude },
    }),

  clearSelection: () => set({ selectedPlace: null }),

  setUserLocation: (location) =>
    set({
      userLocation: location,
      flyTo: location,
    }),

  clearSearch: () =>
    set({
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
  setCurrentInstructionIndex: (currentInstructionIndex) =>
    set({ currentInstructionIndex }),
  setShowSteps: (showSteps) => set({ showSteps }),
  setCurrentSpeedLimit: (currentSpeedLimit) => set({ currentSpeedLimit }),
  setCurrentLanes: (currentLanes) => set({ currentLanes }),
  setRerouting: (rerouting) => set({ rerouting }),
  setShowPrivacy: (showPrivacy) => set({ showPrivacy }),

  clearRoute: () =>
    set({
      routeData: null,
      navigating: false,
      routeLoading: false,
      currentInstructionIndex: 0,
      showSteps: false,
      currentSpeedLimit: null,
      currentLanes: null,
      rerouting: false,
    }),
}));
