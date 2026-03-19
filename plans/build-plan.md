# 10-Day Hackathon Build Plan (March 13-22)

## Context

Building a private AI-powered maps app with on-chain reviews and navigation. Privacy-first alternative to Google Maps — private search via Venice AI, trustworthy on-chain reviews via EAS on Base, and navigation without location tracking.

**The pitch:** "Google Maps tracks your location every 2 minutes and has paid $7.3B+ in privacy fines. We built the alternative — AI-powered search, trustworthy on-chain reviews, and real navigation, without anyone knowing where you go."

**Hackathon strategy:** AI agents judge this hackathon. Code quality, documentation, machine-readable artifacts, and on-chain proof matter as much as the demo. Venice bounty criteria: originality, ecosystem alignment (privacy), growth potential, technical depth, proof of work.

---

## Confirmed Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + MapLibre GL JS (MapTiler Streets v2 tiles) |
| Backend | Node.js + Express |
| AI | Venice API (OpenAI-compatible, zero data retention) |
| POI Search | Overture REST API → Google Places enrichment |
| Navigation | TomTom Routing API (traffic ETA, speed limits, lane guidance) |
| On-chain | EAS on Base (ethers.js + EAS SDK) |
| Auth + Wallets | Coinbase CDP Embedded Wallets (email OTP, invisible wallet on Base) |
| Identity | ERC-8004 |
| Streaming | SSE (Server-Sent Events) |
| Search UX | Smart search bar with streaming results below map |

---

## Day-by-Day Plan

### Day 1 — March 13 ✅
**Planning & Research** *(done)*
- [x] Architecture decisions finalized
- [x] Tech stack chosen
- [x] Search pipeline designed (Overture → OSM → HERE)
- [x] Navigation approach decided (TomTom)
- [x] Auth approach decided (CDP embedded wallets)
- [x] Hackathon judging criteria researched

### Day 2 — March 14 ✅
**Map Foundation + Basic Search**
- [x] Project scaffolding (React + Vite frontend, Node + Express backend)
- [x] MapLibre rendering with base map tiles — **MapTiler Streets v2** (polished, dense POIs)
- [x] User GPS location on map (browser Geolocation API)
- [x] Overture REST API integration — category + location search (no text search — API only supports category/brand/location filters)
- [x] Display search results as pins on the map
- [x] Smart search bar UI (top of screen, results as cards below map)
- [x] Place detail panel — tap a pin/result to see name, category, address, phone, website
- [x] Sign up for Overture Maps API free key

**End of day:** Map renders, user location shown, can search "restaurants" and see pins. ✅

### Day 3 — March 15 ✅
**Venice AI Search + Streaming**
- [x] Venice API integration (raw fetch, mistral-small-3-2-24b-instruct model)
- [x] Query parsing: Venice extracts intent (categories, time_filter, attributes, location_hint, radius)
- [x] SSE streaming — backend streams status → results → ranking to frontend
- [x] Search bar shows AI response with ranked results
- [x] Top pick with "Top Pick" badge + AI recommendation reason
- [x] Alternatives with "why not" labels (max 5 words each)
- [x] Zustand for client state management (replaces prop drilling)
- [x] TanStack Query provider set up (ready for future queries)
- [x] AI search hook (useAISearch) with SSE parsing + abort support
- [ ] Follow-up queries with context ("which ones have outdoor seating?")

**End of day:** User types "best tacos near me", gets AI-ranked results with top pick + alternatives + "why not" explanations. ✅

### Day 4 — March 16 ✅
**POI Enrichment Pipeline**
- [ ] ~~OSM enrichment via bridge files~~ — deferred (requires DuckDB + Parquet, too heavy for hackathon)
- [ ] ~~HERE API integration~~ — replaced with Google Places (HERE signup broken)
- [x] Google Places integration — photos, ratings, review count, price level, hours, open/closed, dine-in/takeout/delivery, wheelchair accessible
- [x] Place detail panel — photo header, star rating, open/closed badge, food type chips, service chips
- [x] Venice place intelligence briefing (2-3 sentence AI summary per place)
- [x] Place details fetched via TanStack Query with 5min cache
- [x] In-memory place cache on server (search results → detail lookups)
- [x] Privacy documentation for Google Places data flow
- [x] Expanded attestation vision — community data replaces Google over time

**End of day:** Place panel shows photo, rating, hours, open/closed, price level, services, AI briefing. ✅

