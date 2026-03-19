import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import HamburgerMenu from "./components/HamburgerMenu";
import LocateButton from "./components/LocateButton";
import Map from "./components/Map";
import NavigationPanel from "./components/NavigationPanel";
import PlacePanel from "./components/PlacePanel";
import PrivacyPage from "./components/PrivacyPage";
import RegisterSchema from "./components/RegisterSchema";
import ReviewForm from "./components/ReviewForm";
import SearchBar from "./components/SearchBar";
import { CDPProvider } from "./lib/cdp";
import { useAppStore } from "./store";
import "./App.css";

const queryClient = new QueryClient();

function LocationPrompt() {
  const userLocation = useAppStore((s) => s.userLocation);
  const [dismissed, setDismissed] = useState(false);
  const [locating, setLocating] = useState(false);

  if (userLocation || dismissed) return null;

  return (
    <div className="location-prompt">
      <span>
        {locating
          ? "Getting location..."
          : "Enable location for nearby results"}
      </span>
      {!locating && (
        <button
          className="location-prompt-btn"
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
        </button>
      )}
      <button
        className="location-prompt-dismiss"
        onClick={() => setDismissed(true)}
      >
        &times;
      </button>
    </div>
  );
}

function AppContent() {
  const selectedPlace = useAppStore((s) => s.selectedPlace);
  const showReviewForm = useAppStore((s) => s.showReviewForm);
  const routeData = useAppStore((s) => s.routeData);

  return (
    <div className="app">
      <Map />
      <SearchBar />
      <LocationPrompt />
      <HamburgerMenu />
      {selectedPlace && !routeData && <PlacePanel />}
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
