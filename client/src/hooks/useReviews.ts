import { useQuery } from '@tanstack/react-query'
import type { ReviewsResponse } from '../types'

async function fetchReviews(placeId: string): Promise<ReviewsResponse> {
  const res = await fetch(`/api/reviews/${encodeURIComponent(placeId)}`)
  if (!res.ok) throw new Error('Failed to fetch reviews')
  return res.json()
}

export function useReviews(placeId: string | null) {
  return useQuery({
    queryKey: ['reviews', placeId],
    queryFn: () => fetchReviews(placeId!),
    enabled: !!placeId,
    staleTime: 2 * 60 * 1000, // 2 min cache
  })
}
