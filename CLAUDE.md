# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Components should be a max of 100-120 lines.
Each component should be in its own file.

Avoid `useEffect`.

All components should try to use shadcn/ui first, unless there's a good reason we want to build something custom.

Keep all code minimal and clean, while maintaining readability.

**Never swallow errors silently.** Every `catch` block and error branch must log with `console.error`. No empty catch blocks, no `catch {}`, no `if (!response.ok) return` without logging. It's fine to return a fallback value — just log first.

**All tests must pass before pushing.** Run both `cd server && npm test` and `cd client && npx vitest run` and confirm zero failures before every push. Do not dismiss failures as "flaky," "pre-existing," or "missing env vars" — investigate the actual cause. Every failure we've excused turned out to be a real bug (wrong types, stale fields, tests hitting wrong endpoints). Fix the test or fix the code. No exceptions.

Run `npm run format` after each task.

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

## Build Checklist

The `plans/build-plan.md` contains a day-by-day checklist with `- [ ]` and `- [x]` items. **Keep it up to date as you work:**
- When you complete a task, mark it `[x]` immediately — don't wait until end of session.
- When you start a day's work, mark the day header as `(IN PROGRESS)`.
- When a day is fully done, mark the day header with `✅`.
- If a task is discovered during work that wasn't in the original plan, add it to the appropriate day.
- If a task is cut or deferred, strike it through and note why.

## Development

```bash
# Start backend (from repo root)
cd server && npm run dev       # runs on :3001 (tsx watch)

# Start frontend (from repo root)
cd client && npx vite --port 5174   # runs on :5174, proxies /api to :3001

# Take screenshots for testing (from repo root)
node screenshot.js
```

**MapTiler:** Map tiles via MapTiler Streets v2. Set `VITE_MAPTILER_KEY` in `.env`. Free tier: 100K tiles/month.

## Deployment

Live at **https://ghostmaps.app** via Railway.

```bash
# Deploy (from repo root, must be logged into admin@ghostmaps.app Railway account)
railway up

# Check logs
railway logs --lines 20

# Set env vars
railway vars set KEY=value
```

Railway project: `ghostmaps` (linked via `railway link`). Single service — Express serves API + Vite static build. DNS via Porkbun (ALIAS → Railway edge). **Pushing to `main` auto-triggers a deploy** — no need to run `railway up` manually.

**Server IP endpoint:** `GET /api/server-ip` returns Railway's outbound IP (via ipify). Use this to whitelist the server in API key restrictions (e.g. Google Places).

## Testing Requirements

**Tests are not optional. Write them automatically with every day of work — do not wait to be asked.**

Every feature requires **three layers of tests**:

1. **Unit tests** — Fast, isolated, mocks allowed. Test pure logic, helpers, and edge cases.
2. **Integration tests** — Hit real external services and real DB. No mocks for service boundaries. Test that our code works with the actual APIs, SDKs, and data formats.
3. **E2E tests** — Full browser flow via Playwright. Test the actual user journey.

**Mocked unit tests alone are not sufficient.** They miss: SDK object access patterns, API version changes, import errors, state machine bugs, and frontend rendering issues. Always verify DB state after each flow with real queries. Always test failure paths.

### Running Tests

```bash
# Unit + integration tests (server)
cd server && npm test                    # all
cd server && npm run test:unit           # unit only
cd server && npm run test:integration    # integration only

# E2E tests (requires both servers running on :3001 and :5174)
npx playwright test --config e2e/playwright.config.ts
```

## Project Overview

Private AI-powered maps app with on-chain reviews and navigation. Privacy-first alternative to Google Maps — search via Venice AI (zero data retention), trustworthy reviews via EAS on Base, navigation via TomTom.

See `plans/master.md` for full architecture, decisions, and research.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + MapLibre GL JS (MapTiler Streets v2 tiles) |
| Backend | Node.js + Express |
| AI | Venice API (OpenAI-compatible, zero data retention) |
| POI Data | Google Places API (search + enrichment, server-side) |
| Navigation | TomTom Routing API (traffic ETA, speed limits, lane guidance, rerouting) |
| On-chain | EAS on Base (ethers.js + EAS SDK) |
| Auth + Wallets | Coinbase CDP Embedded Wallets |
| Streaming | SSE (Server-Sent Events) |

## Hackathon

The Synthesis hackathon — March 13-22, 2026. AI agents + humans judge submissions. See `plans/hackathon-strategy.md` and `plans/build-plan.md`.
