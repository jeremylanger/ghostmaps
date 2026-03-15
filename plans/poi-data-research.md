# POI Data Source Research

## Decision: Overture REST API (primary) + OSM enrichment + HERE fallback

---

## Overture Maps — Primary POI Source

- **72M+ POIs** globally, CDLA Permissive 2.0 license (free, open)
- Rich category taxonomy (400+ types including granular food types like `taco`, `mexican_restaurant`)
- Updated monthly (latest: 2026-02-18.0)
- **Does NOT include:** opening hours, ratings, reviews, photos, price level
- `operating_status` field is NOT opening hours — it's whether the business exists at all

### Overture REST API (overturemapsapi.com)
- Third-party hosted API by ThatAPICompany (not official Overture), v0.1.2
- **Base URL:** `https://api.overturemapsapi.com`
- Auth: `x-api-key` header
  - Demo key: `DEMO-API-KEY` (restricted to 10km around NYC, London, Paris, Bondi Beach)
  - Free accounts: sign up at https://overturemapsapi.com
- **No text search by name** — `name=`, `q=` params are silently ignored (verified)
- No opening hours filter

#### Endpoints
| Endpoint | Description |
|---|---|
| `GET /places` | Search places by location/category/brand |
| `GET /places/categories` | List all categories with place/brand counts |
| `GET /places/brands` | List all brands with place counts |
| `GET /places/countries` | List all countries with place/brand counts |
| `GET /places/buildings` | Building shapes containing places |
| `GET /addresses` | Address theme data |

#### `/places` Query Parameters
| Param | Type | Description |
|---|---|---|
| `lat` | float | Latitude (required for geo search) |
| `lng` | float | Longitude (required for geo search) |
| `radius` | int | Search radius in meters |
| `categories` | string | Comma-separated category filter (e.g. `restaurant,coffee_shop`) |
| `brand_name` | string | Filter by brand name (e.g. `Starbucks`) |
| `min_confidence` | float | Minimum confidence score (0-1) |
| `country` | string | Country code filter (e.g. `US`) |
| `limit` | int | Max results to return |
| `format` | string | `json` (default) or `geojson` |

#### Example Request
```bash
curl -H "x-api-key: YOUR_API_KEY" \
  "https://api.overturemapsapi.com/places?lat=40.7128&lng=-74.006&radius=2000&categories=restaurant&min_confidence=0.8&limit=10"
```

### Response Format (JSON — default)
Returns a JSON array of place objects:
```json
[
  {
    "id": "1a09ee5f-1006-4d82-b91a-bb792f56a5ce",
    "geometry": {
      "type": "Point",
      "coordinates": [-74.0058625, 40.7149206]
    },
    "properties": {
      "id": "1a09ee5f-1006-4d82-b91a-bb792f56a5ce",
      "version": 6,
      "sources": [
        { "property": "", "dataset": "meta", "record_id": "126724604042392",
          "update_time": "2025-12-01T08:00:00.000Z", "confidence": 0.95 },
        { "property": "/properties/confidence", "dataset": "Overture",
          "record_id": null, "update_time": "2026-02-10T22:33:06Z", "confidence": null }
      ],
      "names": { "primary": "Starbucks", "common": null, "rules": null },
      "categories": { "primary": "coffee_shop", "alternate": [] },
      "confidence": 0.9809,
      "websites": [],
      "socials": ["https://www.facebook.com/126724604042392"],
      "emails": [],
      "phones": ["+12124065315"],
      "brand": { "names": { "primary": "Starbucks", "common": null, "rules": null },
                  "wikidata": "Q37158" },
      "addresses": [
        { "freeform": "80 Pine St", "locality": "New York",
          "postcode": "10005", "region": "NY", "country": "US" }
      ],
      "ext_name": "Starbucks"
    }
  }
]
```

### Response Format (GeoJSON — `format=geojson`)
Wraps the same data in a standard GeoJSON FeatureCollection:
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "id": "...",
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [-74.005, 40.714] },
      "properties": { /* same properties as JSON format */ }
    }
  ]
}
```

### Key Fields
- `names.primary` — place name
- `categories.primary` — Overture category slug (e.g. `restaurant`, `coffee_shop`, `taco`)
- `categories.alternate` — additional categories (array)
- `confidence` — 0-1 score, higher = more likely to be a real place
- `brand` — present only for branded/chain locations, includes `wikidata` ID
- `sources[].dataset` — data provenance (`meta` = Facebook/Meta, `Microsoft`, `Overture`)
- `socials` — social media URLs (often Facebook page)
- `ext_name` — display name (same as `names.primary`)
- **NOT included:** opening hours, ratings, reviews, photos, price level

---

## OpenStreetMap (OSM) — Enrichment Layer

### Opening Hours Coverage (US, March 2026)
| Category | US POIs in OSM | Have Hours | Rate |
|---|---|---|---|
| Restaurants | 217,862 | 61,908 | **28%** |
| Cafes | 49,133 | 16,976 | **35%** |
| Fast food | 157,083 | 84,331 | **54%** |
| **All food** | **424,078** | **163,215** | **~39%** |

Germany comparison: ~58% coverage (72% of OSM contributors are in Europe).

### Additional OSM Fields (beyond hours)
- `cuisine` (italian, mexican, sushi, etc.)
- `diet:vegan`, `diet:vegetarian`, `diet:halal`, `diet:kosher`
- `wheelchair` (accessibility)
- `internet_access` (wifi)
- `outdoor_seating`
- `takeaway`, `delivery`
- `payment:cash`, `payment:credit_cards`, `payment:bitcoin`
- `smoking`, `reservation`, `capacity`
- `phone`, `website`, `email`, `description`

### Cross-Referencing Overture ↔ OSM
- Overture publishes **Bridge Files** mapping GERS IDs to OSM node/way IDs
- Simple column-based JOIN — no fuzzy matching needed
- Bridge files at: `s3://overturemaps-us-west-2/bridgefiles/{release}/`
- ~40% of Overture places originate from OSM
- `overturetoosm` Python package exists for this purpose

