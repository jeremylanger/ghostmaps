import maplibregl from "maplibre-gl";
import { useEffect, useRef } from "react";
import { consolidateInstructions } from "../lib/consolidate-instructions";
import { bearing, closestSegmentOnRoute } from "../lib/geo-utils";
import {
  createDestinationMarker,
  createUserArrowElement,
  createUserDotElement,
  setArrowHeading,
} from "../lib/map-markers";
import {
  findBestInstruction,
  isMovingAwayFromRoute,
} from "../lib/nav-tracking-utils";
import { useAppStore } from "../store";

const OFF_ROUTE_THRESHOLD_M = 30;
const OFF_ROUTE_REQUIRED_COUNT = 3;
const CAMERA_OFFSET_DEG = 0.001; // ~111m forward offset to place user in lower third
const INTERP_DURATION_MS = 1000; // interpolation between GPS fixes

export function useNavigationTracking(
  mapRef: React.RefObject<maplibregl.Map | null>,
  userMarkerRef: React.MutableRefObject<maplibregl.Marker | null>,
) {
  const navigating = useAppStore((s) => s.navigating);
  const routeData = useAppStore((s) => s.routeData);
  const selectedPlace = useAppStore((s) => s.selectedPlace);
  const watchIdRef = useRef<number | null>(null);
  const rerouteAbortRef = useRef<AbortController | null>(null);
  const offRouteCountRef = useRef(0);
  const prevPosRef = useRef<{ lat: number; lng: number } | null>(null);
  const destMarkerRef = useRef<maplibregl.Marker | null>(null);
  const arrowElRef = useRef<HTMLDivElement | null>(null);
  const dotElRef = useRef<HTMLDivElement | null>(null);

  // Position interpolation refs
  const interpFromRef = useRef<{ lat: number; lng: number } | null>(null);
  const interpToRef = useRef<{ lat: number; lng: number } | null>(null);
  const interpStartRef = useRef(0);
  const interpRafRef = useRef<number | null>(null);
  const lastHeadingRef = useRef<number | null>(null);

  // Swap marker to arrow when navigation starts, back to dot when it ends
  useEffect(() => {
    if (!mapRef.current || !userMarkerRef.current) return;
    const map = mapRef.current;
    const currentLngLat = userMarkerRef.current.getLngLat();

    if (navigating) {
      // Reset stale refs from previous navigation session
      interpFromRef.current = null;
      interpToRef.current = null;
      prevPosRef.current = null;
      lastHeadingRef.current = null;

      // Swap to arrow
      userMarkerRef.current.remove();
      if (!arrowElRef.current) arrowElRef.current = createUserArrowElement();
      userMarkerRef.current = new maplibregl.Marker({
        element: arrowElRef.current,
      })
        .setLngLat(currentLngLat)
        .addTo(map);

      // Add destination marker
      if (selectedPlace && !destMarkerRef.current) {
        destMarkerRef.current = createDestinationMarker(
          selectedPlace.name,
          map,
          [selectedPlace.longitude, selectedPlace.latitude],
        );
      }
    } else {
      // Swap back to dot
      userMarkerRef.current.remove();
      if (!dotElRef.current) dotElRef.current = createUserDotElement();
      userMarkerRef.current = new maplibregl.Marker({
        element: dotElRef.current,
      })
        .setLngLat(currentLngLat)
        .addTo(map);

      // Remove destination marker
      destMarkerRef.current?.remove();
      destMarkerRef.current = null;

      // Reset map bearing to north
      map.easeTo({ bearing: 0, duration: 500 });

      // Stop interpolation
      if (interpRafRef.current != null) {
        cancelAnimationFrame(interpRafRef.current);
        interpRafRef.current = null;
      }
    }
  }, [navigating]);

  // Reset off-route counter when route data changes (after reroute)
  useEffect(() => {
    offRouteCountRef.current = 0;
  }, [routeData]);

  // Position interpolation loop
  useEffect(() => {
    if (!navigating) return;

    function interpolate() {
      const from = interpFromRef.current;
      const to = interpToRef.current;
      if (!from || !to) {
        interpRafRef.current = requestAnimationFrame(interpolate);
        return;
      }

      const elapsed = Date.now() - interpStartRef.current;
      const t = Math.min(elapsed / INTERP_DURATION_MS, 1);

      // Skip updates when interpolation is complete
      if (t >= 1) {
        interpRafRef.current = requestAnimationFrame(interpolate);
        return;
      }

      // Ease-out for smooth deceleration
      const eased = 1 - (1 - t) * (1 - t);

      const lat = from.lat + (to.lat - from.lat) * eased;
      const lng = from.lng + (to.lng - from.lng) * eased;

      if (userMarkerRef.current) {
        userMarkerRef.current.setLngLat([lng, lat]);
      }

      // Offset camera: put user in lower third by shifting center forward
      if (mapRef.current) {
        const h = lastHeadingRef.current;
        let centerLat = lat;
        let centerLng = lng;
        if (h != null) {
          const rad = (h * Math.PI) / 180;
          centerLat = lat + CAMERA_OFFSET_DEG * Math.cos(rad);
          centerLng =
            lng +
            (CAMERA_OFFSET_DEG * Math.sin(rad)) /
              Math.cos((lat * Math.PI) / 180);
        }
        mapRef.current.jumpTo({
          center: [centerLng, centerLat],
          ...(h != null ? { bearing: h } : {}),
          zoom: 17,
        });
      }

      interpRafRef.current = requestAnimationFrame(interpolate);
    }

    interpRafRef.current = requestAnimationFrame(interpolate);

    return () => {
      if (interpRafRef.current != null) {
        cancelAnimationFrame(interpRafRef.current);
        interpRafRef.current = null;
      }
    };
  }, [navigating]);

  // GPS tracking during navigation
  useEffect(() => {
    if (!navigating) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        // TEMP: Override for screenshots — Loveland city center
        const loc = { lat: 40.3978, lng: -105.0748 };

        useAppStore.setState({ userLocation: loc });

        // Capture previous position BEFORE updating ref
        const prevLoc = prevPosRef.current;

        // Set up interpolation from current marker position to new GPS fix
        const currentMarkerPos = userMarkerRef.current?.getLngLat();
        interpFromRef.current = currentMarkerPos
          ? { lat: currentMarkerPos.lat, lng: currentMarkerPos.lng }
          : loc;
        interpToRef.current = loc;
        interpStartRef.current = Date.now();

        // Compute heading from GPS or from consecutive positions
        let heading = pos.coords.heading;
        if (heading == null || Number.isNaN(heading)) {
          if (prevLoc) {
            heading = bearing(prevLoc.lat, prevLoc.lng, loc.lat, loc.lng);
          }
        }

        const validHeading =
          heading != null && !Number.isNaN(heading) ? heading : null;

        // Rotate arrow marker
        if (validHeading != null && arrowElRef.current) {
          setArrowHeading(arrowElRef.current, validHeading);
          useAppStore.setState({ userHeading: validHeading });
          lastHeadingRef.current = validHeading;
        }

        // Update previous position AFTER using it
        prevPosRef.current = loc;

        // Route tracking
        const store = useAppStore.getState();
        const route = store.routeData;
        if (!route) return;

        const { index: closestSegIdx, distance: distFromRoute } =
          closestSegmentOnRoute(loc.lat, loc.lng, route.coordinates);

        // Store closest segment index for route display trimming and speed/lane lookups
        if (closestSegIdx !== store.closestSegmentIndex) {
          store.setClosestSegmentIndex(closestSegIdx);
        }
        updateSpeedAndLanes(route, closestSegIdx, store);

        // Off-route detection with debounce + direction check
        if (distFromRoute > OFF_ROUTE_THRESHOLD_M) {
          // Check if user is heading away from route (not just GPS drift)
          const movingAway = isMovingAwayFromRoute(
            loc,
            prevLoc,
            route.coordinates,
            closestSegIdx,
          );
          if (movingAway) {
            offRouteCountRef.current++;
          } else {
            // GPS drift but still heading toward route — softer penalty
            offRouteCountRef.current = Math.max(
              0,
              offRouteCountRef.current - 1,
            );
          }
          if (
            offRouteCountRef.current >= OFF_ROUTE_REQUIRED_COUNT &&
            !store.rerouting
          ) {
            triggerReroute(loc, store, rerouteAbortRef);
          }
        } else {
          offRouteCountRef.current = 0;
        }

        // Advance instruction if user has passed the current maneuver point
        const newIdx = findBestInstruction(
          store.currentInstructionIndex,
          route.instructions,
          loc.lat,
          loc.lng,
          pos.coords.accuracy,
        );
        if (newIdx !== store.currentInstructionIndex) {
          store.setCurrentInstructionIndex(newIdx);
        }
      },
      (err) => console.error("GPS error:", err),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 },
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      rerouteAbortRef.current?.abort();
      rerouteAbortRef.current = null;
    };
  }, [navigating]);
}