### Day 5 — March 17 ✅
**Auth + Wallets + On-Chain Reviews — Write**
- [x] Coinbase CDP integration — email OTP signup, invisible wallet creation on Base
- [x] EAS schema design (review schema with rating, text, placeId, placeName, photoHash, lat, lng, qualityScore)
- [x] EAS schema deployment on Base Sepolia (registered, UID: 0x968e91f0...)
- [x] Review submission form (rating, text, structured prompts: what ordered, one tip)
- [x] Photo upload with EXIF GPS extraction (proof of visit, location verification badge)
- [x] Venice AI quality scoring (specificity, sentiment-rating consistency, flags)
- [x] Submit review as EAS attestation on Base (gas sponsored via CDP Paymaster)
- [x] Transaction confirmation UI ("Review submitted!" — no crypto jargon, EAS Explorer link)
- [x] Quality badge display (generic/decent/detailed/exceptional with score)

**End of day:** User signs up with email, gets invisible wallet. Can write a review with photo, Venice scores it, review goes on-chain. User never knows crypto is involved.

### Day 6 — March 18 ✅
**On-Chain Reviews — Read + Display**
- [x] Fetch reviews from EAS for a given place (EAS GraphQL → server endpoint → client hook)
- [x] Display reviews in place detail panel (ReviewList component with cards)
- [x] Venice review summarization (aggregate all reviews into AI briefing)
- [x] Identity display on reviews (account age, review count via EAS GraphQL)
- [x] Review photo upload + display (server-side storage keyed by SHA-256 hash)
- [x] Venice AI photo verification (metadata analysis: file size, GPS, dimensions)
- [x] Comparative recommendations ("compare these spots" — Venice-powered endpoint)

**End of day:** Full review loop — write on-chain, read, see AI summaries, identity display, review photos. Venice summarizes all reviews. Comparative recommendations endpoint ready. 104 tests passing (unit + integration + E2E). *App is hackathon-winning at this point.*

### Day 7 — March 19 ✅
**Navigation — Core**
- [x] TomTom Routing API integration (`server/tomtom.ts` + `/api/route` endpoint)
- [x] "Get directions" button on place detail panel
- [x] Route display on MapLibre (GeoJSON line layer with casing)
- [x] Turn-by-turn instruction panel (`NavigationPanel.tsx`)
- [x] Traffic-aware ETA display (duration, distance, traffic delay)
- [x] GPS tracking — follow user position along route (`watchPosition`)
- [x] TomTom API key registered and configured
- [x] Tests: unit (6), integration (4), E2E (8) — 18 total

**End of day:** Full flow works: search → pick place → get directions → see route with traffic-aware ETA and turn-by-turn. ✅

### Day 8 — March 20 ✅
**Navigation Polish + Privacy Page**
- [x] Navigation UX overhaul — big next-turn card (icon, street, distance), ETA summary at top, upcoming turn peek, full list behind "Steps" button
- [x] Fix EAS review load time — server-side review cache (2min TTL), identity+summary fetched in parallel (not sequential), loading skeleton in ReviewList
- [x] Speed limit display (TomTom sectionType=speedLimit, red circle sign in nav panel)
- [x] Lane guidance display (TomTom sectionType=lanes, dark lane bar with highlighted follow-lanes)
- [x] Re-routing when user goes off route (~50m threshold, auto-recalculates)
- [x] Privacy Comparison page — side-by-side: what Google collects vs. what we don't
  - 8 comparison categories with Google vs Ghost Maps cards
  - $7.3B+ fines section with 4 major cases
  - Transparency section (TomTom, Google Places, on-chain reviews)
  - Location tracking, search history, law enforcement, opt-out, cross-app, business interactions
- [x] Tests: 10 unit + 5 integration + 10 E2E = 25 new tests (129 server tests total)

**End of day:** Navigation complete with speed limits + rerouting. Privacy page tells the story. *App is a real product at this point.*

### Day 9 — March 19 (IN PROGRESS)
**Navigation & Search Polish (Drive Test Feedback)**

#### Spec

**Search**
- Happy: User searches on ghostmaps.app (production) → Google Places enrichment data loads (photos, hours, rating)
- Happy: User searches for a place 10+ miles away by name → result is found regardless of distance, closer matches ranked higher for category queries
- Integration: Production Google Places requires adding Railway server IP to API key whitelist (config task)
- Integration: Venice intent parsing distinguishes "specific place name" queries from "general category" queries
- Integration: Name-match queries search Overture with no radius cap; category queries search locally with distance-weighted ranking
- UX: Search results display distance from user's current position
- Edge: If query is a specific place name, distance never filters it out — results returned globally
- Edge: Distance shown on results so user understands why a far-away result appeared

