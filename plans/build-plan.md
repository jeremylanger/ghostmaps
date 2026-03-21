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
| POI Data | Google Places API (Nearby Search + Text Search + enrichment, server-side) |
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
- [x] Tests: 151 passing (33 client unit + 78 server unit + 40 E2E)
- [x] Code review: deduplicated haversine in exif.ts, bounded reviewCache, optimized route display renders

### Day 9.5 — March 19 (Drive Test Feedback Round 2)
**Navigation Fixes from Live Driving**

#### Spec

**Route Preview**
- Happy: Clicking "Directions" shows estimated time, distance, and route on map before navigation starts — user decides whether to go
- UX: Loading indicator shown while route calculates after clicking "Directions"

**Instruction Consolidation**
- Happy: Highway stretches show "In 5 mi, take exit 250" instead of individual keep-left/keep-right maneuvers for slight curves
- Edge: Consecutive same-road maneuvers (keep-left, keep-right, slight curves) merge into single "continue for X miles" — genuine decision points (exits, forks, turns) still show individually
- Edge: When two maneuvers are close together (e.g., "exit then immediately turn right"), both show in sequence without skipping the first
- Integration: Consolidation logic testable with sample TomTom instruction arrays — no real driving needed

**Step Advancement**
- Happy: As soon as user passes a maneuver point, instructions advance to the next one — no 10-second lag
- Happy: Full steps panel highlights the correct current step based on actual progress, not premature proximity
- Integration: Must require passing the current maneuver point before advancing — not just being closest to the next one

**Live ETA**
- Happy: Remaining duration recalculates from current position as user drives — not frozen from initial route calculation
- Happy: Arrival time updates accordingly — duration and clock time always stay consistent

**Camera Position**
- Happy: User's position marker sits in the lower third of the screen, giving ~70% forward visibility of the road ahead

**Position Smoothing**
- UX: Position marker animates between GPS fixes by interpolating lat/lng over time via requestAnimationFrame — no visible jumping
- Integration: Browser watchPosition fires every 1-3 seconds — interpolation fills gaps smoothly between fixes
- Edge: If GPS signal drops briefly (tunnel, overpass), position interpolates forward along the route rather than freezing or jumping

**Rerouting**
- Happy: Rerouting triggers when user is genuinely off-route, recalculates automatically
- UX: Brief "Rerouting..." indicator, no modal
- Edge: Tighten off-route threshold (current 50m too forgiving) — parallel roads 100-200 ft away should trigger reroute
- Edge: GPS drift on the correct road does not trigger rerouting — factor in direction of travel
- Edge: Reroute generates fresh consolidated instructions — doesn't patch the old set

#### Implementation
- [x] Route preview: show time/distance/traffic after clicking "Directions", before starting navigation
- [x] Instruction consolidation: merge consecutive same-road keep-left/keep-right into "continue for X miles"
- [x] Step advancement: require passing maneuver point before advancing (dot product directional check)
- [x] Live ETA: recalculate remaining duration and arrival time from current position (avg speed extrapolation)
- [x] Camera position: offset map center ~111m forward in heading direction so user sits in lower third
- [x] Position smoothing: requestAnimationFrame interpolation between GPS fixes with ease-out curve
- [x] Rerouting: tightened to 30m threshold + direction-of-travel check (>60° divergence = off-route)
- [x] Tests: 55 client tests passing (22 new: consolidation + step advancement + direction check), 78 server tests passing
- [x] Code review: fixed prevPosRef bug, stale refs on re-nav, straight-line distance → route segments, sameRoad permissiveness, easeTo→jumpTo, ETA dedup

### Day 9.75 — March 19 (Drive Test Feedback Round 3)
**Navigation & Search Fixes from Live Driving**

#### Spec

