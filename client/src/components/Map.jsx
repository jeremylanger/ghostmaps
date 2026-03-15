import { useRef, useEffect } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const INITIAL_CENTER = [-118.2437, 34.0522] // LA
const INITIAL_ZOOM = 13

export default function Map({ userLocation, searchResults, selectedPlace, onSelectPlace, flyTo }) {
  const mapContainer = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const userMarkerRef = useRef(null)
  const initRef = useRef(false)

  // Initialize map (handle StrictMode double-mount)
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
      mapRef.current = map
    } catch (err) {
      console.error('MapLibre init failed:', err)
    }
  }, [])

  // Fly to location
  useEffect(() => {
    if (!flyTo || !mapRef.current) return
    mapRef.current.flyTo({
      center: [flyTo.lng, flyTo.lat],
      zoom: 15,
      duration: 1000,
    })
  }, [flyTo])

  // User location marker
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

  // POI markers
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Clear existing markers
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    if (!searchResults.length) return

    // Wait for map to be loaded before adding markers
    const addMarkers = () => {
      const bounds = new maplibregl.LngLatBounds()

      searchResults.forEach((place) => {
        const el = document.createElement('div')
        el.className = 'poi-marker'
        if (selectedPlace && selectedPlace.id === place.id) {
          el.classList.add('selected')
        }

        el.addEventListener('click', () => onSelectPlace(place))

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([place.longitude, place.latitude])
          .addTo(map)

        markersRef.current.push(marker)
        bounds.extend([place.longitude, place.latitude])
      })

      if (userLocation) {
        bounds.extend([userLocation.lng, userLocation.lat])
      }

      if (!selectedPlace) {
        map.fitBounds(bounds, { padding: 80, maxZoom: 15, duration: 1000 })
      }
    }

    if (map.loaded()) {
      addMarkers()
    } else {
      map.on('load', addMarkers)
    }
  }, [searchResults, selectedPlace, onSelectPlace, userLocation])

  return <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
}
