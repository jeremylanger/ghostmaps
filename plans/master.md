# Private Maps with Trustworthy On-Chain Reviews

## Vision

A private, AI-powered maps app with on-chain reviews that can't be deleted, manipulated, or extorted. Google Maps search quality without the surveillance. Yelp-quality reviews without the pay-to-play.

**Venice pitch:** "Google knows every place you've searched for, every review you've read, every business you've visited. This app gives you the same experience — AI-powered search, trustworthy reviews — without anyone knowing where you go or what you're looking for."

Open source. Built on Ethereum (Base). Privacy by design.

---

## Core Components

### 1. Map Layer
- **MapLibre GL JS** for rendering (open source, vector tiles)
- **MapTiler Streets v2** for map tiles (polished styling, dense POI labels, terrain shading, free 100K tiles/month)
- **Overture Maps Foundation** for POI data (64M+ POIs, 2,100+ categories, permissive license)
- POI data includes: name, location, category hierarchy, address, phone, website, brand, confidence score
- POI data does NOT include: hours, reviews, photos, ratings (we fill this gap)

### 2. Private AI Search (Venice)
- Natural language search: "late night tacos near me" or "quiet coffee shop with wifi"
- Venice interprets queries against Overture POI data — zero data retention
- Venice API is OpenAI-compatible (`https://api.venice.ai/api/v1`)
- Model: GLM 4.7 (128k context) or similar
- Also used for: review summarization, pattern detection, suspicious review flagging
- User's search history, location, and reading behavior never stored anywhere

### 3. On-Chain Attestations (EAS on Base)
- **Ethereum Attestation Service (EAS)** for reviews AND business data — no custom token needed
- Already deployed on Base with sub-cent transaction costs
- Attestation types: reviews, hours, status, menus, attributes, photos, corrections
- All attestations are immutable — businesses can't pay to remove them, platforms can't filter them
- Composable — other apps can read/build on the data
- **Long-term:** community-contributed business data replaces Google Places dependency

### 4. Review Authenticity (6-Layer Defense)
- Detailed in [plans/reviews.md](reviews.md)
- **Hackathon MVP:** Identity (ERC-8004) + Proof of visit (photo + EXIF GPS) + Quality scoring (Venice AI)
- **V2+:** Stake & challenge, soulbound reputation, quadratic decay, token incentives
- Goal: reward genuine contributions while making gaming economically/technically infeasible

---

## Why This Wins Venice's Bounty

**Scoring Criteria:**

1. **Confidentiality as a design requirement**
   - All search queries processed via Venice (zero retention)
   - Location data never leaves the client
   - No user accounts required for browsing
   - Review reading behavior is private
   - No ads, no tracking, no data harvesting

2. **Agent architecture and trust design**
   - Venice AI agent handles search interpretation and review analysis
   - On-chain reviews create a trust layer that doesn't depend on any platform
   - Agent can privately summarize reviews, detect fake patterns, recommend places
   - Human always in control of what data is shared

3. **Problem legitimacy**
   - Google Maps: surveillance machine that tracks everywhere you go and search for
   - Yelp: ~700 lawsuits alleging pay-to-play review manipulation
   - Amazon: 16-20% of 250M+ reviews may be fake, $788B in unwanted purchases annually
   - Google removed 240M fake reviews in 2024 alone
   - Private map alternatives exist but search is terrible (Organic Maps ~70% accuracy)
   - NO private maps app has AI-powered search or trustworthy reviews

4. **Scope and demo quality**
   - Demo flow: open map -> natural language search via Venice -> see Overture POI results -> read/leave on-chain reviews via EAS on Base
   - Tight, focused, end-to-end demo-able in 10 days

---

## Technical Architecture

```
User (browser/mobile)
  |
  v
MapLibre GL JS  <--- Overture PMTiles (serverless, no backend needed)
  |
  v
Venice API  <--- Natural language query interpretation
  |                 Review summarization & analysis
  |                 Zero data retention
  v
Overture Maps Data  <--- 64M+ POIs, queryable by category
  |                       DuckDB or community REST API
  v
EAS on Base  <--- Review attestations
                   Sub-cent transaction costs
                   Immutable, composable, no token needed
```

