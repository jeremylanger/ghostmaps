# Ghost Maps — Human-Agent Collaboration Log

This document records the collaboration between Jeremy Langer (human) and Claude (AI agent, via Claude Code CLI) throughout the 10-day Synthesis hackathon build of Ghost Maps.

**Agent harness:** Claude Code (CLI)
**Model:** Claude Opus 4.6 (1M context)
**Duration:** March 13–22, 2026 (10 days)
**Sessions:** 17 total (8 synthesis planning + 9 ghostmaps implementation)
**Commits:** 43

---

## Day 1 — March 13: Idea Discovery & Architecture

### How the idea emerged

Jeremy entered the hackathon with no preconceived project. The first session was pure exploration — brainstorming across all four hackathon tracks. Several ideas were proposed and rejected:

- Private agent memory vault — "too infrastructure-y to score well on problem legitimacy"
- Agent credential broker — same concern
- Private financial agent — crowded space
- Private Otter.ai clone — narrow audience

The breakthrough came when Jeremy said: **"Maps suck. They're all tracking your data, and the private ones have a shitty UI."** Claude researched the competitive landscape and confirmed the gap was real — private maps apps (Organic Maps, OsmAnd, CoMaps) all had poor search quality and no AI integration. Nobody was combining Venice AI's zero-retention search with on-chain reviews.

### Key architecture decisions

- **Venice AI as the core**, not a utility — 6 integration points (search, briefings, review scoring, summarization, photo verification, comparative recommendations)
- **EAS on Base** for immutable, composable reviews — no custom token needed
- **6-layer review authenticity system** designed (identity, proof of visit, quality scoring, stake & challenge, reputation, quadratic decay) — scoped to 3 layers for hackathon
- **Overture Maps Foundation** chosen for POI data (64M+ POIs, open data)

### Collaboration highlights

- Claude pushed back honestly on entering Jeremy's existing health app: "agent advised against it due to git history detection risk and reputation concerns." Jeremy accepted and moved on.
- Jeremy drove the review authenticity discussion, catching that on-chain reviews without sybil resistance would be worse than Google's current system. This led to the multi-layer defense design.
- Jeremy's instinct to focus on the Venice bounty track ("Private Agents, Trusted Actions") proved correct — the project's privacy-first architecture aligned perfectly.

---

## Day 2 — March 14: Map Foundation + Basic Search

### What was built

- React + Vite + Express scaffold
- MapLibre GL JS rendering with MapTiler Streets v2 tiles
- Overture REST API integration for category search
- User GPS location on map
- Search bar with results as cards
- Place detail panel (name, category, address)

### Collaboration highlights

- White screen debugging: React StrictMode was double-mounting and destroying the MapLibre container. Took multiple rounds between human and agent to diagnose.
- Named the app "Ghost Maps" during a collaborative brainstorming session. Jeremy rejected several options with sharp instincts: "cipher maps is really cool but people are going to misspell it." Bought `ghostmaps.app` immediately.
- Map pin performance: Jeremy reported pins lagging behind map tiles during pan. Claude initially tried CSS fixes, then realized the fundamental issue was DOM markers vs WebGL rendering — switched to GeoJSON source + circle layer.

---

## Day 3 — March 15: Venice AI Search + Streaming

### What was built

- Venice API integration (query parsing, result ranking)
- SSE streaming pipeline (status → results → ranking)
- "Top Pick" with recommendation reason + alternatives with "why not" labels
- Zustand for client state, TanStack Query for server state
- TypeScript migration (entire codebase converted at ~6 source files)
- Test infrastructure: Vitest (unit + integration) + Playwright (E2E)

### Key decisions

- Venice receives user location for search context (zero data retention makes this acceptable)
- Two Venice API calls per search accepted (~3-4s total) — quality over speed
- Jeremy's "why not" pattern for alternatives became a core UX feature ("too casual for the occasion", "nothing to rave about")

### Collaboration highlights

- Jeremy pushed: "Nope, no map. Please test yourself and send yourself screenshots. I want to know when it's working." This pushed Claude to use automated screenshots for self-verification.
- Jeremy asked "could we use Venice anywhere else impactful?" which elevated Venice from backend utility to primary UX surface — conversational search, place intelligence, comparative recommendations.

---

## Day 4 — March 15: POI Enrichment Pipeline

### What was built

- Google Places integration for hours, ratings, photos, price level, services
- Venice place intelligence briefings (2-3 sentence AI summary per place)
- Place detail panel with photo, rating, open/closed badge, service chips

### Key pivot: HERE → Google Places

Originally planned HERE API for enrichment, but HERE signup was broken. Pivoted to Google Places, which turned out to be far superior — ~95% coverage for hours/ratings vs ~39% for OSM.

