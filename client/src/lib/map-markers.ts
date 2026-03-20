import maplibregl from "maplibre-gl";
import { THEME } from "./theme";

/** Create the cyan dot element for non-navigation mode. */
export function createUserDotElement(): HTMLDivElement {
  const el = document.createElement("div");
  el.style.cssText = `
    width: 16px;
    height: 16px;
    background: ${THEME.cyan};
    border: 3px solid ${THEME.void};
    border-radius: 50%;
    box-shadow: 0 0 0 2px rgba(0, 229, 255, 0.3), 0 0 12px rgba(0, 229, 255, 0.4);
    animation: pulse-glow 2s ease-in-out infinite;
  `;
  return el;
}

/** Create a directional arrow element for navigation mode. */
export function createUserArrowElement(): HTMLDivElement {
  const el = document.createElement("div");
  el.innerHTML = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="14" fill="${THEME.cyan}" stroke="${THEME.void}" stroke-width="3"/>
    <path d="M16 6 L22 22 L16 18 L10 22 Z" fill="${THEME.void}"/>
  </svg>`;
  el.style.transition = "transform 0.5s ease-out";
  el.style.filter = "drop-shadow(0 0 8px rgba(0, 229, 255, 0.5))";
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
  el.style.cssText =
    "display: flex; flex-direction: column; align-items: center;";

  // Build label via DOM to avoid innerHTML XSS with place names
  const label = document.createElement("div");
  label.textContent = placeName;
  label.style.cssText = `background: ${THEME.surface}; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; color: ${THEME.bone}; box-shadow: 0 0 12px rgba(0, 229, 255, 0.3); white-space: nowrap; margin-bottom: 2px; border: 1px solid ${THEME.edge}; font-family: 'JetBrains Mono', monospace;`;

  const pin = document.createElement("div");
  pin.style.cssText =
    "display: flex; align-items: center; justify-content: center;";
  pin.innerHTML = `<svg width="24" height="32" viewBox="0 0 24 32" fill="none">
    <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill="${THEME.cyan}"/>
    <circle cx="12" cy="12" r="5" fill="${THEME.void}"/>
  </svg>`;

  el.appendChild(label);
  el.appendChild(pin);

  return new maplibregl.Marker({ element: el, anchor: "bottom" })
    .setLngLat(lngLat)
    .addTo(map);
}
