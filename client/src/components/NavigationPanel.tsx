import { useEffect, useRef } from 'react'
import { useAppStore } from '../store'
import type { RouteInstruction } from '../types'

function formatDuration(seconds: number): string {
  if (seconds < 60) return '< 1 min'
  const hours = Math.floor(seconds / 3600)
  const mins = Math.round((seconds % 3600) / 60)
  if (hours === 0) return `${mins} min`
  return `${hours} hr ${mins} min`
}

function formatDistance(meters: number): string {
  const miles = meters / 1609.34
  if (miles < 0.1) return `${Math.round(meters * 3.281)} ft`
  return `${miles.toFixed(1)} mi`
}

function maneuverIcon(instruction: RouteInstruction): string {
  const type = instruction.instructionType?.toLowerCase() || ''
  const maneuver = instruction.maneuver?.toLowerCase() || ''

  if (type === 'depart' || type === 'departure') return '\u2191' // ↑
  if (type === 'arrive' || type === 'arrival') return '\u{1F3C1}' // 🏁
  if (maneuver.includes('left') && maneuver.includes('sharp')) return '\u2B09' // ⬉
  if (maneuver.includes('right') && maneuver.includes('sharp')) return '\u2B08' // ⬈
  if (maneuver.includes('left')) return '\u2190' // ←
  if (maneuver.includes('right')) return '\u2192' // →
  if (maneuver.includes('uturn') || maneuver.includes('u-turn')) return '\u21B6' // ↶
  if (type === 'keep' || maneuver.includes('straight')) return '\u2191' // ↑
  if (type.includes('roundabout')) return '\u21BB' // ↻
  if (type.includes('motorway') || type.includes('highway')) return '\u{1F6E3}' // 🛣
  return '\u2191' // ↑ default
}

export default function NavigationPanel() {
  const routeData = useAppStore((s) => s.routeData)
  const navigating = useAppStore((s) => s.navigating)
  const currentIndex = useAppStore((s) => s.currentInstructionIndex)
  const selectedPlace = useAppStore((s) => s.selectedPlace)
  const clearRoute = useAppStore((s) => s.clearRoute)
  const activeRef = useRef<HTMLDivElement>(null)

  // Scroll active instruction into view
  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [currentIndex])

  if (!routeData) return null

  const { instructions, summary } = routeData
  const trafficDelay = summary.trafficDelayInSeconds

  return (
    <div className="navigation-panel">
      {/* ETA Header */}
      <div className="nav-header">
        <div className="nav-eta">
          <span className="nav-eta-time">{formatDuration(summary.travelTimeInSeconds)}</span>
          <span className="nav-eta-distance">{formatDistance(summary.lengthInMeters)}</span>
          {trafficDelay > 60 && (
            <span className="nav-traffic-delay">
              +{formatDuration(trafficDelay)} traffic
            </span>
          )}
        </div>
        {selectedPlace && (
          <div className="nav-destination">{selectedPlace.name}</div>
        )}
        <button className="nav-close" onClick={clearRoute}>&times;</button>
      </div>

      {/* Turn-by-turn instructions */}
      <div className="nav-instructions">
        {instructions.map((inst, i) => {
          const isActive = navigating && i === currentIndex
          const isPast = navigating && i < currentIndex
          // Show distance between this instruction and next
          const nextDist = instructions[i + 1]
            ? instructions[i + 1].distance - inst.distance
            : 0

          return (
            <div
              key={i}
              ref={isActive ? activeRef : undefined}
              className={`nav-instruction ${isActive ? 'active' : ''} ${isPast ? 'past' : ''}`}
            >
              <div className="nav-instruction-icon">{maneuverIcon(inst)}</div>
              <div className="nav-instruction-content">
                <div className="nav-instruction-text">{inst.message}</div>
                {inst.street && (
                  <div className="nav-instruction-street">{inst.street}</div>
                )}
                {nextDist > 0 && (
                  <div className="nav-instruction-distance">
                    {formatDistance(nextDist)}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Navigation control */}
      <div className="nav-footer">
        {!navigating ? (
          <button
            className="nav-start-btn"
            onClick={() => useAppStore.getState().setNavigating(true)}
          >
            Start Navigation
          </button>
        ) : (
          <button className="nav-stop-btn" onClick={clearRoute}>
            End Navigation
          </button>
        )}
      </div>
    </div>
  )
}
