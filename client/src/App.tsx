import { useState, useCallback } from 'react'
import type { Place } from './types'
import Map from './components/Map'
import SearchBar from './components/SearchBar'
import PlacePanel from './components/PlacePanel'
import LocateButton from './components/LocateButton'
import './App.css'

interface LatLng {
  lat: number
  lng: number
}

function App() {
  const [searchResults, setSearchResults] = useState<Place[]>([])
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [userLocation, setUserLocation] = useState<LatLng | null>(null)
  const [mapCenter, setMapCenter] = useState<LatLng | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({ q: query })
      if (userLocation) {
        params.set('lat', String(userLocation.lat))
        params.set('lng', String(userLocation.lng))
      }

      const res = await fetch(`/api/search?${params}`)
      if (!res.ok) throw new Error('Search failed')

      const data = await res.json()
      setSearchResults(data.results || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }, [userLocation])

  const handleSelectPlace = useCallback((place: Place) => {
    setSelectedPlace(place)
    setMapCenter({ lng: place.longitude, lat: place.latitude })
  }, [])

  const handleLocate = useCallback((location: LatLng) => {
    setUserLocation(location)
    setMapCenter(location)
  }, [])

  const handleClosePanel = useCallback(() => {
    setSelectedPlace(null)
  }, [])

  const handleClearSearch = useCallback(() => {
    setSearchResults([])
    setSelectedPlace(null)
  }, [])

  return (
    <div className="app">
      <Map
        userLocation={userLocation}
        searchResults={searchResults}
        selectedPlace={selectedPlace}
        onSelectPlace={handleSelectPlace}
        flyTo={mapCenter}
      />
      <SearchBar
        onSearch={handleSearch}
        results={searchResults}
        loading={loading}
        error={error}
        onSelectResult={handleSelectPlace}
        onClear={handleClearSearch}
      />
      {selectedPlace && (
        <PlacePanel place={selectedPlace} onClose={handleClosePanel} />
      )}
      <LocateButton onLocate={handleLocate} />
    </div>
  )
}

export default App
