# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Living Plans Directory

The `plans/` directory is the source of truth for what we're building, how, and why. **It must always be kept up to date.**

### Rules
- When research produces new findings, update the relevant plan file immediately — don't wait until end of session.
- When a decision is made, update both the relevant research file AND `master.md` (resolved questions section).
- When the build plan changes (scope cut, reordering, new feature), update `build-plan.md` immediately.
- If a new topic is researched that doesn't fit an existing file, create a new `.md` file and add a reference in `master.md`.
- Never let plan files become stale — if you discover something in a plan file is wrong or outdated, fix it on the spot.
- At the start of a new session, read `master.md` and `build-plan.md` to understand current state before doing anything.

### File Index
- `master.md` — Central plan: vision, architecture, resolved questions, all file references
- `build-plan.md` — Day-by-day hackathon schedule, tech stack, critical path, cut list
- `poi-data-research.md` — POI data sources, enrichment pipeline, competitive landscape
- `navigation-research.md` — Routing/navigation API comparison and details
- `photos-research.md` — Place photo sources and strategy
- `google-surveillance-research.md` — Google Maps data collection (for privacy comparison page)
- `auth-wallets-research.md` — CDP embedded wallets, auth approach
- `hackathon-strategy.md` — Judging criteria, Venice bounty, winning strategy
- `reviews.md` — Review authenticity system (6-layer defense)
- `token-incentivized-reviews-research.md` — Token incentive research (deferred)

## Project Overview

Private AI-powered maps app with on-chain reviews and navigation. Privacy-first alternative to Google Maps — search via Venice AI (zero data retention), trustworthy reviews via EAS on Base, navigation via TomTom.

See `plans/master.md` for full architecture, decisions, and research.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + MapLibre GL JS |
| Backend | Node.js + Express |
| AI | Venice API (OpenAI-compatible, zero data retention) |
| POI Search | Overture REST API → OSM enrichment → HERE fallback |
| Navigation | TomTom Routing API |
| On-chain | EAS on Base (ethers.js + EAS SDK) |
| Auth + Wallets | Coinbase CDP Embedded Wallets |
| Identity | ERC-8004 |
| Streaming | SSE (Server-Sent Events) |

## Hackathon

The Synthesis hackathon — March 13-22, 2026. AI agents + humans judge submissions. See `plans/hackathon-strategy.md` and `plans/build-plan.md`.
