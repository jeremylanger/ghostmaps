import maplibregl from "maplibre-gl";

/** Create the blue dot element for non-navigation mode. */
export function createUserDotElement(): HTMLDivElement {
  const el = document.createElement("div");
  el.className = "user-marker";
  return el;
}

/** Create a directional arrow element for navigation mode. */
export function createUserArrowElement(): HTMLDivElement {
  const el = document.createElement("div");
  el.className = "user-arrow-marker";
  el.innerHTML = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="14" fill="#4285f4" stroke="white" stroke-width="3"/>
    <path d="M16 6 L22 22 L16 18 L10 22 Z" fill="white"/>
  </svg>`;
  // Smooth rotation via CSS transition
  el.style.transition = "transform 0.5s ease-out";
  return el;
}

/** Rotate the arrow element to match heading. */
export function setArrowHeading(el: HTMLDivElement, heading: number) {
  el.style.transform = `rotate(${heading}deg)`;
}

/** Create a destination pin marker with place name label. */
export function createDestinationMarker(
  placeName: string,
  map: maplibregl.Map,
  lngLat: [number, number],
): maplibregl.Marker {
  const el = document.createElement("div");
  el.className = "destination-marker";
  el.innerHTML = `
    <div class="destination-label">${placeName}</div>
    <div class="destination-pin">
      <svg width="24" height="32" viewBox="0 0 24 32" fill="none">
        <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill="#e53e3e"/>
        <circle cx="12" cy="12" r="5" fill="white"/>
      </svg>
    </div>`;

  return new maplibregl.Marker({ element: el, anchor: "bottom" })
    .setLngLat(lngLat)
    .addTo(map);
}
