import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Map from './components/Map'
import SearchBar from './components/SearchBar'
import PlacePanel from './components/PlacePanel'
import LocateButton from './components/LocateButton'
import { useAppStore } from './store'
import './App.css'

const queryClient = new QueryClient()

function AppContent() {
  const selectedPlace = useAppStore((s) => s.selectedPlace)

  return (
    <div className="app">
      <Map />
      <SearchBar />
      {selectedPlace && <PlacePanel />}
      <LocateButton />
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  )
}

export default App
