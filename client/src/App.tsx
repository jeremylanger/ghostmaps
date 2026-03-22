import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MapPin, Shield } from "lucide-react";
import { useRef, useState } from "react";
import LocateButton from "./components/LocateButton";
import Map from "./components/Map";
import NavigationPanel from "./components/NavigationPanel";
import PlacePanel from "./components/PlacePanel";
import PrivacyPage from "./components/PrivacyPage";
import RegisterSchema from "./components/RegisterSchema";
import ReviewForm from "./components/ReviewForm";
import SearchBar from "./components/SearchBar";
import { Button } from "./components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./components/ui/dialog";
import { CDPProvider } from "./lib/cdp";
import { useAppStore } from "./store";

const queryClient = new QueryClient();

function WelcomeDialog() {
  const userLocation = useAppStore((s) => s.userLocation);
  const [open, setOpen] = useState(true);
  const [locating, setLocating] = useState(false);
  const [checking, setChecking] = useState(true);
  const checkedRef = useRef(false);

  if (!checkedRef.current) {
    checkedRef.current = true;
    navigator.permissions?.query({ name: "geolocation" }).then((result) => {
      if (result.state === "granted") {
        setOpen(false);
      }
      setChecking(false);
    }).catch(() => {
      setChecking(false);
    });
  }

  if (checking || userLocation || !open) return null;

  const handleAllow = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        useAppStore.getState().setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setOpen(false);
      },
      () => {
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  };

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        className="bg-[#020912] border-edge text-bone max-w-sm"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="items-center">
          <img
            src="/logo.png"
            alt="Ghost Maps"
            className="size-32"
          />
          <DialogTitle className="text-2xl font-display text-bone">
            Ghost Maps
          </DialogTitle>
          <DialogDescription className="text-blue-gray text-center">
            Private AI-powered maps with on-chain reviews
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-2.5 bg-surface-raised rounded-lg p-3 border border-edge/50">
          <Shield className="size-4 text-cyan shrink-0 mt-0.5" />
          <p className="text-sm text-blue-gray leading-relaxed">
            Your location is never stored or logged. It&apos;s sent
            only to find nearby places and is discarded after each request.
          </p>
        </div>

        <div className="flex flex-col gap-2 mt-1">
          <Button
            className="w-full bg-cyan text-void hover:bg-cyan/90 font-semibold"
            onClick={handleAllow}
            disabled={locating}
          >
            <MapPin className="size-4 mr-2" />
            {locating ? "Getting location..." : "Enable location"}
          </Button>
          <Button
            variant="ghost"
            className="w-full text-muted hover:text-bone"
            onClick={() => setOpen(false)}
          >
            Skip for now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
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
      <WelcomeDialog />
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
