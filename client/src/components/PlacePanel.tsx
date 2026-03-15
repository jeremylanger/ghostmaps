import { useAppStore } from '../store'

export default function PlacePanel() {
  const place = useAppStore((s) => s.selectedPlace)!
  const clearSelection = useAppStore((s) => s.clearSelection)

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
        <button className="place-panel-close" onClick={clearSelection}>
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
