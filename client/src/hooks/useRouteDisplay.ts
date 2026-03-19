import maplibregl from "maplibre-gl";
import { useEffect } from "react";
import { trimRouteAhead } from "../lib/geo-utils";
import { ROUTE_SOURCE } from "../lib/map-constants";
import { useAppStore } from "../store";

const EMPTY_FC: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

export function useRouteDisplay(
  mapRef: React.RefObject<maplibregl.Map | null>,
  layersReady: React.RefObject<boolean>,
) {
  const routeData = useAppStore((s) => s.routeData);
  const navigating = useAppStore((s) => s.navigating);
  const closestSegmentIndex = useAppStore((s) => s.closestSegmentIndex);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !layersReady.current) return;
    const source = map.getSource(ROUTE_SOURCE) as
      | maplibregl.GeoJSONSource
      | undefined;
    if (!source) return;

    if (!routeData) {
      source.setData(EMPTY_FC);
      return;
    }

    let coords = routeData.coordinates;

    // Trim route behind user during active navigation.
    // Uses closestSegmentIndex from the store (computed by useNavigationTracking)
    // instead of recomputing closestSegmentOnRoute here.
    if (navigating) {
      const userLocation = useAppStore.getState().userLocation;
      if (userLocation) {
        coords = trimRouteAhead(
          coords,
          closestSegmentIndex,
          userLocation.lng,
          userLocation.lat,
        );
      }
    }

    source.setData({
      type: "Feature",
      geometry: { type: "LineString", coordinates: coords },
      properties: {},
    } as GeoJSON.Feature);

    // Fit map to route bounds only when not actively navigating
    if (!navigating) {
      const bounds = new maplibregl.LngLatBounds();
      for (const c of routeData.coordinates) {
        bounds.extend(c);
      }
      map.fitBounds(bounds, { padding: 80, maxZoom: 16, duration: 1000 });
    }
  }, [routeData, navigating, closestSegmentIndex]);
}
