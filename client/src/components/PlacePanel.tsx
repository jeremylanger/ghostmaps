import { useAppStore } from '../store'
import { usePlaceDetails } from '../hooks/usePlaceDetails'
import ReviewList from './ReviewList'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function HoursList({ hours }: { hours: string[] | string }) {
  const lines = Array.isArray(hours) ? hours : hours.split('; ')
  const todayName = DAY_NAMES[new Date().getDay()]

  return (
    <div className="place-panel-hours">
      {lines.map((line, i) => {
        // Split "Monday: 8:00 AM – 9:00 PM" into day and times
        const colonIdx = line.indexOf(':')
        const day = colonIdx > 0 ? line.slice(0, colonIdx) : line
        const time = colonIdx > 0 ? line.slice(colonIdx + 1).trim() : ''
        const isToday = day.startsWith(todayName)

        return (
          <div key={i} className={`hours-line ${isToday ? 'hours-today' : ''}`}>
            <span className="hours-day">{day}</span>
            <span className="hours-time">{time}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function PlacePanel() {
  const place = useAppStore((s) => s.selectedPlace)!
  const clearSelection = useAppStore((s) => s.clearSelection)
  const routeLoading = useAppStore((s) => s.routeLoading)
  const { data: enriched, isLoading } = usePlaceDetails(place.id)

  const displayPlace = enriched || place
  const phone = enriched?.phone || place.phone
  const website = enriched?.website || place.website

  const handleDirections = async () => {
    const store = useAppStore.getState()
    const loc = store.userLocation
    if (!loc) {
      alert('Enable location to get directions')
      return
    }
    store.setRouteLoading(true)
    try {
      const res = await fetch('/api/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromLat: loc.lat,
          fromLng: loc.lng,
          toLat: place.latitude,
          toLng: place.longitude,
        }),
      })
      if (!res.ok) throw new Error('Route failed')
      const route = await res.json()
      store.setRouteData(route)
    } catch (err) {
      console.error('Route error:', err)
      alert('Could not calculate route')
    } finally {
      store.setRouteLoading(false)
    }
  }

  return (
    <div className="place-panel">
      {/* Drag handle */}
      <div className="place-panel-handle"><div className="handle-bar" /></div>

      {/* Header: name + category + close */}
      <div className="place-panel-header">
        <div>
          <h2>{displayPlace.name}</h2>
          <div className="place-panel-meta">
            {displayPlace.category && (
              <span className="place-panel-category">
                {displayPlace.category.replace(/_/g, ' ')}
              </span>
            )}
            {enriched?.priceLevel && (
              <span className="price-level">{enriched.priceLevel}</span>
            )}
            {enriched?.isOpen !== null && enriched?.isOpen !== undefined && (
              <span className={`open-status ${enriched.isOpen ? 'open' : 'closed'}`}>
                {enriched.isOpen ? 'Open' : 'Closed'}
              </span>
            )}
          </div>
        </div>
        <button className="place-panel-close" onClick={clearSelection}>
          &times;
        </button>
      </div>

      {/* Action buttons row — always visible, no scrolling needed */}
      <div className="place-panel-action-row">
        <button
          className="action-pill action-primary"
          onClick={handleDirections}
          disabled={routeLoading}
        >
          <span className="action-icon">&#x2794;</span>
          <span>{routeLoading ? '...' : 'Directions'}</span>
        </button>
        {phone && (
          <a href={`tel:${phone}`} className="action-pill">
            <span className="action-icon">&#x1F4DE;</span>
            <span>Call</span>
          </a>
        )}
        {website && (
          <a href={website} target="_blank" rel="noopener noreferrer" className="action-pill">
            <span className="action-icon">&#x1F310;</span>
            <span>Website</span>
          </a>
        )}
        <button
          className="action-pill"
          onClick={() => useAppStore.getState().setShowReviewForm(true)}
        >
          <span className="action-icon">&#x270D;</span>
          <span>Review</span>
        </button>
      </div>

      {/* Quick stats row */}
      <div className="place-panel-stats">
        {enriched?.rating && (
          <div className="stat-item">
            <span className="stat-label">Rating</span>
            <span className="stat-value">
              <span className="rating-stars">★</span> {enriched.rating.toFixed(1)}
              {enriched.reviewCount ? ` (${enriched.reviewCount.toLocaleString()})` : ''}
            </span>
          </div>
        )}
        {enriched?.isOpen !== null && enriched?.isOpen !== undefined && (
          <div className="stat-item">
            <span className="stat-label">Hours</span>
            <span className={`stat-value ${enriched.isOpen ? 'stat-open' : 'stat-closed'}`}>
              {enriched.isOpen ? 'Open' : 'Closed'}
            </span>
          </div>
        )}
        {displayPlace.address && (
          <div className="stat-item">
            <span className="stat-label">Address</span>
            <span className="stat-value stat-address">{displayPlace.address}</span>
          </div>
        )}
      </div>

      {/* Scrollable content */}
      <div className="place-panel-scroll">
        {enriched?.photoUri && (
          <div className="place-panel-photo">
            <img src={enriched.photoUri} alt={displayPlace.name} />
          </div>
        )}

        {enriched?.foodTypes && enriched.foodTypes.length > 0 && (
          <div className="place-panel-food-types">
            {enriched.foodTypes.map((type) => (
              <span key={type} className="food-type-chip">{type}</span>
            ))}
          </div>
        )}

        {(enriched?.dineIn !== null || enriched?.takeout !== null || enriched?.delivery !== null) && (
          <div className="place-panel-services">
            {enriched?.dineIn && <span className="service-chip">Dine-in</span>}
            {enriched?.takeout && <span className="service-chip">Takeout</span>}
            {enriched?.delivery && <span className="service-chip">Delivery</span>}
            {enriched?.wheelchairAccessible && <span className="service-chip">♿ Accessible</span>}
          </div>
        )}

        {isLoading && (
          <div className="place-panel-loading">Loading details...</div>
        )}

        {enriched?.briefing && (
          <div className="place-panel-briefing">{enriched.briefing}</div>
        )}

        {enriched?.openingHours && enriched.openingHours.length > 0 && (
          <HoursList hours={enriched.openingHours} />
        )}

        <ReviewList placeId={place.id} />
      </div>
    </div>
  )
}
