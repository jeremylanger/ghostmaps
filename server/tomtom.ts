import type { RouteResponse, RouteInstruction, RouteSummary } from './types'

const TOMTOM_BASE = 'https://api.tomtom.com/routing/1/calculateRoute'

export async function calculateRoute(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
  apiKey: string
): Promise<RouteResponse> {
  const locations = `${fromLat},${fromLng}:${toLat},${toLng}`
  const url = `${TOMTOM_BASE}/${locations}/json?key=${apiKey}&traffic=true&instructionsType=text&routeType=fastest&travelMode=car&routeRepresentation=polyline&computeTravelTimeFor=all`

  const res = await fetch(url)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`TomTom API error ${res.status}: ${text}`)
  }

  const data = await res.json()
  const route = data.routes?.[0]
  if (!route) throw new Error('No route found')

  const leg = route.legs?.[0]
  if (!leg) throw new Error('No route leg found')

  // Extract route geometry as [lng, lat] coordinates
  const coordinates: [number, number][] = leg.points.map(
    (p: { latitude: number; longitude: number }) => [p.longitude, p.latitude]
  )

  // Extract turn-by-turn instructions
  const instructions: RouteInstruction[] = (route.guidance?.instructions || []).map(
    (inst: {
      routeOffsetInMeters: number
      travelTimeInSeconds: number
      point: { latitude: number; longitude: number }
      instructionType: string
      street?: string
      message: string
      maneuver?: string
      turnAngleInDecimalDegrees?: number
    }) => ({
      distance: inst.routeOffsetInMeters,
      travelTime: inst.travelTimeInSeconds,
      point: [inst.point.longitude, inst.point.latitude] as [number, number],
      instructionType: inst.instructionType,
      street: inst.street || '',
      message: inst.message,
      maneuver: inst.maneuver || '',
      turnAngle: inst.turnAngleInDecimalDegrees || 0,
    })
  )

  const summary: RouteSummary = {
    lengthInMeters: route.summary.lengthInMeters,
    travelTimeInSeconds: route.summary.travelTimeInSeconds,
    trafficDelayInSeconds: route.summary.trafficDelayInSeconds || 0,
    departureTime: route.summary.departureTime || '',
    arrivalTime: route.summary.arrivalTime || '',
  }

  return { coordinates, instructions, summary }
}
