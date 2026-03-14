# Navigation Research

## Decision: TomTom Routing API for all navigation features

---

## Why TomTom (over HERE, OSRM, Valhalla, Mapbox)

| Feature | TomTom | HERE | OSRM/Valhalla (free) | Mapbox |
|---|---|---|---|---|
| Traffic-aware routing + ETA | Yes, built-in | Yes, built-in | No (static speeds) | Yes |
| Speed limits | Yes (Snap to Roads API) | Yes (included) | OSM ~8-12% coverage | Yes |
| Lane guidance | Yes | Yes | Yes (OSM turn:lanes) | Yes |
| Free tier | **2,500/day (~75K/mo)** | 30K/month | Unlimited (self-host) | 100K/month |
| Cost after free | **$0.50/1K** | $0.75/1K | Free | $2.00/1K |
| Use with MapLibre? | **Explicitly allowed** | Murky ToS (prohibits open-data combo) | N/A | Against spirit of ToS |

**TomTom wins because:**
1. Explicitly allows displaying routes on third-party maps (including MapLibre)
2. Cheapest commercial option ($0.50/1K)
3. Most generous free tier (75K/month)
4. Full feature set (traffic, speed limits, lanes)

---

## TomTom API Details

### Routing API — Calculate Route
- Traffic-aware ETA by default (real-time + historical traffic)
- Returns: route geometry (GeoJSON), turn-by-turn instructions, travel time, distance
- `openingHours` mode returns next 7 days pre-computed
- `timeZone.ianaId` per POI — useful for local time calculations

### Snap to Roads API — Speed Limits
- Returns speed limit value, unit, and type for road segments
- Separate API call from routing (costs additional transactions)

### Lane Guidance
- Guidance Instructions include `lanes` section with directions and recommendations
- Returns which lanes are valid for the upcoming maneuver

### TomTom Response Example (route result)
```json
{
  "summary": { "query": "pizza", "queryTime": 42, "numResults": 10 },
  "results": [{
    "poi": {
      "name": "Upper Crust Pizza",
      "phone": "+(1)-(831)-4762333",
      "openingHours": {
        "mode": "nextSevenDays",
        "timeRanges": [{
          "startTime": {"date": "2024-03-13", "hour": 11, "minute": 0},
          "endTime": {"date": "2024-03-13", "hour": 22, "minute": 0}
        }]
      },
      "timeZone": {"ianaId": "America/Los_Angeles"}
    },
    "address": {
      "freeformAddress": "2501 Soquel Dr, Santa Cruz, CA 95065"
    },
    "position": {"lat": 36.98844, "lon": -121.97483},
    "entryPoints": [{"type": "main", "position": {"lat": 36.98853, "lon": -121.97466}}]
  }]
}
```

### TomTom Unique Fields (not in Overture/OSM)
- `dataSources.chargingAvailability` — real-time EV charger availability
- `dataSources.parkingAvailability` — real-time parking data
- `dataSources.fuelPrice` — current fuel prices
- `relatedPois` — parent/child relationships (restaurant inside a mall)
- `mapcodes` — compact location codes
- `entryPoints` — typed access points (main entrance vs side)

---

## Navigation Features — Hackathon Scope

### Must build (Day 7)
- TomTom Routing API integration
- Route display on MapLibre (GeoJSON line layer)
- Turn-by-turn instruction panel
- Traffic-aware ETA display
- GPS tracking (browser `navigator.geolocation.watchPosition()`)

### Should build (Day 8)
- Speed limit display (Snap to Roads API)
- Lane guidance display
- Re-routing when user goes off route

### Skipping for hackathon
- Voice navigation
- Offline maps
- Multi-stop routing

---

## Privacy Note

TomTom sees origin + destination for route calculation. We don't store routes.
**Long-term:** Self-host Valhalla (open source routing engine) for fully private routing. Valhalla supports traffic via "speed tiles" but requires a paid traffic data feed.

---

## Free/Open Routing Alternatives (for reference)

### OSRM
- Fast, widely used, OSM data
- No traffic support, no speed limits, lane guidance depends on OSM tagging
- Public demo server for testing only (not production)
- Self-host for production

### Valhalla
- Open source (originally Mapzen, now community-maintained)
- Supports traffic via speed tiles (but must bring your own traffic data)
- Supports lane guidance from OSM `turn:lanes` tags
- Historical/predictive traffic possible (2,016 speed values per road segment per week)
- No free global traffic data source exists

### OpenRouteService
- Free API (2K requests/day), OSM-based
- Hosted, easy to start
- No real-time traffic
