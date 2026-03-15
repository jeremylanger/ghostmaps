import type { Place } from '../types'

interface PlacePanelProps {
  place: Place
  onClose: () => void
}

export default function PlacePanel({ place, onClose }: PlacePanelProps) {
  return (
    <div className="place-panel">
      <div className="place-panel-header">
        <div>
          <h2>{place.name}</h2>
          {place.category && (
            <div className="place-panel-category">
              {place.category.replace(/_/g, ' ')}
            </div>
          )}
        </div>
        <button className="place-panel-close" onClick={onClose}>
          &times;
        </button>
      </div>

      {place.address && (
        <div className="place-panel-address">{place.address}</div>
      )}

      <div className="place-panel-details">
        {place.phone && (
          <a href={`tel:${place.phone}`} className="place-detail-chip">
            {place.phone}
          </a>
        )}
        {place.website && (
          <a
            href={place.website}
            target="_blank"
            rel="noopener noreferrer"
            className="place-detail-chip"
          >
            Website
          </a>
        )}
        {place.brand && (
          <span className="place-detail-chip">{place.brand}</span>
        )}
      </div>
    </div>
  )
}
