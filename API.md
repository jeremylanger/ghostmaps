# Ghost Maps API Reference

Base URL: `https://ghostmaps.app/api` (production) | `http://localhost:3001/api` (development)

All responses are JSON unless otherwise noted. Errors return `{ "error": "description" }` with appropriate HTTP status codes.

---

## Search

### `GET /api/search`

Basic search via Google Places. No AI processing.

**Query Parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `q` | string | yes | Search query (category name, e.g. "restaurants", "coffee") |
| `lat` | string | no | User latitude (improves local results) |
| `lng` | string | no | User longitude |

**Response:** `200 OK`

```json
{
  "results": [
    {
      "id": "08f2a100736...",
      "name": "Joe's Pizza",
      "category": "pizza_restaurant",
      "address": "7 Carmine St, New York, NY",
      "phone": "+12122551234",
      "website": "https://joespizzanyc.com",
      "brand": "Joe's Pizza",
      "confidence": 0.95,
      "longitude": -74.0021,
      "latitude": 40.7305,
      "distanceMeters": 450
    }
  ]
}
```

---

### `GET /api/ai-search`

AI-powered search. Venice AI parses the natural language query, searches appropriate data sources, and ranks results.

**Query Parameters:** Same as `/api/search`.

**Response:** `200 OK`

```json
{
  "results": [ /* Place[] */ ],
  "ranking": {
    "topPick": "08f2a100736...",
    "topPickReason": "Best reviewed authentic Neapolitan pizza in the area",
    "alternatives": [
      {
        "id": "08f2a100849...",
        "whyNot": "Great slices, long wait"
      }
    ]
  },
  "parsed": {
    "query_type": "category",
    "categories": ["pizza_restaurant", "italian_restaurant"],
    "attributes": ["authentic", "neapolitan"],
    "radius": 2000,
    "name_query": null,
    "address_query": null
  }
}
```

---

### `GET /api/ai-search/stream`

Streaming AI search via Server-Sent Events. Sends progressive updates as the search pipeline executes.

**Query Parameters:** Same as `/api/search`.

**Response:** `200 OK` with `Content-Type: text/event-stream`

**Event sequence:**

| Event | Data | Description |
|---|---|---|
| `status` | `{ "message": "Understanding your search..." }` | Progress indicator |
| `parsed` | `{ "query_type": "category", "categories": [...], ... }` | Venice AI parsed intent |
| `results` | `Place[]` | Search results from Google Places |
| `status` | `{ "message": "Picking the best options..." }` | Ranking in progress |
| `ranking` | `{ "topPick": "...", "topPickReason": "...", "alternatives": [...] }` | AI-ranked results |
| `done` | `{}` | Stream complete |
| `error` | `{ "message": "Search failed." }` | Error occurred |

**Query type routing:**
- `category` queries (e.g. "best tacos near me") → Google Places + Venice ranking
- `name` queries (e.g. "Verve Coffee") → Google Places Text Search (no radius cap)
- `address` queries (e.g. "123 Main St") → Google Places geocoding with location bias
- Raw coordinates (e.g. "40.7128, -74.0060") → Direct coordinate parsing, skip AI

---

## Places

### `GET /api/places/:id`

Get full place details with Google Places enrichment (hours, rating, photos, services).

**URL Parameters:**

| Param | Type | Description |
|---|---|---|
| `id` | string | Place ID (from search results) |

**Response:** `200 OK`

```json
{
  "id": "08f2a100736...",
  "name": "Joe's Pizza",
  "category": "pizza_restaurant",
  "address": "7 Carmine St, New York, NY",
  "phone": "+12122551234",
  "website": "https://joespizzanyc.com",
  "brand": "Joe's Pizza",
  "confidence": 0.95,
  "longitude": -74.0021,
  "latitude": 40.7305,
  "openingHours": ["Monday: 10:00 AM – 2:00 AM", "Tuesday: 10:00 AM – 2:00 AM"],
  "isOpen": true,
  "foodTypes": ["Pizza", "Italian"],
  "rating": 4.5,
  "reviewCount": 3200,
  "priceLevel": "PRICE_LEVEL_INEXPENSIVE",
  "dineIn": true,
  "takeout": true,
  "delivery": false,
  "wheelchairAccessible": true,
  "photoUri": "https://places.googleapis.com/v1/places/.../photos/.../media?maxWidthPx=400",
  "photoUris": ["https://...photo1", "https://...photo2"]
}
```