### Privacy narrative developed

Jeremy and Claude worked through the privacy implications: Google Places sees place name + coordinates, but never who searched, what they searched for, or user location. All requests are server-side. This became the honest narrative: "Business data is public commercial information. We query it server-side — Google learns nothing about our users."

---

## Day 5 — March 16: Auth + Wallets + On-Chain Reviews (Write)

### What was built

- Coinbase CDP embedded wallets (email OTP signup, invisible wallet on Base)
- EAS schema deployed on Base Sepolia
- Review form with star ratings, structured prompts, photo upload with EXIF GPS
- Venice AI quality scoring
- On-chain attestation submission via CDP smart wallet with gas sponsorship

### Hardest debugging session

The EAS attestation encoding was wrong — manual ABI encoding vs `Interface.encodeFunctionData`. Jeremy rightly called out: **"I thought you built unit, integration, and e2e tests for all of this?? Why are we running into bugs?"** Claude admitted the tests were superficial and committed to writing thorough on-chain integration tests. This led to a permanent CLAUDE.md rule: "Mocked unit tests alone are not sufficient."

### Collaboration highlights

- CDP Paymaster required billing for Base mainnet — forced a pivot to Base Sepolia testnet
- `sendUserOperation` returns a user operation hash, not a transaction hash — another bug caught during live testing
- Jeremy's feedback on test quality became a foundational project rule that improved all subsequent sessions

---

## Day 6 — March 16: On-Chain Reviews (Read + Display)

### What was built

- EAS GraphQL reader for fetching reviews by placeId
- Venice AI review summarization (aggregate all reviews into community briefing)
- Photo upload/serve endpoints (SHA-256 keyed)
- ReviewList component with identity display (account age, review count)
- Comparative recommendations endpoint
- 104 tests passing across 14 files

### Collaboration highlights

- Jeremy pushed on test coverage: "ok all unit, integration, and e2e tests capturing all edge cases and implemented?" — Claude found significant gaps (photos module untested, Venice summarize/compare untested, no E2E for days 5-6). The testing discipline was now firmly human-driven.

---

## Day 7 — March 16: Navigation Core

### What was built

- TomTom Routing API integration
- Route display on MapLibre (GeoJSON line with casing)
- Turn-by-turn instruction panel
- Traffic-aware ETA display
- GPS tracking during navigation

### Collaboration highlights

- Clean build session — Claude scaffolded methodically through backend, store, types, map layer, navigation panel
- Jeremy caught missing E2E tests again: "did you add unit, integration, and e2e tests?" — Claude admitted E2E was missing and wrote 8 tests immediately

---

## Day 8 — March 17: Navigation Polish + Privacy Page

### What was built

- Navigation UX overhaul: big next-turn card, ETA summary, collapsible steps list
- Speed limit display (TomTom sectionType=speedLimit)
- Lane guidance (TomTom sectionType=lanes)
- Auto-rerouting at 50m off-route
- Privacy Comparison page (8-category side-by-side: Google Maps vs Ghost Maps)
- Server-side review cache (2-min TTL) + parallelized identity/summary fetches
- Railway deployment setup + custom domain ghostmaps.app

### Key debate: Auto-reroute vs. prompt

Jeremy flip-flopped on whether rerouting should be automatic or require user confirmation. First wanted a prompt, then said "no go back to what you had where it auto reroutes." The final answer: auto-reroute with a brief "Rerouting..." flash indicator.

### Collaboration highlights

- Jeremy challenged: "are you sure the TomTom REST API doesn't provide lane guidance?" Claude checked again and found it does via `sectionType=lanes`. Good outcome from human pushback overriding agent confidence.
- iOS Safari debugging was painful — multiple approaches before realizing self-signed HTTPS cert + iOS location settings were both needed
- `/simplify` code review caught: unbatched state updates, missing AbortController on reroute fetch, no cache eviction bounds

---

## Day 9 — March 19: Drive Test Feedback (3 Rounds)

### The most productive day

Jeremy did three real-world drive tests, each generating detailed bug reports that were spec'd and implemented:

**Round 1 — Navigation & Search Overhaul**
- Navigation UI redesigned: next-turn card, bottom bar with ETA/duration/distance, expandable step list
- Directional arrow for user position, destination pin with name label
- Map rotation during active navigation
- Route line trimmed behind user position
- Venice AI query classification: category vs name vs address
- Google Places Text Search for name queries (global, no radius cap)
- 105 tests passing

