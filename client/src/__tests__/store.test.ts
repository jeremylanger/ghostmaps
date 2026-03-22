import { beforeEach, describe, expect, it } from "vitest";
import { useAppStore } from "../store";
import type { Place, Ranking, RouteData } from "../types";

const mockPlace: Place = {
  id: "place-1",
  name: "Test Cafe",
  category: "cafe",
  address: "123 Main St",
  phone: "555-1234",
  website: "https://test.cafe",
  brand: "",
  confidence: 0.9,
  longitude: -118.2437,
  latitude: 34.0522,
};

const mockRouteData: RouteData = {
  coordinates: [
    [-118.2437, 34.0522],
    [-118.25, 34.06],
  ],
  instructions: [],
  summary: {
    lengthInMeters: 1000,
    travelTimeInSeconds: 120,
    trafficDelayInSeconds: 10,
    departureTime: "2026-03-21T10:00:00Z",
    arrivalTime: "2026-03-21T10:02:00Z",
  },
  speedLimits: [],
  laneGuidance: [],
};

function resetStore() {
  useAppStore.setState({
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
    userHeading: null,
    closestSegmentIndex: 0,
    showPrivacy: false,
  });
}

describe("useAppStore", () => {
  beforeEach(() => {
    resetStore();
  });

  describe("initial state", () => {
    it("has correct default values", () => {
      const state = useAppStore.getState();
      expect(state.searchResults).toEqual([]);
      expect(state.ranking).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.statusMessage).toBeNull();
      expect(state.error).toBeNull();
      expect(state.selectedPlace).toBeNull();
      expect(state.userLocation).toBeNull();
      expect(state.flyTo).toBeNull();
      expect(state.showReviewForm).toBe(false);
      expect(state.routeData).toBeNull();
      expect(state.navigating).toBe(false);
      expect(state.routeLoading).toBe(false);
      expect(state.currentInstructionIndex).toBe(0);
      expect(state.showSteps).toBe(false);
      expect(state.currentSpeedLimit).toBeNull();
      expect(state.currentLanes).toBeNull();
      expect(state.rerouting).toBe(false);
      expect(state.userHeading).toBeNull();
      expect(state.closestSegmentIndex).toBe(0);
      expect(state.showPrivacy).toBe(false);
    });
  });

  describe("setSearchResults", () => {
    it("updates searchResults", () => {
      const results = [mockPlace];
      useAppStore.getState().setSearchResults(results);
      expect(useAppStore.getState().searchResults).toEqual(results);
    });

    it("replaces previous results", () => {
      useAppStore.getState().setSearchResults([mockPlace]);
      const newPlace = { ...mockPlace, id: "place-2", name: "Other Cafe" };
      useAppStore.getState().setSearchResults([newPlace]);
      expect(useAppStore.getState().searchResults).toHaveLength(1);
      expect(useAppStore.getState().searchResults[0].id).toBe("place-2");
    });
  });

  describe("selectPlace", () => {
    it("sets selectedPlace and flyTo", () => {
      useAppStore.getState().selectPlace(mockPlace);
      const state = useAppStore.getState();
      expect(state.selectedPlace).toEqual(mockPlace);
      expect(state.flyTo).toEqual({
        lng: mockPlace.longitude,
        lat: mockPlace.latitude,
      });
    });
  });

  describe("setLoading", () => {
    it("updates loading state", () => {
      useAppStore.getState().setLoading(true);
      expect(useAppStore.getState().loading).toBe(true);
      useAppStore.getState().setLoading(false);
      expect(useAppStore.getState().loading).toBe(false);
    });
  });

  describe("setError", () => {
    it("updates error state", () => {
      useAppStore.getState().setError("Something went wrong");
      expect(useAppStore.getState().error).toBe("Something went wrong");
    });

    it("clears error with null", () => {
      useAppStore.getState().setError("error");
      useAppStore.getState().setError(null);
      expect(useAppStore.getState().error).toBeNull();
    });
  });

  describe("setStatusMessage", () => {
    it("updates statusMessage", () => {
      useAppStore.getState().setStatusMessage("Searching...");
      expect(useAppStore.getState().statusMessage).toBe("Searching...");
    });

    it("clears statusMessage with null", () => {
      useAppStore.getState().setStatusMessage("msg");
      useAppStore.getState().setStatusMessage(null);
      expect(useAppStore.getState().statusMessage).toBeNull();
    });
  });

  describe("clearSearch", () => {
    it("resets search-related state", () => {
      // Set up some state first
      useAppStore.getState().setSearchResults([mockPlace]);
      useAppStore.getState().selectPlace(mockPlace);
      useAppStore.getState().setRanking({
        topPick: "place-1",
        topPickReason: "Great coffee",
        alternatives: [],
      });
      useAppStore.getState().setStatusMessage("Done");
      useAppStore.getState().setError("Some error");

      useAppStore.getState().clearSearch();

      const state = useAppStore.getState();
      expect(state.searchResults).toEqual([]);
      expect(state.selectedPlace).toBeNull();
      expect(state.ranking).toBeNull();
      expect(state.statusMessage).toBeNull();
      expect(state.error).toBeNull();
    });

    it("does not reset unrelated state", () => {
      useAppStore.getState().setLoading(true);
      useAppStore.getState().setShowPrivacy(true);
      useAppStore.getState().clearSearch();
      expect(useAppStore.getState().loading).toBe(true);
      expect(useAppStore.getState().showPrivacy).toBe(true);
    });
  });

  describe("setRouteData / clearRoute", () => {
    it("sets route data", () => {
      useAppStore.getState().setRouteData(mockRouteData);
      expect(useAppStore.getState().routeData).toEqual(mockRouteData);
    });

    it("clearRoute resets all navigation state", () => {
      useAppStore.getState().setRouteData(mockRouteData);
      useAppStore.getState().setNavigating(true);
      useAppStore.getState().setRouteLoading(true);
      useAppStore.getState().setCurrentInstructionIndex(5);
      useAppStore.getState().setShowSteps(true);
      useAppStore.getState().setCurrentSpeedLimit(65);
      useAppStore
        .getState()
        .setCurrentLanes([{ directions: ["left"], follow: "left" }]);
      useAppStore.getState().setRerouting(true);
      useAppStore.getState().setUserHeading(180);
      useAppStore.getState().setClosestSegmentIndex(3);

      useAppStore.getState().clearRoute();

      const state = useAppStore.getState();
      expect(state.routeData).toBeNull();
      expect(state.navigating).toBe(false);
      expect(state.routeLoading).toBe(false);
      expect(state.currentInstructionIndex).toBe(0);
      expect(state.showSteps).toBe(false);
      expect(state.currentSpeedLimit).toBeNull();
      expect(state.currentLanes).toBeNull();
      expect(state.rerouting).toBe(false);
      expect(state.userHeading).toBeNull();
      expect(state.closestSegmentIndex).toBe(0);
    });

    it("clearRoute does not reset non-navigation state", () => {
      useAppStore.getState().setSearchResults([mockPlace]);
      useAppStore.getState().clearRoute();
      expect(useAppStore.getState().searchResults).toHaveLength(1);
    });
  });

  describe("clearSelection", () => {
    it("clears selectedPlace", () => {
      useAppStore.getState().selectPlace(mockPlace);
      useAppStore.getState().clearSelection();
      expect(useAppStore.getState().selectedPlace).toBeNull();
    });
  });

  describe("setUserLocation", () => {
    it("sets userLocation and flyTo", () => {
      const loc = { lat: 40.7128, lng: -74.006 };
      useAppStore.getState().setUserLocation(loc);
      const state = useAppStore.getState();
      expect(state.userLocation).toEqual(loc);
      expect(state.flyTo).toEqual(loc);
    });
  });
});
