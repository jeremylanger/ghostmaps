import { Globe, Navigation, PenLine, Phone, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { useDragScroll } from "../hooks/useDragScroll";
import { usePlaceDetails } from "../hooks/usePlaceDetails";
import { consolidateInstructions } from "../lib/consolidate-instructions";
import { useAppStore } from "../store";
import ReviewList from "./ReviewList";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function HoursList({ hours }: { hours: string[] | string }) {
  const lines = Array.isArray(hours) ? hours : hours.split("; ");
  const todayName = DAY_NAMES[new Date().getDay()];

  return (
    <div className="flex flex-col gap-0.5 mt-3 px-6">
      {lines.map((line, i) => {
        const colonIdx = line.indexOf(":");
        const day = colonIdx > 0 ? line.slice(0, colonIdx) : line;
        const time = colonIdx > 0 ? line.slice(colonIdx + 1).trim() : "";
        const isToday = day.startsWith(todayName);

        return (
          <div
            key={i}
            className={`flex text-xs leading-relaxed ${
              isToday ? "text-sm font-semibold text-bone" : "text-muted"
            }`}
          >
            <span className="w-[90px] shrink-0">{day}</span>
            <span className="flex-1">{time}</span>
          </div>
        );
      })}
    </div>
  );
}

const SNAP_POINTS = [0.45, 1] as const;

export default function PlacePanel() {
  const place = useAppStore((s) => s.selectedPlace);
  const clearSelection = useAppStore((s) => s.clearSelection);
  const routeLoading = useAppStore((s) => s.routeLoading);
  const { data: enriched, isLoading } = usePlaceDetails(place?.id ?? "");
  const [activeSnap, setActiveSnap] = useState<number | string | null>(0.45);
  const galleryRef = useDragScroll<HTMLDivElement>();

  useEffect(() => {
    if (place) setActiveSnap(0.45);
  }, [place?.id]);

  // Workaround for vaul bug #509: modal={false} doesn't properly
  // reset pointer-events on body. Fixed in unmerged PR #576.
  useEffect(() => {
    if (place) {
      requestAnimationFrame(() => {
        document.body.style.pointerEvents = "auto";
      });
    }
  }, [place?.id]);

  if (!place) {
    return (
      <Drawer open={false} modal={false}>
        <DrawerContent />
      </Drawer>
    );
  }

  const displayPlace = enriched || place;
  const phone = enriched?.phone || place.phone;
  const website = enriched?.website || place.website;

  const handleDirections = async () => {
    const store = useAppStore.getState();
    const loc = store.userLocation;
    if (!loc) {
      alert("Enable location to get directions");
      return;
    }
    store.setRouteLoading(true);
    try {
      const res = await fetch("/api/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromLat: loc.lat,
          fromLng: loc.lng,
          toLat: place.latitude,
          toLng: place.longitude,
        }),
      });
      if (!res.ok) throw new Error("Route failed");
      const route = await res.json();
      route.instructions = consolidateInstructions(route.instructions);
      store.setRouteData(route);
    } catch (err) {
      console.error("Route error:", err);
      alert("Could not calculate route");
    } finally {
      store.setRouteLoading(false);
    }
  };

  return (
    <Drawer
      open={true}
      onClose={() => {
        clearSelection();
        setActiveSnap(0.45);
      }}
      snapPoints={SNAP_POINTS}
      activeSnapPoint={activeSnap}
      setActiveSnapPoint={setActiveSnap}
      fadeFromIndex={1}
      modal={false}
      noBodyStyles
    >
      <DrawerContent>
        {/* Header */}
        <div className="flex justify-between items-start px-6 pb-2 pt-1 shrink-0">
          <div className="flex-1 min-w-0 pr-2">
            <h2 className="text-xl font-bold font-display text-bone leading-tight">
              {displayPlace.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              {displayPlace.category && (
                <span className="text-sm text-blue-gray capitalize">
                  {displayPlace.category.replace(/_/g, " ")}
                </span>
              )}
              {enriched?.priceLevel && (
                <span className="text-sm font-semibold text-phosphor">
                  {enriched.priceLevel}
                </span>
              )}
              {enriched?.isOpen !== null && enriched?.isOpen !== undefined && (
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                    enriched.isOpen
                      ? "text-phosphor bg-phosphor-dim"
                      : "text-coral bg-coral/10"
                  }`}
                >
                  {enriched.isOpen ? "Open" : "Closed"}
                </span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-blue-gray hover:text-bone"
            onClick={clearSelection}
          >
            <X className="size-5" />
          </Button>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 px-6 py-3 shrink-0 flex-wrap">
          <Button
            className="flex-col h-auto gap-1.5 min-w-[72px] py-3 px-5 text-xs font-semibold rounded-xl"
            onClick={handleDirections}
            disabled={routeLoading}
          >
            <Navigation className="size-5" />
            <span>{routeLoading ? "..." : "Directions"}</span>
          </Button>
          {phone && (
            <Button
              variant="outline"
              asChild
              className="flex-col h-auto gap-1.5 min-w-[72px] py-3 px-5 text-xs font-semibold rounded-xl hover:border-cyan/50 hover:text-cyan"
            >
              <a href={`tel:${phone}`}>
                <Phone className="size-5" />
                <span>Call</span>
              </a>
            </Button>
          )}
          {website && (
            <Button
              variant="outline"
              asChild
              className="flex-col h-auto gap-1.5 min-w-[72px] py-3 px-5 text-xs font-semibold rounded-xl hover:border-cyan/50 hover:text-cyan"
            >
              <a href={website} target="_blank" rel="noopener noreferrer">
                <Globe className="size-5" />
                <span>Website</span>
              </a>
            </Button>
          )}
          <Button
            variant="outline"
            className="flex-col h-auto gap-1.5 min-w-[72px] py-3 px-5 text-xs font-semibold rounded-xl hover:border-cyan/50 hover:text-cyan"
            onClick={() => useAppStore.getState().setShowReviewForm(true)}
          >
            <PenLine className="size-5" />
            <span>Review</span>
          </Button>
        </div>

        {/* Quick stats */}
        <div className="flex gap-0 px-6 py-3 border-b border-edge shrink-0">
          {enriched?.rating && (
            <div className="flex-1 flex flex-col items-center gap-0.5 min-w-0">
              <span className="text-[11px] text-muted">Rating</span>
              <span className="text-sm font-semibold text-bone">
                <span className="text-amber">★</span>{" "}
                {enriched.rating.toFixed(1)}
                {enriched.reviewCount
                  ? ` (${enriched.reviewCount.toLocaleString()})`
                  : ""}
              </span>
            </div>
          )}
          {displayPlace.address && (
            <div className="flex-1 flex flex-col items-center gap-0.5 min-w-0">
              <span className="text-[11px] text-muted">Address</span>
              <span className="text-[11px] font-normal text-bone text-center max-w-full leading-snug line-clamp-2">
                {displayPlace.address}
              </span>
            </div>
          )}
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 pb-4">
          {isLoading ? (
            <Skeleton className="mx-6 mt-3 h-[200px] rounded-lg bg-surface-raised" />
          ) : enriched?.photoUris && enriched.photoUris.length > 0 ? (
            <div className="mt-3 px-6">
              <div
                ref={galleryRef}
                className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
              >
                {enriched.photoUris.map((uri, i) => (
                  <div
                    key={i}
                    className={`shrink-0 h-[200px] overflow-hidden rounded-lg ${
                      enriched.photoUris.length === 1 ? "w-full" : "w-[85%]"
                    }`}
                  >
                    <img
                      src={uri}
                      alt={`${displayPlace.name} photo ${i + 1}`}
                      className="w-full h-full object-cover pointer-events-none"
                      loading={i === 0 ? "eager" : "lazy"}
                      draggable={false}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : enriched?.photoUri ? (
            <div className="mx-6 mt-3 h-[200px] overflow-hidden rounded-lg">
              <img
                src={enriched.photoUri}
                alt={displayPlace.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : null}

          {(enriched?.dineIn !== null ||
            enriched?.takeout !== null ||
            enriched?.delivery !== null) && (
            <div className="flex gap-1.5 flex-wrap mt-2 px-6">
              {enriched?.dineIn && (
                <Badge variant="secondary" className="text-blue-gray">
                  Dine-in
                </Badge>
              )}
              {enriched?.takeout && (
                <Badge variant="secondary" className="text-blue-gray">
                  Takeout
                </Badge>
              )}
              {enriched?.delivery && (
                <Badge variant="secondary" className="text-blue-gray">
                  Delivery
                </Badge>
              )}
              {enriched?.wheelchairAccessible && (
                <Badge variant="secondary" className="text-blue-gray">
                  ♿ Accessible
                </Badge>
              )}
            </div>
          )}

          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted mt-3 px-6">
              <span className="size-3 rounded-full border-2 border-edge border-t-cyan animate-spin" />
              Loading details...
            </div>
          )}

          {enriched?.briefing && (
            <div className="text-sm text-bone leading-relaxed mx-6 mt-3 p-3 bg-surface-raised rounded-lg border-l-2 border-l-cyan">
              {enriched.briefing}
            </div>
          )}

          {enriched?.openingHours && enriched.openingHours.length > 0 && (
            <HoursList hours={enriched.openingHours} />
          )}

          <ReviewList placeId={place.id} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
