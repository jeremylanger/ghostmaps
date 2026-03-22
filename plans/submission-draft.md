# Ghost Maps — Hackathon Submission Draft

## Status: DRAFT (not yet submitted)

---

## Submission Fields

### Name
Ghost Maps

### Description
Ghost Maps is a private, AI-powered maps app with on-chain reviews and real navigation. Venice AI handles all search queries with zero data retention — no search history, no location tracking, no profiling. Reviews are EAS attestations on Base that no business can pay to remove and no platform can filter. Navigation uses TomTom for traffic-aware turn-by-turn directions without storing routes.

The app has 6 deep Venice AI integration points: (1) natural language search parsing and ranking, (2) place intelligence briefings, (3) review quality scoring, (4) review summarization, (5) photo verification for proof-of-visit, and (6) comparative place recommendations. Users sign up with email via Coinbase CDP embedded wallets — an invisible non-custodial wallet is created on Base with gas sponsored via CDP Paymaster. Users never see crypto.

The full stack: React + MapLibre GL JS frontend with MapTiler tiles, Express backend, Venice API for all AI, Google Places for POI enrichment (server-side only, no user data sent), TomTom Routing API for navigation, EAS on Base for on-chain reviews, and CDP for auth + wallets.

Built from scratch in 10 days across 17 human-agent collaboration sessions. 43 commits. 12 API endpoints. Live at ghostmaps.app.

### Problem Statement
Google Maps tracks your location every 2 minutes, saves every search query, logs every business interaction, and has paid $7.3B+ in privacy fines. Private alternatives exist (Organic Maps, OsmAnd) but have terrible search quality (~70% accuracy via Nominatim) and no reviews. Yelp faces 700+ lawsuits alleging pay-to-play review manipulation. Amazon estimates 16-20% of its 250M+ reviews are fake. Google removed 240M fake reviews in 2024 alone. There is no maps app that combines private AI-powered search, trustworthy on-chain reviews, and real navigation.

### Repo URL
https://github.com/jeremylanger/ghostmaps

### Deployed URL
https://ghostmaps.app

### Tracks (3)
1. **Venice — Private Agents, Trusted Actions** ($11,500) — `ea3b366947c54689bd82ae80bf9f3310`
2. **Synthesis Open Track** ($28,134) — `fdb76d08812b43f6a5f454744b66f590`
3. **Agent Services on Base** ($5,000) — `6f0e3d7dcadf4ef080d3f424963caff5`

### Conversation Log
Contents of `CONVERSATION_LOG.md` (submitted in full)

### Submission Metadata
| Field | Value |
|---|---|
| Agent Framework | other: "Claude Code CLI (direct tool use — Read, Write, Edit, Bash, Glob, Grep, Agent, WebSearch, WebFetch)" |
| Agent Harness | claude-code |
| Model | claude-opus-4-6 |
| Skills | frontend-design, simplify, spec, eth-standards, eth-security |
| Tools | Venice AI API, Google Places API, TomTom Routing API, EAS SDK (ethers.js), Coinbase CDP SDK, MapLibre GL JS, MapTiler, Vitest, Playwright, Railway, Vite, Zustand, TanStack Query |
| Intention | continuing |

### Helpful Resources
- https://docs.venice.ai/
- https://docs.attest.org/
- https://developer.tomtom.com/routing-api/documentation/routing/calculate-route
- https://developers.google.com/maps/documentation/places/web-service
- https://portal.cdp.coinbase.com/products/embedded-wallets
- https://maplibre.org/maplibre-gl-js/docs/
- https://docs.maptiler.com/cloud/api/maps/

### Helpful Skills
<!-- skill name + reason why it was impactful -->
- **frontend-design** — Shaped the entire "Phantom Protocol" brand system (Tron Legacy-inspired dark UI with cyan/phosphor accents). Guided component design for the place panel, navigation HUD, search bar, and privacy comparison page. Without it, the app would look like a generic Material UI dashboard.
- **simplify** — Ran after every major build day. Caught real bugs in every session: stale refs in navigation tracking, silent catch blocks swallowing errors, unbounded server-side caches, computation-per-render in route display, and an EAS encoding error that would have failed on-chain. Prevented at least 3 production bugs from shipping.
- **spec** — Used before every feature implementation to define happy paths, edge cases, and failure modes upfront. The navigation spec sessions (4 rounds of drive test feedback) were the most productive collaboration pattern in the project — each spec explicitly defined what "done" looked like before a line of code was written.
- **eth-standards** — Guided the EAS schema design (field types, encoding strategy for lat/lng as int256 * 1e6). Ensured the on-chain review attestations were properly structured for composability — any app can read and build on them.
- **eth-security** — Informed the review submission flow: validating attestation encoding, ensuring CDP Paymaster gas sponsorship couldn't be abused, and keeping private keys out of client code. Caught that `sendUserOperation` returns a user operation hash (not a tx hash) which would have broken the confirmation UI.

### Video URL
<!-- Demo walkthrough video — helps judges understand the full flow -->
TODO

### Pictures
<!-- Screenshot URL(s) of the app — must be publicly accessible -->
TODO

### Cover Image URL
<!-- Hero image for the project listing — must be publicly accessible -->
TODO

### Moltbook Post URL
<!-- Post announcing Ghost Maps on moltbook.com -->
TODO

### Intention Notes
Ghost Maps is a real product we intend to ship. Post-hackathon roadmap includes: transit directions via GTFS feeds, offline map caching, self-hosted OSM data to replace Google Places dependency, Base mainnet migration for reviews, and React Native mobile app.

---

## Pre-Submit Checklist
- [ ] Fill in Helpful Skills (reasons for each)
- [ ] Record and upload demo video → fill in Video URL
- [ ] Take app screenshot(s), host publicly → fill in Pictures
- [ ] Create cover image, host publicly → fill in Cover Image URL
- [ ] Create Moltbook post → fill in Moltbook Post URL
- [ ] Self-custody NFT transfer (required before publishing)
- [ ] Create draft project (POST /projects)
- [ ] Publish project (POST /projects/:uuid/publish)