**Navigation UI Overhaul**
- Happy: Next-turn card at top shows large direction icon, instruction text, and countdown distance; below it a smaller peek at the following turn
- Happy: User can expand full step list (Apple Maps style), defaults to collapsed while driving
- Happy: Bottom bar shows ETA (clock time), duration remaining, total route distance remaining, and "End" button
- Happy: 80%+ of map remains visible during active navigation
- UX: When turn is imminent (< 500 ft), next-turn card gets visual emphasis (color/size change)
- UX: Rerouting shows brief "Rerouting..." flash, not a disruptive modal

**Navigation: Live Distance Countdown**
- Happy: Distance to next maneuver counts down in real time as user drives toward it
- Integration: Distance calculated client-side from GPS position to next maneuver point, not static from TomTom
- Edge: Units switch naturally as user approaches (miles → feet or km → meters)

**Navigation: Position & Map**
- Happy: Current position shown as directional arrow pointing user's heading; destination shown as pin with place name in small text above
- Happy: Position animates smoothly between GPS updates (interpolated, not jumping)
- Happy: Map rotates to match user's heading during active navigation
- UX: Arrow rotation and map bearing changes are smooth/animated, not snapping
- UX: Destination pin name visible at all zoom levels during navigation
- Edge: If device doesn't provide heading, derive bearing from last two GPS positions
- Integration: Position interpolation happens client-side between GPS fixes (GL animation)

**Navigation: Rerouting**
- Happy: Rerouting triggers when user is genuinely off-route, recalculates automatically
- Edge: If user's position matches the current route geometry, reroute does NOT trigger — fixes the rapid-fire reroute loop
- Edge: GPS drift (brief off-route blip) does not trigger rerouting — requires sustained off-route position

**Navigation: Route Line**
- Happy: Route line is trimmed behind user's current position — only remaining route ahead is visible

#### Implementation
- [ ] Add Railway server IP to Google Places API key whitelist
- [x] Venice intent parsing: distinguish name/address/coordinate queries vs category queries
- [x] Search backend: name search via Google Places, address geocoding, coordinate parsing
- [x] Search results: show distance from user position
- [x] Navigation UI overhaul: next-turn card (top), peek at following turn, bottom bar (ETA, duration, distance, End button)
- [x] Expandable full step list (Apple Maps style, collapsed by default)
- [x] Live distance countdown (client-side calculation from GPS to next maneuver)
- [x] Distance unit switching (miles → feet / km → meters when close)
- [x] Directional arrow for current position (heading-oriented)
- [x] Destination pin with place name label
- [x] Smooth position interpolation between GPS fixes (CSS transitions on marker)
- [x] Map rotation to match user heading during navigation
- [x] Fix rerouting: haversine-based segment distance + 3-reading debounce
- [x] Rerouting: require sustained off-route position (debounce GPS drift)
- [x] Trim route line behind current position
- [x] Imminent turn emphasis (visual urgency at < 500 ft)
- [x] "Rerouting..." flash indicator
- [x] Tests: unit (TDD red/green) — 33 client + 45 server = 78 passing
- [ ] Integration tests
- [ ] E2E tests

### Day 10 — March 21
**Documentation + Polish**
- [ ] Comprehensive README (architecture, setup, tech stack, privacy model)
- [ ] API documentation (machine-readable for AI judges)
- [ ] Architecture diagram
- [ ] End-to-end flow testing: search → discover → reviews → navigate
- [x] Mobile-responsive layout (hamburger menu, search bar spacing)
- [ ] Loading states, error handling, edge cases
- [ ] UI/UX polish — smooth transitions, clean typography
- [ ] Customize Liberty map style (colors, theming, brand identity)
- [ ] Performance optimization (debounce search, cache results)
- [ ] Tests: unit, integration, E2E

**End of day:** App is polished. Documentation is thorough enough for AI agents to understand the full system.

### Day 11 — March 22
**Deploy + Demo + Submit**
- [x] Deploy to Railway (Express server + Vite static build, single service) — live at https://ghostmaps.app
- [x] Custom domain (ghostmaps.app) with SSL via Railway + Porkbun DNS
- [ ] Add production server IP to Google Places API key restrictions
- [ ] Restrict CDP Project domain allowlist to production domain only
- [ ] Add production domain to CDP Paymaster allowlist
- [ ] Switch EAS from Base Sepolia to Base mainnet (requires CDP billing or Gasless Campaign credits)
- [ ] Seed demo reviews (write a few real reviews so judges see the full experience)
- [ ] Demo script — rehearse the narrative
- [ ] Record demo video if required
- [ ] Write project description / submission
- [ ] Final bug fixes
- [ ] Tests: unit, integration, E2E (full regression)
- [ ] Submit

---

## Critical Path

