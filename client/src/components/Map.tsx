import maplibregl from "maplibre-gl";
import { useEffect, useRef } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import { useMapInit } from "../hooks/useMapInit";
import { useNavigationTracking } from "../hooks/useNavigationTracking";
import { useRouteDisplay } from "../hooks/useRouteDisplay";
import { SOURCE_ID } from "../lib/map-constants";
import { createUserDotElement } from "../lib/map-markers";
import { useAppStore } from "../store";
import type { Place } from "../types";

function placesToGeoJSON(places: Place[], selectedId?: string) {
  return {
    type: "FeatureCollection" as const,
    features: places.map((p) => ({
      type: "Feature" as const,
      id: p.id,
      geometry: {
        type: "Point" as const,
        coordinates: [p.longitude, p.latitude],
      },
      properties: {
        id: p.id,
        name: p.name,
        category: p.category,
        selected: p.id === selectedId,
      },
    })),
  };
}

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);

  const { mapRef, layersReady } = useMapInit(mapContainer);

  const searchResults = useAppStore((s) => s.searchResults);
  const selectedPlace = useAppStore((s) => s.selectedPlace);
  const userLocation = useAppStore((s) => s.userLocation);
  const flyTo = useAppStore((s) => s.flyTo);

  useNavigationTracking(mapRef, userMarkerRef);
  useRouteDisplay(mapRef, layersReady);

  // Fly to location
  useEffect(() => {
    if (!flyTo || !mapRef.current) return;
    const map = mapRef.current;
    const doFly = () => {
      const hasSheet = !!useAppStore.getState().selectedPlace;
      const padding = hasSheet
        ? {
            top: 80,
            bottom: map.getContainer().clientHeight * 0.5,
            left: 40,
            right: 40,
          }
        : { top: 80, bottom: 40, left: 40, right: 40 };
      map.flyTo({
        center: [flyTo.lng, flyTo.lat],
        zoom: hasSheet ? 15 : 17,
        duration: 600,
        padding,
      });
    };
    if (map.getCanvas()) doFly();
    else map.on("load", doFly);
  }, [flyTo]);

  // User location marker
  useEffect(() => {
    if (!userLocation || !mapRef.current) return;
    if (userMarkerRef.current) {
      userMarkerRef.current.setLngLat([userLocation.lng, userLocation.lat]);
      return;
    }
    const el = createUserDotElement();
    userMarkerRef.current = new maplibregl.Marker({ element: el })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(mapRef.current);
  }, [userLocation]);

  // Update POI GeoJSON source
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !layersReady.current) return;
    const source = map.getSource(SOURCE_ID) as
      | maplibregl.GeoJSONSource
      | undefined;
    if (!source) return;

    source.setData(placesToGeoJSON(searchResults, selectedPlace?.id));

    if (searchResults.length && !selectedPlace) {
      const bounds = new maplibregl.LngLatBounds();
      for (const p of searchResults) {
        bounds.extend([p.longitude, p.latitude]);
      }
      if (userLocation) bounds.extend([userLocation.lng, userLocation.lat]);
      map.fitBounds(bounds, { padding: 80, maxZoom: 15, duration: 1000 });
    }
  }, [searchResults, selectedPlace, userLocation]);

  return <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />;
}