**Errors:**
- `404` — Place not in cache (user must search first)

---

### `GET /api/places/:id/briefing`

Generate a Venice AI intelligence briefing for a place — a 2-3 sentence natural language summary.

**URL Parameters:**

| Param | Type | Description |
|---|---|---|
| `id` | string | Place ID |

**Response:** `200 OK`

```json
{
  "briefing": "Joe's Pizza is a Greenwich Village institution known for its classic New York-style slices. Open late, cash-preferred, expect a line but it moves fast."
}
```

---

## Reviews

### `POST /api/reviews/score`

Score review quality using Venice AI. Returns a quality score (0-100) and tier.

**Request Body:**

```json
{
  "rating": 4,
  "text": "The margherita pizza here is incredible — thin crust, fresh mozzarella, great char.",
  "hasPhoto": true,
  "structuredResponses": {
    "whatOrdered": "Margherita pizza",
    "oneTip": "Go before noon to skip the line"
  }
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `rating` | number | yes | 1-5 star rating |
| `text` | string | yes | Review text |
| `hasPhoto` | boolean | no | Whether a photo was included |
| `structuredResponses` | object | no | Structured prompts (what ordered, tips) |

**Response:** `200 OK`

```json
{
  "score": 78,
  "tier": "exceptional",
  "flags": []
}
```

**Quality tiers:** `generic` (0-25), `decent` (26-50), `detailed` (51-75), `exceptional` (76-100)

---

### `GET /api/reviews/:placeId`

Fetch all on-chain reviews for a place from EAS (Base Sepolia), plus reviewer identities and an AI summary.

**URL Parameters:**

| Param | Type | Description |
|---|---|---|
| `placeId` | string | Place ID |

**Response:** `200 OK`

```json
{
  "reviews": [
    {
      "uid": "0xabc123...",
      "attester": "0x1234...abcd",
      "rating": 4,
      "text": "Great pizza, thin crust, loved the char.",
      "placeId": "08f2a100736...",
      "placeName": "Joe's Pizza",
      "photoHash": "0xe3b0c44298fc...",
      "lat": 40730500,
      "lng": -74002100,
      "qualityScore": 78,
      "time": 1710900000
    }
  ],
  "identities": {
    "0x1234...abcd": {
      "firstSeen": 1710800000,
      "totalReviews": 5
    }
  },
  "summary": "Reviewers praise the classic thin-crust slices and fast service. Common advice: go early to beat the line."
}
```

**Notes:**
- Results are cached server-side for 2 minutes
- Identity data (account age, review count) fetched via EAS GraphQL
- Summary generated by Venice AI from all reviews

---

## Photos

### `POST /api/photos`

Upload a review photo. Returns SHA-256 hash used as the on-chain `photoHash`.

**Request:**

```
Content-Type: image/jpeg (or image/png, image/webp)
Body: raw binary image data (max 10MB)
```

**Response:** `200 OK`

```json
{
  "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```

---

### `GET /api/photos/:hash`

Serve a previously uploaded review photo.

**URL Parameters:**

| Param | Type | Description |
|---|---|---|
| `hash` | string | SHA-256 hash from upload |

**Response:** `200 OK` with `Content-Type: image/*`

**Errors:**
- `404` — Photo not found

---

## Navigation

### `POST /api/route`

Calculate a driving route using TomTom Routing API. Returns coordinates, turn-by-turn instructions, traffic-aware timing, speed limits, and lane guidance.

**Request Body:**

```json
{
  "fromLat": 40.7128,
  "fromLng": -74.0060,
  "toLat": 40.7305,
  "toLng": -74.0021
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `fromLat` | number | yes | Origin latitude |
| `fromLng` | number | yes | Origin longitude |
| `toLat` | number | yes | Destination latitude |
| `toLng` | number | yes | Destination longitude |

**Response:** `200 OK`

```json
{
  "coordinates": [[40.7128, -74.0060], [40.7131, -74.0055], "..."],
  "instructions": [
    {
      "distance": 150,
      "travelTime": 30,
      "point": [40.7128, -74.0060],
      "instructionType": "TURN",
      "street": "Broadway",
      "message": "Turn right onto Broadway",
      "maneuver": "TURN_RIGHT",
      "turnAngle": 90
    }
  ],
  "summary": {
    "lengthInMeters": 2400,
    "travelTimeInSeconds": 480,
    "trafficDelayInSeconds": 60,
    "departureTime": "2026-03-20T14:30:00Z",
    "arrivalTime": "2026-03-20T14:38:00Z"
  },
  "speedLimits": [
    {
      "startPointIndex": 0,
      "endPointIndex": 15,
      "maxSpeedKmh": 40,
      "maxSpeedMph": 25
    }
  ],
  "laneGuidance": [
    {
      "startPointIndex": 10,
      "endPointIndex": 15,
      "lanes": [
        { "directions": ["left"], "follow": "" },
        { "directions": ["straight"], "follow": "straight" },
        { "directions": ["right"], "follow": "" }
      ]
    }
  ]
}
```

---

## Comparison

### `POST /api/compare`

Compare 2-5 places using Venice AI. Analyzes place data and on-chain reviews to explain tradeoffs.

**Request Body:**

```json
{
  "placeIds": ["08f2a100736...", "08f2a100849..."]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `placeIds` | string[] | yes | 2-5 place IDs to compare |

**Response:** `200 OK`

```json
{
  "comparison": "Joe's Pizza offers classic NY-style slices at a lower price with faster service. Lombardi's has a more upscale sit-down experience with whole pies and a historic atmosphere. For a quick bite, Joe's wins. For a dinner out, go Lombardi's.",
  "winner": "Depends on your mood"
}
```

**Errors:**
- `400` — Fewer than 2 or more than 5 IDs, or places not in cache

---

## Utility

### `GET /api/server-ip`

Returns the server's outbound IP address. Used for whitelisting in API key restrictions (e.g., Google Places).

**Response:** `200 OK`

```json
{
  "ip": "34.56.78.90"
}
```

---

## Data Types

### Place

```typescript
interface Place {
  id: string;           // Google Places ID (prefixed with "gp-")
  name: string;
  category: string;     // e.g. "pizza_restaurant"
  address: string;
  phone: string;
  website: string;
  brand: string;
  confidence: number;   // 0-1 confidence score
  longitude: number;
  latitude: number;
  distanceMeters?: number; // Distance from user (when lat/lng provided)
  rating?: number;      // Google Places rating (1-5)
  reviewCount?: number; // Google Places review count
}
```

### RouteResponse

```typescript
interface RouteResponse {
  coordinates: [number, number][];   // [lat, lng] pairs
  instructions: RouteInstruction[];
  summary: RouteSummary;
  speedLimits: SpeedLimitSection[];
  laneGuidance: LaneGuidanceSection[];
}
```

### EAS Review Schema

On-chain schema registered on Base Sepolia:

```
Schema UID: 0x968e91f0274b78a31037839b55e59b942dd1521daebf9190268137e450b7d69f

Fields:
  uint8 rating        — 1-5 star rating
  string text          — Review text
  string placeId       — Place identifier
  string placeName     — Place display name
  bytes32 photoHash    — SHA-256 hash of uploaded photo (0x0 if no photo)
  int256 lat           — Latitude * 1e6 (e.g. 40730500 = 40.7305)
  int256 lng           — Longitude * 1e6 (e.g. -74002100 = -74.0021)
  uint8 qualityScore   — Venice AI quality score (0-100)
```