```
Day 2: Map + Basic Search (foundation)
  ↓
Day 3: Venice AI Search (core differentiator)
  ↓
Day 4: POI Enrichment (makes search useful)
  ↓
Day 5-6: Auth + On-Chain Reviews (hackathon differentiator)
  ↓
Day 7-8: Navigation + Privacy Page (product differentiator)
  ↓
Day 9-10: Docs + Polish + Deploy
```

## What to Cut If Behind

Priority order (cut from bottom):

1. **Must have:** Map + Venice AI search + enriched place details
2. **Should have:** CDP auth + on-chain reviews + proof of visit
3. **Nice to have:** Navigation (traffic ETA, turn-by-turn), privacy comparison page
4. **Cut first:** Lane guidance, speed limits, re-routing, comparative recommendations

**Demo-worthy after Day 4.** Hackathon-winning after Day 6. Real product after Day 8.

---

## Open Items to Resolve

1. ~~**Map tile source**~~ — **RESOLVED: MapTiler Streets v2** (polished styling, dense POI labels, free 100K tiles/month)
2. **API keys to register:**
   - Overture REST API — ✅ using DEMO key (restricted to NYC/London/Paris/Bondi)
   - ~~HERE~~ — replaced with Google Places
   - Google Places API — ✅ registered, key in .env
   - TomTom — ✅ registered, key in .env (2,500 req/day free)
   - Coinbase CDP — ✅ registered, project ID in .env
   - Venice — ✅ have from hackathon
   - MapTiler — ✅ registered, key in .env (100K tiles/month free)
3. ~~**EAS schema fields**~~ — **RESOLVED:** `uint8 rating, string text, string placeId, string placeName, bytes32 photoHash, int256 lat, int256 lng, uint8 qualityScore` — UID: `0x968e91f0...`
4. ~~**App name**~~ — **RESOLVED: Ghost Maps** (ghostmaps.app)
5. ~~**Photo storage**~~ — **RESOLVED:** Server-side filesystem storage keyed by SHA-256 hash. Photos uploaded alongside on-chain submission. Migrate to IPFS/S3 post-hackathon.
6. ~~**Gas sponsorship**~~ — **RESOLVED:** CDP Paymaster on Base Sepolia. Users pay $0.
7. **Deployment target** — **RESOLVED: Railway** (single service — Express serves API + Vite static build). SSE streaming + file uploads need a long-running process, not serverless.

---

## Venice Integration Points (6 total — all implemented)

Venice is central to the app, not a utility:

1. **Conversational search** — parse natural language queries, rank results, explain recommendations ✅
2. **Place intelligence briefing** — synthesize all POI data into natural language summary ✅
3. **Review quality scoring** — specificity, sentiment-rating consistency ✅
4. **Review summarization** — aggregate all reviews for a place into a briefing ✅
5. **Photo verification** — metadata analysis (file size, GPS, dimensions) ✅
6. **Comparative recommendations** — compare places using reviews + data, explain tradeoffs ✅

---

## Privacy Coverage (vs. Google Maps)

| Google Maps Collects | Our App |
|---|---|
| Location every ~2 minutes | No location storage. Venice = zero retention. |
| Every search query saved | Venice = zero data retention |
| Navigation routes + speed + stops | TomTom calculates route, we don't store it |
| Every business view, click, call | No interaction tracking |
| Reviews tied to real identity | Pseudonymous (wallet address only) |
| Cross-app profiling (YouTube, Search, Ads) | No other services, no ad network |
| 11,500+ geofence warrants/year | Nothing to hand over |
| Tracked 98M users who opted out | No opt-out needed — data never exists |

**Transparency notes:**
- **TomTom** sees origin + destination for route calculation. Valhalla (open-source routing) lacks real-time traffic data and no open alternative exists, so TomTom is likely a permanent dependency. We send zero user identity — just anonymous origin/destination coordinates.
- **Google Places** sees place name + coordinates when a user taps a place for details. Google does NOT see who searched, what they searched for, or the user's location. We send zero user data — only public business identifiers. Long-term, replace with self-hosted OSM data + community contributions.

---

## Verification / Demo Flow

1. Open app → map renders with user location
2. Type "best indian food near me" → streaming AI response with top pick + alternatives + "why not" explanations
3. Tap recommended place → place details with hours, cuisine, AI summary, on-chain reviews, user photos
4. Sign up with email → invisible wallet created on Base
5. Write a review → take photo, rate, describe → Venice scores quality → submit on-chain (free, gas sponsored)
6. See review appear with quality badge + ERC-8004 identity
7. Tap "Get directions" → route with traffic-aware ETA, turn-by-turn, speed limits, lane guidance
8. Show Privacy Comparison page → "Here's what Google collects. Here's what we don't."
