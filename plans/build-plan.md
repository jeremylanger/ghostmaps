# 10-Day Hackathon Build Plan (March 13-22)

## Context

Building a private AI-powered maps app with on-chain reviews and navigation. Privacy-first alternative to Google Maps — private search via Venice AI, trustworthy on-chain reviews via EAS on Base, and navigation without location tracking.

**The pitch:** "Google Maps tracks your location every 2 minutes and has paid $7.3B+ in privacy fines. We built the alternative — AI-powered search, trustworthy on-chain reviews, and real navigation, without anyone knowing where you go."

**Hackathon strategy:** AI agents judge this hackathon. Code quality, documentation, machine-readable artifacts, and on-chain proof matter as much as the demo. Venice bounty criteria: originality, ecosystem alignment (privacy), growth potential, technical depth, proof of work.

---

## Confirmed Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + MapLibre GL JS |
| Backend | Node.js + Express |
| AI | Venice API (OpenAI-compatible, zero data retention) |
| POI Search | Overture REST API → OSM enrichment → HERE fallback |
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

### Day 2 — March 14 (IN PROGRESS)
**Map Foundation + Basic Search**
- [x] Project scaffolding (React + Vite frontend, Node + Express backend)
- [x] MapLibre rendering with base map tiles — **OpenFreeMap** (liberty style)
- [x] User GPS location on map (browser Geolocation API)
- [x] Overture REST API integration — category + location search (no text search — API only supports category/brand/location filters)
- [x] Display search results as pins on the map
- [x] Smart search bar UI (top of screen, results as cards below map)
- [x] Place detail panel — tap a pin/result to see name, category, address, phone, website
- [ ] Sign up for Overture Maps API free key (currently using DEMO key, restricted to NYC/London/Paris/Bondi)

**End of day:** Map renders, user location shown, can search "restaurants" and see pins. ✅ (working with demo key in NYC)

### Day 3 — March 15
**Venice AI Search + Streaming**
- [ ] Venice API integration (OpenAI-compatible SDK, `stream: true`)
- [ ] Query parsing: Venice extracts intent (categories, location, radius, time)
- [ ] SSE streaming — backend streams Venice response to frontend
- [ ] Search bar shows streaming AI response with ranked results
- [ ] Top pick with recommendation + alternatives with "why not" (up to 5 words each)
- [ ] Follow-up queries with context ("which ones have outdoor seating?")

**End of day:** User types "indian food near me", gets streaming AI response with top pick + alternatives + brief "why not" explanations.

### Day 4 — March 16
**POI Enrichment Pipeline**
- [ ] OSM enrichment via bridge files — add opening hours, cuisine, wifi, outdoor seating
- [ ] HERE API integration — fallback for missing hours + TripAdvisor/Yelp reference IDs
- [ ] Place detail panel — tap a pin/result to see full place info
- [ ] Venice place intelligence briefing (synthesize all data into natural language summary)
- [ ] "Open now" filtering (using hours from OSM/HERE)

**End of day:** Search results show enriched data. Place panel shows hours, cuisine, AI summary. Time-based queries work when hours data available.

### Day 5 — March 17
**Auth + Wallets + On-Chain Reviews — Write**
- [ ] Coinbase CDP integration — email OTP signup, invisible wallet creation on Base
- [ ] EAS schema design and deployment on Base
- [ ] Review submission form (rating, text, structured prompts)
- [ ] Photo upload with EXIF GPS extraction (proof of visit)
- [ ] Venice AI quality scoring (specificity, sentiment-rating consistency)
- [ ] Submit review as EAS attestation on Base (gas sponsored, invisible to user)
- [ ] Transaction confirmation UI ("Review submitted!" — no crypto jargon)

**End of day:** User signs up with email, gets invisible wallet. Can write a review with photo, Venice scores it, review goes on-chain. User never knows crypto is involved.

