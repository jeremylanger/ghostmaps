# Ghost Maps — Hackathon Submission Draft

## Status: DRAFT (not yet submitted)

---

## Submission Fields

### Name
Ghost Maps

### Description
Ghost Maps is a private, AI-powered maps app with on-chain reviews, real navigation, and an autonomous Review Guardian agent. Venice AI handles all search queries with zero data retention — no search history, no location tracking, no profiling. Reviews are EAS attestations on Base that no business can pay to remove and no platform can filter. Navigation uses TomTom for traffic-aware turn-by-turn directions without storing routes.

**The Review Guardian** is an autonomous AI agent that monitors the blockchain for new review attestations, reasons about fraud patterns (sybil clusters, spam, coordinated attacks), and publishes transparent verification verdicts as EAS attestations. It's not a rules engine — the agent IS the LLM, reasoning natively about each unique situation with guidelines, not checklists. Its verdicts are public, immutable, and on-chain. Verified reviews earn GHOST tokens (ERC-20 on Base). The Guardian is registered via ERC-8004 with verifiable on-chain identity.

This solves the fundamental tension in review incentives: every previous token-incentivized review system failed because paying for reviews creates an incentive to fake them. The Guardian agent makes token rewards viable by catching fraud before rewards are distributed — private reasoning, public accountability.

The app has 6 deep Venice AI integration points: (1) natural language search parsing and ranking, (2) place intelligence briefings, (3) review quality scoring, (4) review summarization, (5) photo verification for proof-of-visit, and (6) comparative place recommendations. Users sign up with email via Coinbase CDP embedded wallets — an invisible non-custodial wallet is created on Base with gas sponsored via CDP Paymaster. Users never see crypto.

The full stack: React + MapLibre GL JS frontend with MapTiler tiles, Express backend, Venice API for all AI (including the Guardian agent via MiniMax M2.7), Google Places for POI enrichment (server-side only, no user data sent), TomTom Routing API for navigation, EAS on Base for on-chain reviews, and CDP for auth + wallets.

375+ tests (170 server + 141 client + 64 agent). Live at ghostmaps.app.

**Try it:** The map defaults to Loveland, CO. To see on-chain reviews with AI quality scoring, GPS verification, and community summaries, search for:
- **"Avery's Modern Teahouse Loveland"**
- **"Slice House Loveland"**
- **"Verboten Brewing Loveland"**


### Problem Statement
Google Maps tracks your location constantly, saves every search query, logs every business interaction, and has paid $7.1B+ in privacy fines. Private alternatives exist (Organic Maps, OsmAnd) but have terrible search quality (~70% accuracy via Nominatim) and no reviews. Yelp faces 2,000+ FTC complaints alleging extortion-style review manipulation. Amazon estimates 16-20% of its 250M+ reviews are fake. Google removed 240M fake reviews in 2024 alone. There is no maps app that combines private AI-powered search, trustworthy on-chain reviews, and real navigation.

### Repo URL
https://github.com/jeremylanger/ghostmaps

### Deployed URL
https://ghostmaps.app

### Tracks (4)
1. **Synthesis Open Track** ($28,300) — `fdb76d08812b43f6a5f454744b66f590`
2. **Venice — Private Agents, Trusted Actions** (3,000 VVV) — `ea3b366947c54689bd82ae80bf9f3310`
3. **Base — Agent Services on Base** ($10,000) — `6f0e3d7dcadf4ef080d3f424963caff5`
4. **Protocol Labs — Trust Layer** ($8,004) — TBD

### Conversation Log
Contents of `CONVERSATION_LOG.md` (submitted in full)

### Submission Metadata
| Field | Value |
|---|---|
| Agent Framework | other: "Claude Code CLI (direct tool use — Read, Write, Edit, Bash, Glob, Grep, Agent, WebSearch, WebFetch)" |
| Agent Harness | claude-code |
| Model | claude-opus-4-6 |
| Skills | frontend-design, simplify, spec, eth-standards, eth-security |
| Tools | Venice AI API (search + Guardian agent), Google Places API, TomTom Routing API, EAS SDK (ethers.js), Coinbase CDP SDK, ERC-8004 Identity Registry, GHOST ERC-20, MapLibre GL JS, MapTiler, Vitest, Playwright, Railway, Vite, Zustand, TanStack Query |
| Intention | continuing |

### Helpful Resources
- https://docs.venice.ai/
- https://docs.attest.org/
- https://developer.tomtom.com/routing-api/documentation/routing/calculate-route
- https://developers.google.com/maps/documentation/places/web-service
- https://portal.cdp.coinbase.com/products/embedded-wallets
- https://maplibre.org/maplibre-gl-js/docs/
- https://docs.maptiler.com/cloud/api/maps/
- https://www.8004.org
- https://docs.anthropic.com/en/docs/build-with-claude/tool-use

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
Ghost Maps is a real product we intend to ship. Post-hackathon roadmap includes: pluralistic Guardian auditing (multiple independent agents publishing competing verification attestations), GHOST token on Base mainnet with DEX liquidity, transit directions via GTFS feeds, offline map caching, self-hosted OSM data to replace Google Places dependency, Base mainnet migration for reviews, and React Native mobile app.

---

## Pre-Submit Checklist
- [x] Fill in Helpful Skills (reasons for each)
- [ ] Record and upload demo video → fill in Video URL
- [ ] Take app screenshot(s), host publicly → fill in Pictures
- [ ] Create cover image, host publicly → fill in Cover Image URL
- [ ] Create Moltbook post → fill in Moltbook Post URL
- [ ] Self-custody NFT transfer (required before publishing)
- [ ] Create draft project (POST /projects)
- [ ] Publish project (POST /projects/:uuid/publish)
