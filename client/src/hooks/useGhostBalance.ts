import { useQuery } from "@tanstack/react-query";

interface GhostBalanceResponse {
  balance: string;
  raw: string;
}

async function fetchGhostBalance(
  address: string,
): Promise<GhostBalanceResponse> {
  const res = await fetch(`/api/ghost-balance/${encodeURIComponent(address)}`);
  if (!res.ok) {
    console.error("Failed to fetch GHOST balance:", res.status, res.statusText);
    throw new Error("Failed to fetch GHOST balance");
  }
  return res.json();
}

export function useGhostBalance(address: string | undefined) {
  return useQuery({
    queryKey: ["ghost-balance", address],
    queryFn: () => fetchGhostBalance(address!),
    enabled: !!address,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
