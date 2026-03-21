import { useQuery } from "@tanstack/react-query";
import type { EnrichedPlace } from "../types";

async function fetchPlaceDetails(id: string): Promise<EnrichedPlace> {
  const res = await fetch(`/api/places/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error("Failed to fetch place details");
  return res.json();
}

async function fetchBriefing(id: string): Promise<string> {
  const res = await fetch(`/api/places/${encodeURIComponent(id)}/briefing`);
  if (!res.ok) throw new Error("Failed to fetch briefing");
  const data = await res.json();
  return data.briefing;
}

export function usePlaceDetails(placeId: string | null) {
  return useQuery({
    queryKey: ["place", placeId],
    queryFn: () => fetchPlaceDetails(placeId!),
    enabled: !!placeId,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePlaceBriefing(placeId: string | null) {
  return useQuery({
    queryKey: ["briefing", placeId],
    queryFn: () => fetchBriefing(placeId!),
    enabled: !!placeId,
    staleTime: 5 * 60 * 1000,
  });
}
