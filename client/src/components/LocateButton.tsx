import { Crosshair } from "lucide-react";
import { useCallback, useState } from "react";
import { useAppStore } from "../store";

export default function LocateButton() {
  const [active, setActive] = useState(false);
  const setUserLocation = useAppStore((s) => s.setUserLocation);

  const handleClick = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    // TEMP: Override for screenshots
    setActive(true);
    setUserLocation({ lat: 40.3978, lng: -105.0748 });
    if (false) navigator.geolocation.getCurrentPosition(
      (pos) => {
        setActive(true);
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        console.error("Geolocation error:", err);
        alert("Unable to get your location. Please enable location access.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [setUserLocation]);

  return (
    <button
      type="button"
      className={`absolute bottom-6 right-4 z-10 size-8 rounded-md border bg-surface/90 backdrop-blur-md flex items-center justify-center transition-all cursor-pointer ${
        active
          ? "border-cyan text-cyan shadow-glow"
          : "border-edge text-blue-gray hover:text-cyan hover:border-cyan/50 hover:shadow-glow"
      }`}
      onClick={handleClick}
      title="Show my location"
    >
      <Crosshair className="size-4" />
    </button>
  );
}
