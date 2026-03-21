import maplibregl from "maplibre-gl";
import { useEffect, useRef } from "react";
import {
  CIRCLE_BORDER_LAYER,
  CIRCLE_LAYER,
  ICON_ALIASES,
  INITIAL_CENTER,
  INITIAL_ZOOM,
  ROUTE_CASING_LAYER,
  ROUTE_LAYER,
  ROUTE_SOURCE,
  SELECTED_BORDER_LAYER,
  SELECTED_LAYER,
  SOURCE_ID,
} from "../lib/map-constants";
import { THEME } from "../lib/theme";
import { useAppStore } from "../store";
import type { Place } from "../types";

export function useMapInit(
  containerRef: React.RefObject<HTMLDivElement | null>,
) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const initRef = useRef(false);
  const layersReady = useRef(false);
  const searchResultsRef = useRef<Place[]>([]);
  const selectPlaceRef = useRef(useAppStore.getState().selectPlace);

  // Keep refs current
  const searchResults = useAppStore((s) => s.searchResults);
  searchResultsRef.current = searchResults;
  selectPlaceRef.current = useAppStore((s) => s.selectPlace);

  useEffect(() => {
    if (initRef.current || !containerRef.current) return;
    initRef.current = true;

    const container = containerRef.current;
    const styleUrl = `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${import.meta.env.VITE_MAPTILER_KEY || "cNjmhoHsVnBLG2X16UtK"}`;

    const initMap = async () => {
      let style: any = styleUrl;
      try {
        const res = await fetch(styleUrl);
        const json = await res.json();
        for (const layer of json.layers || []) {
          if (layer.type === "symbol" && /poi/i.test(layer.id)) {
            layer.minzoom = Math.min(layer.minzoom ?? 14, 12);
          }
        }
        style = json;
      } catch (err) {
        console.error("Map style fetch failed, using URL fallback:", err);
      }

      const map = new maplibregl.Map({
        container,
        style,
        center: INITIAL_CENTER,
        zoom: INITIAL_ZOOM,
        attributionControl: false,
      });

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          useAppStore.setState({ userLocation: loc });
          map.flyTo({
            center: [loc.lng, loc.lat],
            zoom: INITIAL_ZOOM,
            duration: 1200,
          });
        },
        (err) => console.error("Geolocation error:", err.message),
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 },
      );

      map.addControl(new maplibregl.NavigationControl(), "bottom-right");

      map.on("styleimagemissing", (e) => {
        const alias = ICON_ALIASES[e.id];
        if (alias && map.hasImage(alias)) {
          const img = map.style.getImage(alias);
          if (img) map.addImage(e.id, img.data);
        }
      });

      map.on("load", () => {
        addLayers(map);
        layersReady.current = true;

        const handleClick = (e: maplibregl.MapLayerMouseEvent) => {
          const feature = e.features?.[0];
          if (!feature) return;
          const place = searchResultsRef.current.find(
            (p) => p.id === feature.properties?.id,
          );
          if (place) selectPlaceRef.current(place);
        };

        map.on("click", CIRCLE_LAYER, handleClick);
        map.on("click", SELECTED_LAYER, handleClick);

        for (const layer of [CIRCLE_LAYER, SELECTED_LAYER]) {
          map.on("mouseenter", layer, () => {
            map.getCanvas().style.cursor = "pointer";
          });
          map.on("mouseleave", layer, () => {
            map.getCanvas().style.cursor = "";
          });
        }
      });

      mapRef.current = map;
    };

    initMap().catch((err) => console.error("MapLibre init failed:", err));
  }, []);

  return { mapRef, layersReady };
}

function addLayers(map: maplibregl.Map) {
  map.addSource(SOURCE_ID, {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] },
  });

  map.addLayer({
    id: CIRCLE_BORDER_LAYER,
    type: "circle",
    source: SOURCE_ID,
    filter: ["!", ["get", "selected"]],
    paint: { "circle-radius": 10, "circle-color": `${THEME.cyan}26` },
  });
  map.addLayer({
    id: CIRCLE_LAYER,
    type: "circle",
    source: SOURCE_ID,
    filter: ["!", ["get", "selected"]],
    paint: {
      "circle-radius": 7,
      "circle-color": THEME.cyan,
      "circle-stroke-width": 2,
      "circle-stroke-color": THEME.void,
    },
  });
  map.addLayer({
    id: SELECTED_BORDER_LAYER,
    type: "circle",
    source: SOURCE_ID,
    filter: ["get", "selected"],
    paint: { "circle-radius": 18, "circle-color": `${THEME.cyan}33` },
  });
  map.addLayer({
    id: SELECTED_LAYER,
    type: "circle",
    source: SOURCE_ID,
    filter: ["get", "selected"],
    paint: {
      "circle-radius": 10,
      "circle-color": THEME.cyan,
      "circle-stroke-width": 3,
      "circle-stroke-color": THEME.void,
    },
  });

  map.addSource(ROUTE_SOURCE, {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] },
  });
  map.addLayer(
    {
      id: ROUTE_CASING_LAYER,
      type: "line",
      source: ROUTE_SOURCE,
      layout: { "line-join": "round", "line-cap": "round" },
      paint: {
        "line-color": `${THEME.cyan}33`,
        "line-width": 10,
        "line-opacity": 0.6,
      },
    },
    CIRCLE_BORDER_LAYER,
  );
  map.addLayer(
    {
      id: ROUTE_LAYER,
      type: "line",
      source: ROUTE_SOURCE,
      layout: { "line-join": "round", "line-cap": "round" },
      paint: { "line-color": THEME.cyan, "line-width": 4 },
    },
    CIRCLE_BORDER_LAYER,
  );
}
