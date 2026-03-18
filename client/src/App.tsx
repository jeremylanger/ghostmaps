import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CDPProvider } from './lib/cdp'
import Map from './components/Map'
import SearchBar from './components/SearchBar'
import PlacePanel from './components/PlacePanel'
import LocateButton from './components/LocateButton'
import AuthButton from './components/AuthButton'
import ReviewForm from './components/ReviewForm'
import NavigationPanel from './components/NavigationPanel'
import RegisterSchema from './components/RegisterSchema'
import PrivacyPage from './components/PrivacyPage'
import { useAppStore } from './store'
import './App.css'

const queryClient = new QueryClient()

function LocationPrompt() {
  const userLocation = useAppStore((s) => s.userLocation)
  const [dismissed, setDismissed] = useState(false)
  const [locating, setLocating] = useState(false)

  if (userLocation || dismissed) return null

  return (
    <div className="location-prompt">
      <span>{locating ? 'Getting location...' : 'Enable location for nearby results'}</span>
      {!locating && (
        <button
          className="location-prompt-btn"
          onClick={() => {
            setLocating(true)
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                useAppStore.getState().setUserLocation({
                  lat: pos.coords.latitude,
                  lng: pos.coords.longitude,
                })
              },
              () => {
                setLocating(false)
                setDismissed(true)
              },
              { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
            )
          }}
        >
          Allow
        </button>
      )}
      <button className="location-prompt-dismiss" onClick={() => setDismissed(true)}>
        &times;
      </button>
    </div>
  )
}

function AppContent() {
  const selectedPlace = useAppStore((s) => s.selectedPlace)
  const showReviewForm = useAppStore((s) => s.showReviewForm)
  const routeData = useAppStore((s) => s.routeData)
  const setShowPrivacy = useAppStore((s) => s.setShowPrivacy)

  return (
    <div className="app">
      <Map />
      <SearchBar />
      <LocationPrompt />
      <div className="auth-container">
        <AuthButton />
      </div>
      <button
        className="privacy-btn"
        onClick={() => setShowPrivacy(true)}
        title="Privacy Comparison"
      >
        Privacy
      </button>
      {selectedPlace && !routeData && <PlacePanel />}
      {selectedPlace && showReviewForm && <ReviewForm />}
      {routeData && <NavigationPanel />}
      <RegisterSchema />
      <LocateButton />
      <PrivacyPage />
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CDPProvider>
        <AppContent />
      </CDPProvider>
    </QueryClientProvider>
  )
}

export default App