### Day 6 — March 18
**On-Chain Reviews — Read + Display**
- [ ] Fetch reviews from EAS for a given place
- [ ] Display reviews in place detail panel
- [ ] Venice review summarization (aggregate all reviews into briefing)
- [ ] ERC-8004 identity display on reviews (account age, trust signal)
- [ ] Review photos displayed as place photos (solves cold-start photo problem)
- [ ] Venice AI photo verification (not AI-generated, matches business type)
- [ ] Comparative recommendations ("compare these 3 spots")

**End of day:** Full review loop — write on-chain, read, see AI summaries, photos from reviews show on places. *App is hackathon-winning at this point.*

### Day 7 — March 19
**Navigation — Core**
- [ ] TomTom Routing API integration
- [ ] "Get directions" button on place detail panel
- [ ] Route display on MapLibre (GeoJSON line layer)
- [ ] Turn-by-turn instruction panel
- [ ] Traffic-aware ETA display
- [ ] GPS tracking — follow user position along route

**End of day:** Full flow works: search → pick place → get directions → see route with traffic-aware ETA and turn-by-turn.

### Day 8 — March 20
**Navigation Polish + Privacy Page**
- [ ] Speed limit display (TomTom Snap to Roads API)
- [ ] Lane guidance display
- [ ] Re-routing when user goes off route
- [ ] Privacy Comparison page — side-by-side: what Google collects vs. what we don't
  - Location tracking (every 2 min vs. zero storage)
  - Search history (saved forever vs. zero retention)
  - Law enforcement (11,500 geofence warrants vs. nothing to hand over)
  - Business profiling (every click tracked vs. no tracking)
  - $7.3B+ in fines vs. privacy by architecture

**End of day:** Navigation complete with speed limits + lane guidance. Privacy page tells the story. *App is a real product at this point.*

### Day 9 — March 21
**Documentation + Polish**
- [ ] Comprehensive README (architecture, setup, tech stack, privacy model)
- [ ] API documentation (machine-readable for AI judges)
- [ ] Architecture diagram
- [ ] End-to-end flow testing: search → discover → reviews → navigate
- [ ] Mobile-responsive layout
- [ ] Loading states, error handling, edge cases
- [ ] UI/UX polish — smooth transitions, clean typography
- [ ] Performance optimization (debounce search, cache results)

**End of day:** App is polished. Documentation is thorough enough for AI agents to understand the full system.

### Day 10 — March 22
**Deploy + Demo + Submit**
- [ ] Deploy (Vercel for frontend, Railway/Fly.io for backend)
- [ ] Seed demo reviews (write a few real reviews so judges see the full experience)
- [ ] Demo script — rehearse the narrative
- [ ] Record demo video if required
- [ ] Write project description / submission
- [ ] Final bug fixes
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

1. ~~**Map tile source**~~ — **RESOLVED: OpenFreeMap** (liberty style, free, no API key needed)
2. **API keys to register:**
   - Overture REST API (overturemapsapi.com) — using DEMO key, need free account for full access
   - HERE (developer.here.com) — 1K req/day free
   - TomTom (developer.tomtom.com) — 2,500 req/day free
   - Coinbase CDP (portal.cdp.coinbase.com) — 5K ops/month free
   - Venice — already have from hackathon
3. **EAS schema fields** — finalize before Day 5 (rating, text, photo hash, GPS, Overture POI ID, quality score)
4. **App name** — still TBD
5. **Photo storage** — IPFS (Pinata?) or S3 for hackathon
6. **Gas sponsorship** — CDP Paymaster setup for Base (users pay $0)
7. **Deployment target** — Vercel (frontend) + Railway or Fly.io (backend)

---

## Venice Integration Points (6 total)

Venice is central to the app, not a utility:

1. **Conversational search** — parse natural language queries, rank results, explain recommendations
2. **Place intelligence briefing** — synthesize all POI data into natural language summary
3. **Review quality scoring** — specificity, sentiment-rating consistency
4. **Review summarization** — aggregate all reviews for a place into a briefing
5. **Photo verification** — detect AI-generated images, verify photo matches business type
6. **Comparative recommendations** — compare places using reviews + data, explain tradeoffs

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

**One transparency note:** TomTom sees origin + destination for route calculation. Long-term, self-host Valhalla for fully private routing.

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
