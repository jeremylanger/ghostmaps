import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MapPin, X } from "lucide-react";
import { useState } from "react";
import LocateButton from "./components/LocateButton";
import Map from "./components/Map";
import NavigationPanel from "./components/NavigationPanel";
import PlacePanel from "./components/PlacePanel";
import PrivacyPage from "./components/PrivacyPage";
import RegisterSchema from "./components/RegisterSchema";
import ReviewForm from "./components/ReviewForm";
import SearchBar from "./components/SearchBar";
import { Button } from "./components/ui/button";
import { CDPProvider } from "./lib/cdp";
import { useAppStore } from "./store";

const queryClient = new QueryClient();

function LocationPrompt() {
  const userLocation = useAppStore((s) => s.userLocation);
  const [dismissed, setDismissed] = useState(false);
  const [locating, setLocating] = useState(false);

  if (userLocation || dismissed) return null;

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 bg-surface/95 backdrop-blur-md border border-edge rounded-xl shadow-panel px-3.5 py-2.5 flex items-center gap-2.5 text-sm text-bone whitespace-nowrap animate-decloak">
      <MapPin className="size-4 text-cyan" />
      <span>
        {locating
          ? "Getting location..."
          : "Enable location for nearby results"}
      </span>
      {!locating && (
        <Button
          size="sm"
          onClick={() => {
            setLocating(true);
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                useAppStore.getState().setUserLocation({
                  lat: pos.coords.latitude,
                  lng: pos.coords.longitude,
                });
              },
              () => {
                setLocating(false);
                setDismissed(true);
              },
              { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
            );
          }}
        >
          Allow
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon-xs"
        className="text-muted hover:text-bone"
        onClick={() => setDismissed(true)}
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}

function AppContent() {
  const selectedPlace = useAppStore((s) => s.selectedPlace);
  const showReviewForm = useAppStore((s) => s.showReviewForm);
  const routeData = useAppStore((s) => s.routeData);

  return (
    <div className="absolute inset-0">
      <Map />
      <SearchBar />
      <LocationPrompt />
      {!routeData && <PlacePanel />}
      {selectedPlace && showReviewForm && <ReviewForm />}
      {routeData && <NavigationPanel />}
      <RegisterSchema />
      <LocateButton />
      <PrivacyPage />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CDPProvider>
        <AppContent />
      </CDPProvider>
    </QueryClientProvider>
  );
}

export default App;