### OSM opening_hours Format
- Ranges from simple (`Mo-Fr 08:00-18:00`) to complex (seasonal, holidays, sunrise/sunset)
- **opening_hours.js** library parses 99.3% of all values — the gold standard
- Available for JS/Node, Python, Java, Kotlin, C++, PHP
- ODbL license — requires attribution, share-alike for derived databases
- Keep OSM data in separate layer to avoid ODbL applying to entire database

---

## HERE Places API — Fallback Enrichment

### Why HERE (over TomTom for POI enrichment)
- `references` field returns **TripAdvisor and Yelp IDs** per place — killer feature for bridging to external reviews
- `openingHours` with `isOpen` boolean (real-time) + structured iCal RRULE format
- `foodTypes` — structured cuisine taxonomy richer than OSM
- Estimated 50-70% US restaurant opening hours coverage (vs OSM's 39%)

### HERE API Details
- Free tier: 1,000 requests/day, then $0.83/1K
- `GET /discover` endpoint with lat/lng/radius search
- Returns: name, address, categories, foodTypes, contacts, openingHours, chains, references
- **ToS concern:** prohibits combining with open-source/open-data content — potentially an issue with OSM-based map tiles. Need to evaluate.

### HERE Response Example (key fields)
```json
{
  "title": "The Barn Coffee Roasters",
  "categories": [{"id": "100-1100-0010", "name": "Coffee Shop", "primary": true}],
  "foodTypes": [{"id": "800-061", "name": "Breakfast", "primary": true}],
  "openingHours": [{
    "text": ["Mon-Fri: 07:00 - 18:00"],
    "isOpen": true,
    "structured": [{"start": "T070000", "duration": "PT11H00M", "recurrence": "FREQ:DAILY;BYDAY:MO,TU,WE,TH,FR"}]
  }],
  "references": [
    {"supplier": {"id": "tripadvisor"}, "id": "17950139"},
    {"supplier": {"id": "yelp"}, "id": "K7hyL4ELrPguvNtSRCUdgg"}
  ]
}
```

---

## Other Sources Evaluated (Not Using)

### Google Places API — BLOCKED
- Best data (200M+ POIs, hours, ratings, reviews, photos)
- **ToS prohibits display on non-Google maps** — can't use with MapLibre
- Can't cache/store data
- $17-35/1K calls
- Total legal penalties for privacy violations: $2.3B+

### Yelp Fusion API — Too Expensive/Restrictive
- US-focused, weak globally
- No free tier (killed in 2019), $7.99-14.99/1K calls, plans start at $229/mo
- 24-hour cache limit, heavy attribution requirements
- Up to 3 photos/business on Plus tier

### Foursquare Places API — Too Expensive
- 100M+ POIs, good coverage
- Photos/hours require Premium: $18.75/1K calls
- Free tier (10K calls) only covers basic endpoints

### TomTom Places API — Used for Navigation Instead
- Has opening hours and good POI data
- $0.50/1K after 2,500 free/day
- Better suited for routing/navigation (our use case for TomTom)

### Foursquare OS Places — Overlaps with Overture
- 100M+ POIs, Apache 2.0 license
- Feeds into Overture already — significant overlap
- Opening hours coverage unclear

---

## Enrichment Pipeline Flow

```
User: "late night tacos near me"
         ↓
Venice AI (query + lat/lng, zero retention)
  → extracts: {categories: ["taco", "mexican_restaurant"], radius: 5000, openAfter: "22:00"}
         ↓
Overture REST API (category + location search)
  → 12 base results (name, category, address, coords)
         ↓
OSM Bridge Files (JOIN on GERS ID → OSM ID)
  → enriches ~40% with: opening_hours, cuisine, wifi, outdoor_seating (free)
         ↓
HERE API (fallback for POIs still missing hours)
  → adds: openingHours, isOpen, foodTypes, TripAdvisor/Yelp IDs ($0.83/1K)
         ↓
Venice AI (receives all 12 enriched results)
  → ranks, recommends top pick, explains "why not" for alternatives
  → streams response via SSE
```

---

## Competitive Landscape

**Nobody is building this combination:**
- No consumer app uses MapLibre + Overture together (only developer demos)
- Privacy maps (Organic Maps, CoMaps, OsmAnd) are all OSM-only — they rejected Overture for quality concerns
- No project does AI-powered semantic search over Overture POI data
- No project combines on-chain reviews with a maps interface
- Hivemapper (DePIN mapping on Solana) does street imagery, not reviews
- BTC Map / Bitcoin.com Map show crypto-accepting merchants, no reviews
