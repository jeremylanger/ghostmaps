import { useState, useCallback } from 'react'
import { useAppStore } from '../store'

export default function LocateButton() {
  const [active, setActive] = useState(false)
  const setUserLocation = useAppStore((s) => s.setUserLocation)

  const handleClick = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setActive(true)
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      },
      (err) => {
        console.error('Geolocation error:', err)
        alert('Unable to get your location. Please enable location access.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [setUserLocation])

  return (
    <button
      className={`locate-btn ${active ? 'active' : ''}`}
      onClick={handleClick}
      title="Show my location"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" />
        <line x1="12" y1="2" x2="12" y2="6" />
        <line x1="12" y1="18" x2="12" y2="22" />
        <line x1="2" y1="12" x2="6" y2="12" />
        <line x1="18" y1="12" x2="22" y2="12" />
      </svg>
    </button>
  )
}