**Navigation Step Progression (Critical)**
- Happy: Current instruction always corresponds to the user's actual next maneuver
- Happy: Instruction advances to the next one within 1-2 GPS updates after passing a maneuver point
- Happy: After a reroute, the correct step is identified immediately — not stuck on step 1
- Happy: Final "Arrive" instruction is shown when user reaches destination
- Edge: Inaccurate first GPS fix (cold start) doesn't cause step to jump ahead
- Edge: User on a parallel road close to the route doesn't cause premature advancement
- Edge: Very short steps (e.g., "turn left then immediately turn right") don't get skipped
- Edge: Momentary GPS jump backwards doesn't regress to a previous instruction
- Failure: GPS accuracy >50m doesn't trigger advancement decisions on unreliable data
- Failure: Malformed instruction points don't crash navigation — falls back to first/last valid instruction
- UX: Instruction banner updates smoothly, no flickering between steps
- UX: Distance to next maneuver counts down continuously, never grows unless rerouted

**Trailing Path Not Clearing**
- Happy: Route line behind user arrow is never visible — arrow "eats" the path as it moves
- Happy: When user is stopped, trail behind them is still fully cleared up to their position
- Edge: At navigation start, no trail visible behind starting position
- Edge: Long straight roads with sparse coordinates still clear smoothly, not in chunk jumps
- Failure: If closest segment snaps to a far-ahead segment, trail doesn't jump and reveal a gap
- UX: Smooth transition from trail-visible to trail-cleared
- UX: No visual gap between user arrow and start of remaining route line

**Address Search Location Bias**
- Happy: Partial address like "123" shows suggestions near user's current location
- Happy: "123 maple" returns results biased toward user's location, not globally
- Edge: Just numbers like "123" doesn't return zero results — shows nearby matches or waits for more input
- Edge: Addresses beyond 50km still return results — bias is preference, not cutoff
- Failure: Zero Google Places results for partial address shows meaningful empty state
- Failure: Venice misclassifying "123" as category still attempts something reasonable
- UX: "Understanding your search..." status visible while Venice classifies short queries
- UX: No unnecessary delay — ranking skipped for address results

#### Implementation
- [x] Fix step progression: `findBestInstruction()` scans all instructions forward, uses proximity (80m) + dot product, gates on GPS accuracy (>50m ignored), can skip multiple steps
- [x] Fix trailing path: `trimRouteAhead()` now projects user position onto closest segment (not slice at boundary), so trail clears smoothly at exact position
- [x] Fix address search: `geocodeAddress()` now accepts userLat/userLng and sends 50km locationBias to Google Places; Venice prompt updated with partial address examples ("123", "123 maple")
- [x] Tests: 59 client tests passing (10 new: skip-ahead, GPS accuracy gating, far-from-route, snap-to-nearest, short steps)

### Day 10 — March 20 (IN PROGRESS)
**Documentation + Polish + Architecture Simplification**
- [x] Comprehensive README (architecture, setup, tech stack, privacy model)
- [x] API documentation (machine-readable for AI judges)
- [x] Remove Overture Maps — all search now via Google Places (Nearby Search for categories, Text Search for names)
- [x] Google Places Nearby Search with rating sort for category queries
- [x] Remove redundant ranking summary (Venice prompt simplified)
- [x] Fix silent catch blocks (CLAUDE.md compliance)
- [x] Hoist ENRICHMENT_FIELD_MASK to module scope
- [x] Fix z-index: place panel and nav preview render above map controls
- [x] Reposition zoom/compass controls above locate button (bottom-right stack)
- [x] Shrink locate button to match map control sizing
- [x] Polish nav bottom bar: uniform font sizes, split value/unit styling
- [x] Redesign place panel action buttons (Apple Maps style: 4-col grid, icon+label)
- [x] Move rating/address into scrollable area (only header + buttons pinned)
- [x] Mobile-responsive layout (hamburger menu, search bar spacing)
- [ ] Architecture diagram
- [ ] End-to-end flow testing: search → discover → reviews → navigate
- [ ] Loading states, error handling, edge cases
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