**Round 2 — Instruction Consolidation + Step Advancement**
- Highway instructions consolidated: "In 5 mi, take exit 250" instead of individual keep-left/keep-right
- Step advancement rewritten with dot-product directional check
- Live ETA recalculation from current position
- Camera offset: user in lower third for forward visibility
- Position smoothing via requestAnimationFrame interpolation
- Rerouting tightened: 30m threshold + direction-of-travel check
- `/simplify` found critical bug: `prevPosRef` was set before `isMovingAwayFromRoute` read it

**Round 3 — Step Progression + Trailing Path + Address Search**
- Step progression rewritten with proximity + dot product scan
- Trailing path trimmed via projection onto closest segment
- Address search location bias (50km) for partial addresses

### Collaboration highlights

- Jeremy pushed back on ever-expanding search radius: "LA to NY searching 'empire state building' would take 300 searches." Claude pivoted to a two-pronged approach.
- Jeremy corrected rerouting logic: "It's not about cooldown, it's about recognizing we're already ON the route."
- The drive test → spec → implement → drive test cycle was the most effective collaboration pattern in the entire project.

---

## Day 10 — March 20: Architecture Simplification + Polish

### Major architectural decision: Remove Overture Maps

Jeremy questioned why Overture Maps was needed when Google Places was already handling name searches and enrichment. After deep research into alternatives (TomTom POI Details, Foursquare, HERE, Apple Business Connect — all insufficient), the decision was made to route all search through Google Places:

- **Category queries** → Google Nearby Search with `includedTypes` (e.g., `coffee_shop`)
- **Name queries** → Google Places Text Search
- **Address queries** → Google Places geocoding

This simplified the architecture from two search providers to one, removing ~200 lines of Overture-specific code.

### Key debugging: "Where is Starbucks??"

After the switch, searching "coffee" returned no Starbucks. Claude initially blamed Google's ranking algorithm — **Jeremy called this out as hallucination.** The real issue: Google Text Search is optimized for name lookups, not category discovery. The fix was switching to Google's **Nearby Search** API for category queries, which returned proper results (Starbucks + local variety, sorted by rating).

### UI polish

- Place panel action buttons redesigned (Apple Maps style: 4-column grid, icon on top, label below)
- Navigation bottom bar: uniform font sizes with smaller unit labels
- Map controls repositioned to bottom-right stack above locate button
- Z-index fixes: panels render above map controls
- Removed redundant AI summary from search results

### Documentation

- Comprehensive README (architecture, privacy model, tech stack, setup, deployment)
- Full API reference (API.md) with all 12 endpoints, request/response schemas
- All plan docs updated to reflect architecture changes

---

## Development Patterns

### What worked

1. **Drive test → spec → implement → drive test** was the highest-signal feedback loop. Real-world usage revealed issues no amount of desk testing would catch.
2. **Spec sessions before code** (/spec command) — explicitly defining happy paths, edge cases, and failure modes before implementation prevented scope creep and caught design issues early.
3. **Code review after every major change** (/simplify command) — caught real bugs in every session (stale refs, silent catches, computation-per-call, encoding errors).
4. **Living plan documents** — `master.md` and `build-plan.md` updated in real-time kept both human and agent aligned across 17 sessions.
5. **Human pushback on agent confidence** — Jeremy correcting Claude on TomTom lane guidance, rerouting logic, Starbucks search results, and test quality led to better outcomes every time.

### What didn't work

1. **Agent overconfidence on API capabilities** — Claude twice stated APIs didn't support features they actually did (TomTom lanes, Google Nearby Search for categories). Human skepticism was essential.
2. **Superficial test coverage early on** — Days 2-4 had tests that passed but didn't catch real integration issues. Jeremy's demand for thoroughness on Day 5 fixed this permanently.
3. **CSS specificity battles** — Fighting MapLibre's inline styles required `!important` overrides and trial-and-error. Multiple rounds of "nope, still overlapping."

---

## Technical Stats

| Metric | Value |
|---|---|
| Total commits | 43 |
| Lines of code (approx.) | ~5,000 (client) + ~2,500 (server) |
| Tests passing | 70 server unit + integration tests |
| API endpoints | 12 |
| Venice AI integration points | 6 |
| External APIs | 4 (Venice, Google Places, TomTom, EAS/Base) |
| On-chain schema | EAS on Base Sepolia |
| Deployment | Railway (ghostmaps.app) |

---

## Agent Metadata

```json
{
  "agentHarness": "claude-code",
  "model": "claude-opus-4-6",
  "agentFramework": "claude-code-cli",
  "tools": ["Read", "Write", "Edit", "Bash", "Glob", "Grep", "Agent", "WebSearch", "WebFetch"],
  "skills": ["frontend-design", "simplify", "spec", "eth-standards", "eth-security"],
  "humanInLoop": true,
  "collaborationStyle": "human-directed with agent autonomy on implementation"
}
```
