import { useRef, useEffect } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useAppStore } from '../store'
import type { Place } from '../types'

const INITIAL_CENTER: [number, number] = [-118.2437, 34.0522] // LA
const INITIAL_ZOOM = 13
const SOURCE_ID = 'poi-results'
const CIRCLE_LAYER = 'poi-circles'
const CIRCLE_BORDER_LAYER = 'poi-circles-border'
const SELECTED_LAYER = 'poi-selected'
const SELECTED_BORDER_LAYER = 'poi-selected-border'
const ROUTE_SOURCE = 'route-line'
const ROUTE_LAYER = 'route-line-layer'
const ROUTE_CASING_LAYER = 'route-line-casing'

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

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const userMarkerRef = useRef<maplibregl.Marker | null>(null)
  const initRef = useRef(false)
  const layersReady = useRef(false)
  const watchIdRef = useRef<number | null>(null)
  const rerouteAbortRef = useRef<AbortController | null>(null)

  const searchResults = useAppStore((s) => s.searchResults)
  const selectedPlace = useAppStore((s) => s.selectedPlace)
  const userLocation = useAppStore((s) => s.userLocation)
  const flyTo = useAppStore((s) => s.flyTo)
  const selectPlace = useAppStore((s) => s.selectPlace)
  const routeData = useAppStore((s) => s.routeData)
  const navigating = useAppStore((s) => s.navigating)

  // Keep a ref for click handlers
  const searchResultsRef = useRef<Place[]>([])
  searchResultsRef.current = searchResults
  const selectPlaceRef = useRef(selectPlace)
  selectPlaceRef.current = selectPlace

  // Initialize map
  useEffect(() => {
    if (initRef.current || !mapContainer.current) return
    initRef.current = true

    const container = mapContainer.current
    const styleUrl = `https://api.maptiler.com/maps/streets-v2/style.json?key=${import.meta.env.VITE_MAPTILER_KEY || 'cNjmhoHsVnBLG2X16UtK'}`

    // Fetch style and lower POI minzoom so labels appear earlier
    const initMap = async () => {
      let style: any = styleUrl
      try {
        const res = await fetch(styleUrl)
        const json = await res.json()
        for (const layer of json.layers || []) {
          // POI label layers typically have "poi" or "place" in the id
          if (layer.type === 'symbol' && /poi/i.test(layer.id)) {
            layer.minzoom = Math.min(layer.minzoom ?? 14, 12)
          }
        }
        style = json
      } catch {
        // Fall back to URL if fetch fails
      }

      const map = new maplibregl.Map({
        container,
        style,
        center: INITIAL_CENTER,
        zoom: INITIAL_ZOOM,
        attributionControl: false,
      })

      // Request user location and fly to it
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          useAppStore.setState({ userLocation: loc })
          map.flyTo({ center: [loc.lng, loc.lat], zoom: INITIAL_ZOOM, duration: 1200 })
        },
        () => { /* geolocation denied — stay on default center */ },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
      )

      map.addControl(new maplibregl.NavigationControl(), 'top-right')

      // Map OSM class/subclass names to Maki sprite icon names
      const ICON_ALIASES: Record<string, string> = {
        archery: 'pitch', athletics: 'pitch', atm: 'bank',
        australian_football: 'american_football', badminton: 'tennis',
        basin: 'water', beachvolleyball: 'pitch', bicycle_parking: 'bicycle',
        billiards: 'pitch', bmx: 'bicycle', bollard: 'roadblock',
        border_control: 'roadblock', boules: 'pitch', bowls: 'pitch',
        boxing: 'pitch', brownfield: 'industry', canadian_football: 'american_football',
        canoe: 'swimming', chess: 'pitch', climbing: 'mountain',
        climbing_adventure: 'mountain', cricket_nets: 'cricket', croquet: 'pitch',
        curling: 'pitch', cycle_barrier: 'roadblock', cycling: 'bicycle',
        disc_golf: 'golf', diving: 'swimming', dog_racing: 'dog_park',
        equestrian: 'pitch', escape_game: 'amusement_park', fatsal: 'soccer',
        ferry_terminal: 'ferry', field_hockey: 'pitch', free_flying: 'aerialway',
        gaelic_games: 'pitch', gate: 'roadblock', gymnastics: 'pitch',
        hackerspace: 'commercial', handball: 'pitch', hockey: 'pitch',
        horse_racing: 'pitch', horseshoes: 'pitch', ice_hockey: 'pitch',
        ice_rink: 'swimming', ice_stock: 'pitch', judo: 'pitch',
        karting: 'car', korfball: 'pitch', lift_gate: 'roadblock',
        long_jump: 'pitch', model_aerodrome: 'airfield', motocross: 'car',
        motor: 'car', motorcycle_parking: 'parking', multi: 'pitch',
        netball: 'basketball', office: 'commercial', orienteering: 'pitch',
        paddle_tennis: 'tennis', paintball: 'pitch', paragliding: 'aerialway',
        pelota: 'pitch', racquet: 'tennis', rail: 'railway',
        rc_car: 'pitch', recycling: 'waste_basket', reservoir: 'water',
        rowing: 'swimming', rugby: 'american_football', rugby_league: 'american_football',
        rugby_union: 'american_football', running: 'pitch', sailing: 'harbor',
        sally_port: 'entrance', scuba_diving: 'swimming', shooting: 'danger',
        shooting_range: 'danger', skateboard: 'pitch', skating: 'pitch',
        sports_centre: 'stadium', stile: 'roadblock', surfing: 'swimming',
        swimming_pool: 'swimming', table_soccer: 'pitch', table_tennis: 'tennis',
        team_handball: 'pitch', theme_park: 'amusement_park', toboggan: 'skiing',
        toll_booth: 'roadblock', volleyball: 'pitch', water_park: 'swimming',
        water_ski: 'swimming', winter_sports: 'skiing', yoga: 'place_of_worship',
      }

      map.on('styleimagemissing', (e) => {
        const alias = ICON_ALIASES[e.id]
        if (alias && map.hasImage(alias)) {
          const img = map.style.getImage(alias)
          if (img) map.addImage(e.id, img.data)
        }
      })

      map.on('load', () => {
        // POI source + layers
        map.addSource(SOURCE_ID, {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        })

        map.addLayer({
          id: CIRCLE_BORDER_LAYER, type: 'circle', source: SOURCE_ID,
          filter: ['!', ['get', 'selected']],
          paint: { 'circle-radius': 10, 'circle-color': '#ffffff' },
        })
        map.addLayer({
          id: CIRCLE_LAYER, type: 'circle', source: SOURCE_ID,
          filter: ['!', ['get', 'selected']],
          paint: { 'circle-radius': 7, 'circle-color': '#e53e3e' },
        })
        map.addLayer({
          id: SELECTED_BORDER_LAYER, type: 'circle', source: SOURCE_ID,
          filter: ['get', 'selected'],
          paint: { 'circle-radius': 16, 'circle-color': 'rgba(66, 133, 244, 0.25)' },
        })
        map.addLayer({
          id: SELECTED_LAYER, type: 'circle', source: SOURCE_ID,
          filter: ['get', 'selected'],
          paint: {
            'circle-radius': 10, 'circle-color': '#4285f4',
            'circle-stroke-width': 3, 'circle-stroke-color': '#ffffff',
          },
        })

        // Route source + layers
        map.addSource(ROUTE_SOURCE, {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        })

        map.addLayer({
          id: ROUTE_CASING_LAYER,
          type: 'line',
          source: ROUTE_SOURCE,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#1a56db', 'line-width': 8, 'line-opacity': 0.4 },
        }, CIRCLE_BORDER_LAYER) // Insert below POI circles

        map.addLayer({
          id: ROUTE_LAYER,
          type: 'line',
          source: ROUTE_SOURCE,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#4285f4', 'line-width': 5 },
        }, CIRCLE_BORDER_LAYER)

        layersReady.current = true

        const handleClick = (e: maplibregl.MapLayerMouseEvent) => {
          const feature = e.features?.[0]
          if (!feature) return
          const place = searchResultsRef.current.find((p) => p.id === feature.properties?.id)
          if (place) selectPlaceRef.current(place)
        }

        map.on('click', CIRCLE_LAYER, handleClick)
        map.on('click', SELECTED_LAYER, handleClick)

        for (const layer of [CIRCLE_LAYER, SELECTED_LAYER]) {
          map.on('mouseenter', layer, () => { map.getCanvas().style.cursor = 'pointer' })
          map.on('mouseleave', layer, () => { map.getCanvas().style.cursor = '' })
        }
      })

      mapRef.current = map
    }

    initMap().catch((err) => console.error('MapLibre init failed:', err))
  }, [])

  // Fly to location — offset center upward so pin is visible above the bottom sheet
  useEffect(() => {
    if (!flyTo || !mapRef.current) return
    const map = mapRef.current
    const doFly = () => {
      // If a place is selected, the bottom sheet covers ~50% of screen.
      // Offset the center so the pin appears in the top portion of the visible map.
      const hasSheet = !!useAppStore.getState().selectedPlace
      const padding = hasSheet
        ? { top: 80, bottom: map.getContainer().clientHeight * 0.5, left: 40, right: 40 }
        : { top: 80, bottom: 40, left: 40, right: 40 }
      map.flyTo({
        center: [flyTo.lng, flyTo.lat],
        zoom: hasSheet ? 15 : 17,
        duration: 1200,
        padding,
      })
    }
    if (map.getCanvas()) doFly()
    else map.on('load', doFly)
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

  // Update GeoJSON source
  useEffect(() => {
    const map = mapRef.current
    if (!map || !layersReady.current) return
    const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined
    if (!source) return

    source.setData(placesToGeoJSON(searchResults, selectedPlace?.id))

    if (searchResults.length && !selectedPlace) {
      const bounds = new maplibregl.LngLatBounds()
      searchResults.forEach((p) => bounds.extend([p.longitude, p.latitude]))
      if (userLocation) bounds.extend([userLocation.lng, userLocation.lat])
      map.fitBounds(bounds, { padding: 80, maxZoom: 15, duration: 1000 })
    }
  }, [searchResults, selectedPlace, userLocation])

  // Update route line
  useEffect(() => {
    const map = mapRef.current
    if (!map || !layersReady.current) return
    const source = map.getSource(ROUTE_SOURCE) as maplibregl.GeoJSONSource | undefined
    if (!source) return

    if (!routeData) {
      source.setData({ type: 'FeatureCollection', features: [] })
      return
    }

    source.setData({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: routeData.coordinates,
      },
      properties: {},
    } as GeoJSON.Feature)

    // Fit map to route bounds
    const bounds = new maplibregl.LngLatBounds()
    routeData.coordinates.forEach((c) => bounds.extend(c))
    map.fitBounds(bounds, { padding: 80, maxZoom: 16, duration: 1000 })
  }, [routeData])

  // GPS tracking during navigation
  useEffect(() => {
    if (!navigating) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
      return
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }

        // Update user marker without triggering flyTo
        useAppStore.setState({ userLocation: loc })

        // Update user marker on map
        if (userMarkerRef.current) {
          userMarkerRef.current.setLngLat([loc.lng, loc.lat])
        }

        // Center map on user during navigation
        if (mapRef.current) {
          mapRef.current.easeTo({
            center: [loc.lng, loc.lat],
            zoom: 17,
            duration: 500,
          })
        }

        const store = useAppStore.getState()
        const route = store.routeData
        if (route) {
          // Find closest point on route polyline
          let closestRouteDist = Infinity
          let closestPointIdx = 0
          route.coordinates.forEach((coord, i) => {
            const dx = coord[0] - loc.lng
            const dy = coord[1] - loc.lat
            const dist = dx * dx + dy * dy
            if (dist < closestRouteDist) {
              closestRouteDist = dist
              closestPointIdx = i
            }
          })

          // Off-route detection: ~50m threshold (approx 0.00045 degrees)
          const OFF_ROUTE_THRESHOLD = 0.00045 * 0.00045
          if (closestRouteDist > OFF_ROUTE_THRESHOLD && !store.rerouting) {
            store.setRerouting(true)
            const selectedPlace = store.selectedPlace
            if (selectedPlace) {
              const controller = new AbortController()
              rerouteAbortRef.current = controller
              fetch('/api/route', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  fromLat: loc.lat,
                  fromLng: loc.lng,
                  toLat: selectedPlace.latitude,
                  toLng: selectedPlace.longitude,
                }),
                signal: controller.signal,
              })
                .then((res) => res.json())
                .then((newRoute) => {
                  useAppStore.setState({ routeData: newRoute, rerouting: false })
                })
                .catch(() => {
                  useAppStore.getState().setRerouting(false)
                })
            }
          }

          // Find closest instruction
          let closestIdx = 0
          let closestInstDist = Infinity
          route.instructions.forEach((inst, i) => {
            const dx = inst.point[0] - loc.lng
            const dy = inst.point[1] - loc.lat
            const dist = dx * dx + dy * dy
            if (dist < closestInstDist) {
              closestInstDist = dist
              closestIdx = i
            }
          })
          // Only update store if values actually changed (avoid unnecessary re-renders)
          if (closestIdx !== store.currentInstructionIndex) {
            store.setCurrentInstructionIndex(closestIdx)
          }

          // Update speed limit based on position along route
          if (route.speedLimits && route.speedLimits.length > 0) {
            const section = route.speedLimits.find(
              (s) => closestPointIdx >= s.startPointIndex && closestPointIdx <= s.endPointIndex
            )
            const newLimit = section ? section.maxSpeedMph : null
            if (newLimit !== store.currentSpeedLimit) {
              store.setCurrentSpeedLimit(newLimit)
            }
          }

          // Update lane guidance based on position along route
          if (route.laneGuidance && route.laneGuidance.length > 0) {
            const laneSection = route.laneGuidance.find(
              (s) => closestPointIdx >= s.startPointIndex && closestPointIdx <= s.endPointIndex
            )
            const newLanes = laneSection ? laneSection.lanes : null
            if (newLanes !== store.currentLanes) {
              store.setCurrentLanes(newLanes)
            }
          } else if (store.currentLanes !== null) {
            store.setCurrentLanes(null)
          }
        }
      },
      (err) => console.error('GPS error:', err),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    )

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
      if (rerouteAbortRef.current) {
        rerouteAbortRef.current.abort()
        rerouteAbortRef.current = null
      }
    }
  }, [navigating])

  return <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
}