### Key Technical Decisions
- **MapTiler Streets v2 for tiles** — polished, dense POI labels at zoom 12+, free tier (100K/month)
- **Overture data access** — community REST API or pre-processed subset via DuckDB
- **Venice as OpenAI-compatible endpoint** — standard SDK, simple integration
- **Base L2** — sub-cent transactions, EAS already deployed, ERC-8004 registration already on Base

---

## Research: Overture Maps Data

### POI Record Fields
| Field | Description |
|-------|-------------|
| id | Globally unique (GERS format) |
| geometry | Lat/lon point |
| names.primary | Business name |
| categories.primary | Specific category (e.g., pizza_restaurant) |
| basic_category | ~280 high-level labels (e.g., casual_eatery) |
| taxonomy.hierarchy | Full path: [food_and_drink, restaurant, casual_eatery] |
| confidence | 0-1 float — filter to >0.85 for reliable results |
| addresses | Freeform + locality + postcode + region + country |
| phones | Phone numbers |
| websites | URLs |
| brand | Brand name + Wikidata ID |
| operating_status | open / temporarily_closed / permanently_closed |

### Data Sources (64M+ places)
| Source | Count |
|--------|-------|
| Meta (Facebook/Instagram) | 58.96M |
| Foursquare | 6.0M |
| Microsoft | 5.6M |
| AllThePlaces (web scraping) | 1.55M |
| Others | ~280K |

