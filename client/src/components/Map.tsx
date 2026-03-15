import { useRef, useEffect } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { Place } from '../types'

interface LatLng {
  lat: number
  lng: number
}

interface MapProps {
  userLocation: LatLng | null
  searchResults: Place[]
  selectedPlace: Place | null
  onSelectPlace: (place: Place) => void
  flyTo: LatLng | null
}

const INITIAL_CENTER: [number, number] = [-118.2437, 34.0522] // LA
const INITIAL_ZOOM = 13
const SOURCE_ID = 'poi-results'
const CIRCLE_LAYER = 'poi-circles'
const CIRCLE_BORDER_LAYER = 'poi-circles-border'
const SELECTED_LAYER = 'poi-selected'
const SELECTED_BORDER_LAYER = 'poi-selected-border'

function placesToGeoJSON(places: Place[], selectedId?: string) {
  return {
    type: 'FeatureCollection' as const,
    features: places.map((p) => ({
      type: 'Feature' as const,
      id: p.id,
      geometry: {
        type: 'Point' as const,
        coordinates: [p.longitude, p.latitude],
      },
      properties: {
        id: p.id,
        name: p.name,
        category: p.category,
        selected: p.id === selectedId,
      },
    })),
  }
}

export default function Map({ userLocation, searchResults, selectedPlace, onSelectPlace, flyTo }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const userMarkerRef = useRef<maplibregl.Marker | null>(null)
  const initRef = useRef(false)
  const searchResultsRef = useRef<Place[]>([])
  const layersReady = useRef(false)

  // Keep a ref to searchResults for click handler
  searchResultsRef.current = searchResults

  // Initialize map
  useEffect(() => {
    if (initRef.current || !mapContainer.current) return
    initRef.current = true

    try {
      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center: INITIAL_CENTER,
        zoom: INITIAL_ZOOM,
        attributionControl: false,
      })

      map.addControl(new maplibregl.NavigationControl(), 'top-right')

      map.on('load', () => {
        // Add empty source
        map.addSource(SOURCE_ID, {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        })

        // Unselected circles — white border
        map.addLayer({
          id: CIRCLE_BORDER_LAYER,
          type: 'circle',
          source: SOURCE_ID,
          filter: ['!', ['get', 'selected']],
          paint: {
            'circle-radius': 10,
            'circle-color': '#ffffff',
          },
        })

        map.addLayer({
          id: CIRCLE_LAYER,
          type: 'circle',
          source: SOURCE_ID,
          filter: ['!', ['get', 'selected']],
          paint: {
            'circle-radius': 7,
            'circle-color': '#e53e3e',
          },
        })

        // Selected circle — larger, blue, with glow
        map.addLayer({
          id: SELECTED_BORDER_LAYER,
          type: 'circle',
          source: SOURCE_ID,
          filter: ['get', 'selected'],
          paint: {
            'circle-radius': 16,
            'circle-color': 'rgba(66, 133, 244, 0.25)',
          },
        })

        map.addLayer({
          id: SELECTED_LAYER,
          type: 'circle',
          source: SOURCE_ID,
          filter: ['get', 'selected'],
          paint: {
            'circle-radius': 10,
            'circle-color': '#4285f4',
            'circle-stroke-width': 3,
            'circle-stroke-color': '#ffffff',
          },
        })

        layersReady.current = true

        // Click handler
        map.on('click', CIRCLE_LAYER, (e) => {
          const feature = e.features?.[0]
          if (!feature) return
          const place = searchResultsRef.current.find(
            (p) => p.id === feature.properties?.id
          )
          if (place) onSelectPlace(place)
        })

        map.on('click', SELECTED_LAYER, (e) => {
          const feature = e.features?.[0]
          if (!feature) return
          const place = searchResultsRef.current.find(
            (p) => p.id === feature.properties?.id
          )
          if (place) onSelectPlace(place)
        })

        // Cursor
        map.on('mouseenter', CIRCLE_LAYER, () => {
          map.getCanvas().style.cursor = 'pointer'
        })
        map.on('mouseleave', CIRCLE_LAYER, () => {
          map.getCanvas().style.cursor = ''
        })
        map.on('mouseenter', SELECTED_LAYER, () => {
          map.getCanvas().style.cursor = 'pointer'
        })
        map.on('mouseleave', SELECTED_LAYER, () => {
          map.getCanvas().style.cursor = ''
        })
      })

      mapRef.current = map
    } catch (err) {
      console.error('MapLibre init failed:', err)
    }
  }, [onSelectPlace])

  // Fly to location
  useEffect(() => {
    if (!flyTo || !mapRef.current) return
    const map = mapRef.current
    const doFly = () => {
      map.flyTo({
        center: [flyTo.lng, flyTo.lat],
        zoom: 17,
        duration: 1200,
      })
    }
    if (map.getCanvas()) {
      doFly()
    } else {
      map.on('load', doFly)
    }
  }, [flyTo])

  // User location marker (DOM marker is fine — it doesn't move with flyTo)
  useEffect(() => {
    if (!userLocation || !mapRef.current) return

    if (userMarkerRef.current) {
      userMarkerRef.current.setLngLat([userLocation.lng, userLocation.lat])
      return
    }

    const el = document.createElement('div')
    el.className = 'user-marker'

    userMarkerRef.current = new maplibregl.Marker({ element: el })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(mapRef.current)
  }, [userLocation])

  // Update GeoJSON source when results or selection changes
  useEffect(() => {
    const map = mapRef.current
    if (!map || !layersReady.current) return

    const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined
    if (!source) return

    const geojson = placesToGeoJSON(searchResults, selectedPlace?.id)
    source.setData(geojson)

    // Fit bounds when showing new results (not when just selecting)
    if (searchResults.length && !selectedPlace) {
      const bounds = new maplibregl.LngLatBounds()
      searchResults.forEach((p) => bounds.extend([p.longitude, p.latitude]))
      if (userLocation) bounds.extend([userLocation.lng, userLocation.lat])
      map.fitBounds(bounds, { padding: 80, maxZoom: 15, duration: 1000 })
    }
  }, [searchResults, selectedPlace, userLocation])

  return <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
}
