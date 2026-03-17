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
import { useAppStore } from './store'
import './App.css'

const queryClient = new QueryClient()

function AppContent() {
  const selectedPlace = useAppStore((s) => s.selectedPlace)
  const showReviewForm = useAppStore((s) => s.showReviewForm)
  const routeData = useAppStore((s) => s.routeData)

  return (
    <div className="app">
      <Map />
      <SearchBar />
      <div className="auth-container">
        <AuthButton />
      </div>
      {selectedPlace && !routeData && <PlacePanel />}
      {selectedPlace && showReviewForm && <ReviewForm />}
      {routeData && <NavigationPanel />}
      <RegisterSchema />
      <LocateButton />
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