function updateSpeedAndLanes(
  route: NonNullable<ReturnType<typeof useAppStore.getState>["routeData"]>,
  closestPointIdx: number,
  store: ReturnType<typeof useAppStore.getState>,
) {
  if (route.speedLimits?.length) {
    const section = route.speedLimits.find(
      (s) =>
        closestPointIdx >= s.startPointIndex &&
        closestPointIdx <= s.endPointIndex,
    );
    const newLimit = section ? section.maxSpeedMph : null;
    if (newLimit !== store.currentSpeedLimit)
      store.setCurrentSpeedLimit(newLimit);
  }

  if (route.laneGuidance?.length) {
    const laneSection = route.laneGuidance.find(
      (s) =>
        closestPointIdx >= s.startPointIndex &&
        closestPointIdx <= s.endPointIndex,
    );
    const newLanes = laneSection ? laneSection.lanes : null;
    if (newLanes !== store.currentLanes) store.setCurrentLanes(newLanes);
  } else if (store.currentLanes !== null) {
    store.setCurrentLanes(null);
  }
}

function triggerReroute(
  loc: { lat: number; lng: number },
  store: ReturnType<typeof useAppStore.getState>,
  abortRef: React.MutableRefObject<AbortController | null>,
) {
  store.setRerouting(true);
  const place = store.selectedPlace;
  if (!place) return;

  const controller = new AbortController();
  abortRef.current = controller;

  fetch("/api/route", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fromLat: loc.lat,
      fromLng: loc.lng,
      toLat: place.latitude,
      toLng: place.longitude,
    }),
    signal: controller.signal,
  })
    .then((res) => res.json())
    .then((newRoute) => {
      newRoute.instructions = consolidateInstructions(newRoute.instructions);
      useAppStore.setState({ routeData: newRoute, rerouting: false });
    })
    .catch((err) => {
      console.error("Reroute failed:", err);
      useAppStore.getState().setRerouting(false);
    });
}
