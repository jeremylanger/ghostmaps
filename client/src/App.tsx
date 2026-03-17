import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CDPProvider } from './lib/cdp'
import Map from './components/Map'
import SearchBar from './components/SearchBar'
import PlacePanel from './components/PlacePanel'
import LocateButton from './components/LocateButton'
import AuthButton from './components/AuthButton'
import ReviewForm from './components/ReviewForm'
import RegisterSchema from './components/RegisterSchema'
import { useAppStore } from './store'
import './App.css'

const queryClient = new QueryClient()

function AppContent() {
  const selectedPlace = useAppStore((s) => s.selectedPlace)
  const showReviewForm = useAppStore((s) => s.showReviewForm)

  return (
    <div className="app">
      <Map />
      <SearchBar />
      <div className="auth-container">
        <AuthButton />
      </div>
      {selectedPlace && <PlacePanel />}
      {selectedPlace && showReviewForm && <ReviewForm />}
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
