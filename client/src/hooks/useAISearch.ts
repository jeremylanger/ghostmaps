import { useRef, useCallback } from 'react'
import { useAppStore } from '../store'
import type { Place, Ranking } from '../types'

export function useAISearch() {
  const abortRef = useRef<AbortController | null>(null)
  const lastQueryRef = useRef<string>('')
  const {
    setSearchResults, setRanking, setLoading,
    setStatusMessage, setError, clearSearch,
    userLocation,
  } = useAppStore()

  const search = useCallback(async (query: string) => {
    const trimmed = query.trim()
    if (!trimmed) {
      clearSearch()
      return
    }

    // Skip if same query is already in-flight or just completed
    if (trimmed === lastQueryRef.current) return
    lastQueryRef.current = trimmed

    // Abort any in-flight search
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setError(null)
    setRanking(null)
    setStatusMessage('Understanding your search...')

    try {
      const params = new URLSearchParams({ q: query })
      if (userLocation) {
        params.set('lat', String(userLocation.lat))
        params.set('lng', String(userLocation.lng))
      }

      const response = await fetch(`/api/ai-search/stream?${params}`, {
        signal: controller.signal,
      })

      if (!response.ok) throw new Error('Search failed')
      if (!response.body) throw new Error('No response body')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // Parse SSE events
        const parts = buffer.split('\n\n')
        buffer = parts.pop() || ''

        for (const part of parts) {
          const lines = part.split('\n')
          let event = ''
          let data = ''

          for (const line of lines) {
            if (line.startsWith('event: ')) event = line.slice(7)
            if (line.startsWith('data: ')) data = line.slice(6)
          }

          if (!event || !data) continue

          try {
            const parsed = JSON.parse(data)
            switch (event) {
              case 'status':
                setStatusMessage(parsed.message)
                break
              case 'results':
                setSearchResults(parsed as Place[])
                break
              case 'ranking':
                setRanking(parsed as Ranking)
                break
              case 'error':
                setError(parsed.message)
                break
              case 'done':
                break
            }
          } catch {
            // skip malformed data
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        lastQueryRef.current = ''
        return
      }
      lastQueryRef.current = ''
      setError(err instanceof Error ? err.message : 'Search failed')
      setSearchResults([])
    } finally {
      setLoading(false)
      setStatusMessage(null)
    }
  }, [userLocation, setSearchResults, setRanking, setLoading, setStatusMessage, setError, clearSearch])

  const abort = useCallback(() => {
    if (abortRef.current) abortRef.current.abort()
    lastQueryRef.current = ''
  }, [])

  return { search, abort }
}