### Access Methods
- Python CLI: `pip install overturemaps` then `overturemaps download --bbox=... -f geojson --type=place`
- DuckDB: SQL queries against cloud-hosted Parquet files
- PMTiles: Direct MapLibre integration for rendering
- Community REST API: [overturemapsapi.com](https://www.overturemapsapi.com/)
- Updated monthly, latest release: 2026-02-18.0

---

## Research: On-Chain Reviews & Authenticity

See [plans/reviews.md](reviews.md) for full research on:
- Why previous on-chain review projects failed (Revain, Dentacoin, etc.)
- The fake review problem at scale ($788B consumer cost)
- 6-layer defense system (identity, proof of visit, quality scoring, stake & challenge, reputation, quadratic decay)
- What we build for hackathon vs V2/V3

---

## Research: Private Maps Alternatives

### Current Landscape
| App | Privacy | Search Quality | Traffic | UX | Status |
|-----|---------|---------------|---------|-----|--------|
| Google Maps | Terrible | Excellent | Excellent | Excellent | Surveillance machine |
| Apple Maps | Good | Good | Good | Good | Apple-only, closed source |
| Organic Maps | Excellent | Poor | None | Good | Governance scandal -> CoMaps fork |
| CoMaps | Excellent | Poor | None | Good | Young, improving |
| OsmAnd | Excellent | Decent | None* | Terrible | "Linux of maps" |
| Magic Earth | Questionable | Decent | Has it | Was good | Paywalled Nov 2025, closed source |

*OsmAnd has a Google traffic overlay plugin which defeats the purpose

### The Search Gap
Google's advantage comes from: 200M+ self-maintained business profiles, Knowledge Graph, billions of reviews/photos, web crawling, behavioral signals, and Gemini AI integration. OSM-based apps use Nominatim (~70% accuracy) which can't handle natural language.

**Our opportunity:** Venice + Overture Maps = private natural language search that's dramatically better than Nominatim, without any of Google's surveillance.

---

## Resolved Questions

### 1. User Identity & Auth — RESOLVED
- **Coinbase CDP Embedded Wallets** for auth + wallet creation
- Email OTP signup → invisible non-custodial wallet on Base in <500ms
- User never sees seed phrase, MetaMask, or crypto jargon
- Gas sponsored via CDP Paymaster — users pay $0
- ERC-8004 for on-chain identity/trust signal on reviews
- Can migrate to Supabase + CDP (custom JWT mode) later if needed

### 2. Token Incentives — RESOLVED
- **Decided:** Skip for hackathon. Focus on intrinsic motivation.
- V2 question remains: can tokens work with proof-of-visit + quality scoring?

### 3. Data Freshness — DEFERRED
- Not a hackathon concern. Overture updates monthly.

### 4. Revenue / Sustainability — DEFERRED
- Not a hackathon concern.

### 5. Mobile vs Web — RESOLVED
- **Web app, mobile-responsive.** React + Vite + MapLibre.
- Mobile native (React Native / Expo) is a post-hackathon play.

### 6. EAS Schema Design — RESOLVED
- Schema: `uint8 rating, string text, string placeId, string placeName, bytes32 photoHash, int256 lat, int256 lng, uint8 qualityScore`
- Schema UID: `0x968e91f0274b78a31037839b55e59b942dd1521daebf9190268137e450b7d69f`
- Registered on Base Sepolia, non-revocable, zero resolver
- lat/lng stored as int256 (value * 1e6) to avoid floating point in Solidity

### 7. Venice + Overture Search Integration — RESOLVED
- Venice receives natural language query + user lat/lng (zero retention)
- Venice extracts intent → structured query with `query_type`: "category", "name", or "address"
- **Category queries** (e.g. "best tacos near me"): Overture REST API with radius + distance-weighted ranking
- **Name queries** (e.g. "Verve Coffee"): Google Places Text Search API (no radius cap)
- **Address queries** (e.g. "123 Main St, LA"): Google Places geocoding
- **Raw coordinates** (e.g. "34.0522, -118.2437"): parsed client-side, skip Venice
- All results include distance from user's position
- Venice ranks category results, recommends top pick with "why not" for alternatives
- Streamed via SSE
- Smart search bar UX (not chat interface)

### 10. Google Places Enrichment — RESOLVED
**What we send:** Business name + address + coordinates. That's it.
**What we DON'T send:** User identity, user location, search queries, browsing behavior, session data — nothing that identifies or tracks our users.

**Why we use it:** Google has the best business data on earth (~95% coverage for hours, ratings, photos). OSM has ~39% coverage. For a hackathon demo, the difference is the entire place panel being empty vs. rich and useful.

**How it fits the privacy narrative:** Ghost Maps protects *user* data — your searches, your location history, where you go, what you look at. Business data (hours, ratings, photos) is public information about commercial establishments. We query it server-side by place name/address, the same way any person could look it up. Google learns nothing about our users from these requests.

**Data flow:**
```
User searches → Venice AI (zero retention) → Overture POIs (open data)
User taps a place → Backend sends [place name + coords] to Google → Gets hours/rating/photo
                     Google sees: "someone looked up Verve Coffee at 214 S Main St"
                     Google does NOT see: who searched, what they searched for, their location
```

**Long-term:** Replace with self-hosted OSM data + community-contributed hours/photos once coverage improves. Google Places is a bridge, not the architecture.

### 8. App Name — RESOLVED
- **Ghost Maps** — ghostmaps.app (purchased)
- "Leave no trace." / "Maps that don't follow you home."
- Ghost = invisible, no trace, can't be tracked — perfect privacy metaphor
- Logo: ghost icon on a map pin

### 9. 10-Day Build Scope — RESOLVED
- See [build-plan.md](build-plan.md) for full day-by-day plan
- Critical path: Map → Venice Search → Enrichment → Reviews → Navigation → Polish
- Cut list prioritized: navigation polish first to cut, core search last

### 10. Deployment — RESOLVED
- **Railway** — single service (Express serves API + Vite static build)
- **Domain:** ghostmaps.app (Porkbun DNS → ALIAS to Railway edge)
- **SSL:** Auto-provisioned by Railway (Let's Encrypt)
- **Build:** Nixpacks (Node.js auto-detected), `npm install --legacy-peer-deps` for client (CDP React peer dep conflict)
- **Env vars:** Set via `railway vars set` (not committed — VITE_* vars needed at build time)
- **Deploy:** `railway up` from repo root

---

## Hackathon Timeline (March 13-22)

See detailed day-by-day build plan. Summary:
- Day 1: Planning ✅
- Day 2: Map + basic search ✅
- Day 3: Venice AI search + streaming ✅
- Day 4: POI enrichment (Google Places) ✅
- Day 5: CDP auth + on-chain reviews (write) ✅
- Day 6: On-chain reviews (read + display + summarization) ✅
- Day 7: Navigation core (route display, turn-by-turn, GPS tracking) ✅
- Day 8: Navigation polish (speed limits, lane guidance, rerouting) + privacy page ✅
- Day 9: Navigation overhaul (drive test feedback), search by name/address/coordinates ✅
- Day 9.5: Navigation fixes round 2 (instruction consolidation, step advancement, live ETA, position smoothing, camera offset, rerouting sensitivity) ✅
- Day 9.75: Navigation fixes round 3 (step progression rewrite with proximity+direction scan, trailing path projection, address search location bias) ✅
- Days 10-11: Documentation + polish + deploy (deployed to ghostmaps.app via Railway)

---

## Post-Hackathon Roadmap

Priority features for Google Maps parity (in rough order):

1. **Menus & pricing** — user-contributed via structured review prompts ("what did you order?"). Venice can also scrape restaurant websites for menu data. Price level ($ to $$$$) from HERE or community-tagged.
2. **Transit directions** — GTFS feeds (3,000+ agencies publish free data) + OpenTripPlanner (open source multimodal routing engine). ~1-2 weeks of work. Transitland API aggregates 2,500+ feeds.
3. **Offline maps** — MapLibre supports offline tile caching. Overture data can be pre-downloaded per region.
4. **Save/organize places into lists** — simple feature, just needs user storage
5. **Speed cameras / police alerts** — community-contributed (Waze model)
6. **Gas prices / EV charging** — TomTom already has this data in their API
7. **Indoor maps** — complex, likely last priority
8. ~~**Self-hosted routing (Valhalla)**~~ — Valhalla lacks real-time traffic data and no open alternative exists. TomTom is likely a permanent dependency (zero user identity sent).
9. **Supabase auth migration** — add social login (Google, Apple) via Supabase + CDP custom JWT mode

### Decided against
- **Bright Data / scraped Google data** — legal risk, ironic for a privacy app, and our Overture + OSM + HERE stack provides sufficient data for the hackathon
- **Token incentives** — deferred to V2, after proof-of-visit + quality scoring are battle-tested

---

## Research Documents

All research from Day 1 planning is captured in these files:

- [poi-data-research.md](poi-data-research.md) — POI data source comparison (Overture vs OSM vs Google vs HERE vs Yelp etc.), enrichment pipeline design, OSM opening hours coverage stats, competitive landscape
- [navigation-research.md](navigation-research.md) — TomTom vs HERE vs OSRM/Valhalla comparison, API details, features, pricing
- [photos-research.md](photos-research.md) — Place photo sources (Google blocked by ToS, TripAdvisor, Mapillary, user-generated strategy)
- [google-surveillance-research.md](google-surveillance-research.md) — Comprehensive Google Maps data collection practices, $7.3B+ in legal penalties, privacy comparison table
- [auth-wallets-research.md](auth-wallets-research.md) — Coinbase CDP vs Privy vs RainbowKit, embedded wallet architecture, pricing, migration path
- [hackathon-strategy.md](hackathon-strategy.md) — Judging criteria (AI agents + humans), Venice bounty criteria, winning strategy
- [reviews.md](reviews.md) — 6-layer review authenticity system, hackathon MVP scope, why previous on-chain review projects failed
- [token-incentivized-reviews-research.md](token-incentivized-reviews-research.md) — Deep research on token incentive models (decided to skip for hackathon)

Day-by-day build plan is at: `~/.claude/plans/iridescent-swinging-island.md`

---

## External Resources

- [Overture Maps Docs](https://docs.overturemaps.org/)
- [Overture Maps GitHub](https://github.com/OvertureMaps)
- [Overture REST API](https://www.overturemapsapi.com/)
- [MapLibre](https://maplibre.org/)
- [EAS Docs](https://docs.attest.org/)
- [EAS on Base Explorer](https://base.easscan.org/schemas)
- [Venice API Docs](https://docs.venice.ai/)
- [Venice API Base URL](https://api.venice.ai/api/v1)
- [ERC-8004 Spec](https://eips.ethereum.org/EIPS/eip-8004)
- [Hackathon Page](https://synthesis.devfolio.co)
- [HERE Developer](https://developer.here.com/)
- [TomTom Developer](https://developer.tomtom.com/)
- [Coinbase CDP](https://portal.cdp.coinbase.com/)
- [OSM opening_hours.js](https://github.com/opening-hours/opening_hours.js/)
- [Overture Bridge Files](https://docs.overturemaps.org/gers/bridge-files/)
