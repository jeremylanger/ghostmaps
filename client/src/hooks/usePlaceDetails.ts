import { useQuery } from "@tanstack/react-query";
import type { EnrichedPlace } from "../types";

async function fetchPlaceDetails(id: string): Promise<EnrichedPlace> {
  const res = await fetch(`/api/places/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error("Failed to fetch place details");
  return res.json();
}

export function usePlaceDetails(placeId: string | null) {
  return useQuery({
    queryKey: ["place", placeId],
    queryFn: () => fetchPlaceDetails(placeId!),
    enabled: !!placeId,
    staleTime: 5 * 60 * 1000, // 5 min cache
  });
}
