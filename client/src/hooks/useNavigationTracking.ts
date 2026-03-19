import maplibregl from "maplibre-gl";
import { useEffect, useRef } from "react";
import { bearing, closestSegmentOnRoute } from "../lib/geo-utils";
import {
  createDestinationMarker,
  createUserArrowElement,
  createUserDotElement,
  setArrowHeading,
} from "../lib/map-markers";
import { useAppStore } from "../store";

const OFF_ROUTE_THRESHOLD_M = 50;
const OFF_ROUTE_REQUIRED_COUNT = 3;

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

  // Swap marker to arrow when navigation starts, back to dot when it ends
  useEffect(() => {
    if (!mapRef.current || !userMarkerRef.current) return;
    const map = mapRef.current;
    const currentLngLat = userMarkerRef.current.getLngLat();

    if (navigating) {
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
    }
  }, [navigating]);

  // Reset off-route counter when route data changes (after reroute)
  useEffect(() => {
    offRouteCountRef.current = 0;
  }, [routeData]);

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
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };

        useAppStore.setState({ userLocation: loc });

        // Update marker position with smooth CSS transition
        if (userMarkerRef.current) {
          userMarkerRef.current.setLngLat([loc.lng, loc.lat]);
        }

        // Compute heading from GPS or from consecutive positions
        let heading = pos.coords.heading;
        if (heading == null || Number.isNaN(heading)) {
          if (prevPosRef.current) {
            heading = bearing(
              prevPosRef.current.lat,
              prevPosRef.current.lng,
              loc.lat,
              loc.lng,
            );
          }
        }

        const validHeading =
          heading != null && !Number.isNaN(heading) ? heading : null;

        // Rotate arrow marker
        if (validHeading != null && arrowElRef.current) {
          setArrowHeading(arrowElRef.current, validHeading);
          useAppStore.setState({ userHeading: validHeading });
        }

        // Rotate map to match heading
        if (mapRef.current) {
          mapRef.current.easeTo({
            center: [loc.lng, loc.lat],
            ...(validHeading != null ? { bearing: validHeading } : {}),
            zoom: 17,
            duration: validHeading != null ? 1000 : 500,
          });
        }

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

        // Off-route detection with debounce
        if (distFromRoute > OFF_ROUTE_THRESHOLD_M) {
          offRouteCountRef.current++;
          if (
            offRouteCountRef.current >= OFF_ROUTE_REQUIRED_COUNT &&
            !store.rerouting
          ) {
            triggerReroute(loc, store, rerouteAbortRef);
          }
        } else {
          offRouteCountRef.current = 0;
        }

        // Find closest instruction
        updateCurrentInstruction(route, loc, store);
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

function updateCurrentInstruction(
  route: NonNullable<ReturnType<typeof useAppStore.getState>["routeData"]>,
  loc: { lat: number; lng: number },
  store: ReturnType<typeof useAppStore.getState>,
) {
  let closestIdx = 0;
  let closestDist = Infinity;
  for (let i = 0; i < route.instructions.length; i++) {
    const inst = route.instructions[i];
    const dx = inst.point[0] - loc.lng;
    const dy = inst.point[1] - loc.lat;
    const dist = dx * dx + dy * dy;
    if (dist < closestDist) {
      closestDist = dist;
      closestIdx = i;
    }
  }
  if (closestIdx !== store.currentInstructionIndex) {
    store.setCurrentInstructionIndex(closestIdx);
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
      useAppStore.setState({ routeData: newRoute, rerouting: false });
    })
    .catch(() => {
      useAppStore.getState().setRerouting(false);
    });
}
