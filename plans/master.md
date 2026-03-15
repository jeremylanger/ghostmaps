# Private Maps with Trustworthy On-Chain Reviews

## Vision

A private, AI-powered maps app with on-chain reviews that can't be deleted, manipulated, or extorted. Google Maps search quality without the surveillance. Yelp-quality reviews without the pay-to-play.

**Venice pitch:** "Google knows every place you've searched for, every review you've read, every business you've visited. This app gives you the same experience — AI-powered search, trustworthy reviews — without anyone knowing where you go or what you're looking for."

Open source. Built on Ethereum (Base). Privacy by design.

---

## Core Components

### 1. Map Layer
- **MapLibre GL JS** for rendering (open source, vector tiles)
- **Overture Maps Foundation** for POI data (64M+ POIs, 2,100+ categories, permissive license)
- **Overture PMTiles** for serverless tile hosting — integrates directly with MapLibre
- POI data includes: name, location, category hierarchy, address, phone, website, brand, confidence score
- POI data does NOT include: hours, reviews, photos, ratings (we fill this gap)

### 2. Private AI Search (Venice)
- Natural language search: "late night tacos near me" or "quiet coffee shop with wifi"
- Venice interprets queries against Overture POI data — zero data retention
- Venice API is OpenAI-compatible (`https://api.venice.ai/api/v1`)
- Model: GLM 4.7 (128k context) or similar
- Also used for: review summarization, pattern detection, suspicious review flagging
- User's search history, location, and reading behavior never stored anywhere

### 3. On-Chain Reviews (EAS on Base)
- **Ethereum Attestation Service (EAS)** for review storage — no custom token needed
- Already deployed on Base with sub-cent transaction costs
- Custom review schema: rating, text, category tags, timestamp, location hash
- Reviews are immutable — businesses can't pay to remove them, platforms can't filter them
- Composable — other apps can read/build on review data

### 4. Review Authenticity (6-Layer Defense)
- Detailed in [plans/reviews.md](reviews.md)
- **Hackathon MVP:** Identity (ERC-8004) + Proof of visit (photo + EXIF GPS) + Quality scoring (Venice AI)
- **V2+:** Stake & challenge, soulbound reputation, quadratic decay
- Goal: reward genuine reviews while making fake reviews economically/technically infeasible

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
- **No custom backend for map tiles** — Overture PMTiles served directly to MapLibre
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

### 6. EAS Schema Design — PARTIALLY RESOLVED
- Fields: rating, text, photo hash, GPS coords, Overture POI ID, quality score
- Final schema to be designed on Day 5

### 7. Venice + Overture Search Integration — RESOLVED
- Venice receives natural language query + user lat/lng (zero retention)
- Venice extracts intent → structured query (categories, radius, time)
- Backend queries Overture REST API, enriches with OSM (bridge files) + HERE (fallback)
- Venice receives enriched results, ranks them, recommends top pick with "why not" for alternatives
- Two Venice round trips, second one streamed via SSE
- Smart search bar UX (not chat interface)

### 8. App Name — STILL TBD
- Top candidates: **Roam**, **Carta**, **Locus**
- Roam: "Roam privately. Review honestly. Navigate freely." One syllable, maps + freedom.
- Carta: "map" in Latin/Italian/Spanish. Elegant, global.
- Locus: "place" in Latin. Short, technical edge.

### 9. 10-Day Build Scope — RESOLVED
- See [build-plan.md](build-plan.md) for full day-by-day plan
- Critical path: Map → Venice Search → Enrichment → Reviews → Navigation → Polish
- Cut list prioritized: navigation polish first to cut, core search last

---

## Hackathon Timeline (March 13-22)

See detailed day-by-day build plan. Summary:
- Days 1: Planning (done)
- Day 2: Map + basic search
- Day 3: Venice AI search + streaming
- Day 4: POI enrichment pipeline
- Days 5-6: CDP auth + on-chain reviews (hackathon differentiator)
- Days 7-8: Navigation + privacy page (product differentiator)
- Days 9-10: Documentation + polish + deploy

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
8. **Self-hosted routing (Valhalla)** — eliminate TomTom dependency for full privacy
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
