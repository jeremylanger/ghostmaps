import { useAppStore } from '../store'
import { usePlaceDetails } from '../hooks/usePlaceDetails'

export default function PlacePanel() {
  const place = useAppStore((s) => s.selectedPlace)!
  const clearSelection = useAppStore((s) => s.clearSelection)
  const { data: enriched, isLoading } = usePlaceDetails(place.id)

  const displayPlace = enriched || place

  return (
    <div className="place-panel">
      {enriched?.photoUri && (
        <div className="place-panel-photo">
          <img src={enriched.photoUri} alt={displayPlace.name} />
        </div>
      )}

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

      {enriched?.rating && (
        <div className="place-panel-rating">
          <span className="rating-stars">{'★'.repeat(Math.round(enriched.rating))}</span>
          <span className="rating-value">{enriched.rating.toFixed(1)}</span>
          {enriched.reviewCount && (
            <span className="rating-count">({enriched.reviewCount.toLocaleString()} reviews)</span>
          )}
        </div>
      )}

      {displayPlace.address && (
        <div className="place-panel-address">{displayPlace.address}</div>
      )}

      {enriched?.openingHours && (
        <div className="place-panel-hours">{enriched.openingHours}</div>
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

      <div className="place-panel-details">
        {(enriched?.phone || place.phone) && (
          <a href={`tel:${enriched?.phone || place.phone}`} className="place-detail-chip">
            {enriched?.phone || place.phone}
          </a>
        )}
        {(enriched?.website || place.website) && (
          <a
            href={enriched?.website || place.website}
            target="_blank"
            rel="noopener noreferrer"
            className="place-detail-chip"
          >
            Website
          </a>
        )}
        {displayPlace.brand && (
          <span className="place-detail-chip">{displayPlace.brand}</span>
        )}
      </div>
    </div>
  )
}
