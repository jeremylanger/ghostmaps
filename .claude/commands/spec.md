---
description: Interactive spec session — flesh out acceptance criteria before implementation
argument-hint: "[feature name or plan section to spec out]"
---

# Spec

You are running an interactive spec session. The goal is to define **what should be true** about a feature before writing any code. The output is acceptance criteria written back into the plan file.

## Context

Feature to spec: `$ARGUMENTS`

If empty, read `plans/build-plan.md` and `plans/master.md` to find the next unimplemented task and spec that.

## Step 1: Understand the Feature

Read the relevant plan file(s) and `plans/master.md` to understand:
- What the feature does
- Where it fits in the system
- What's already been decided
- What external services are involved

Summarize in 2-3 sentences: "Here's what I understand we're building." Ask the user to confirm or correct.

## Step 2: Walk Through the Checklist

Go through each category below **one at a time**. For each category:

1. Propose 2-5 "what should be true" statements based on what you know about the feature, the stack, and common pitfalls
2. Ask the user: "Anything to add, remove, or change?"
3. Move to the next category

**Only include categories relevant to the feature.** Skip categories that don't apply — a pure UI component doesn't need "Integration boundaries." A backend-only change doesn't need "UX states."

### Categories

**Happy path**
What does success look like? Describe the main flow from the user's perspective.
- Focus on observable behavior, not implementation
- Include what the user sees at each step

**Failure states**
What breaks and how should it recover?
- External API failures (Venice, Overture, Google Places, TomTom, EAS)
- Network errors, timeouts, rate limits
- Invalid/malformed data from external services
- Map tile loading failures
- What does the user see when something fails?

**Edge cases**
Boundary conditions and unusual inputs.
- Empty states (no results, no reviews, first-time user)
- Geolocation denied or unavailable
- POI with missing data (no photos, no hours, no phone)
- Concurrent operations (double-clicks, rapid searches)
- DEMO API key restrictions (only NYC/London/Paris/Bondi)
- Offline/slow network behavior

**Security & privacy**
This is a privacy-first app — privacy is the core value proposition.
- Venice AI: zero data retention, no search queries logged
- CDP wallet key management
- No user tracking or data collection beyond what's explicitly disclosed
- Input validation at system boundaries
- Auth/authorization via CDP embedded wallets
- Sensitive data in URLs, logs, or analytics events

**Integration boundaries**
Where our code meets external services.
- Venice API (OpenAI-compatible): rate limits, model availability, streaming errors
- Overture REST API: response format, pagination, coverage gaps
- Google Places enrichment: quota limits, missing fields, stale data
- TomTom Routing: traffic data freshness, route calculation failures, speed limit coverage
- EAS on Base: transaction confirmation times, gas estimation, attestation schema changes
- CDP embedded wallets: wallet creation flow, signing failures, network switching
- MapTiler: tile loading, zoom level limits, style availability

**UX states**
Every screen/component has up to 4 states.
- Loading — what does the user see while waiting? (map loading, search in progress, route calculating, review submitting)
- Success — what does the user see when it works?
- Error — what does the user see when it fails?
- Empty — what does the user see with no data?

**On-chain integrity**
Blockchain and attestation concerns.
- EAS attestation schema correctness
- Transaction confirmation vs optimistic UI
- Gas estimation and failure handling
- Chain ID verification (Base mainnet vs testnet)
- Review authenticity (6-layer defense system)
- Wallet connection state management

## Step 3: Finalize

After all relevant categories are covered, compile the accepted criteria into a clean list. Present it to the user for final review:

```
#### Spec
- Happy: [statement]
- Failure: [statement]
- Edge: [statement]
- Security: [statement]
- Integration: [statement]
- UX: [statement]
- On-chain: [statement]
```

Each line should be a single, testable statement. Not implementation details — observable behavior.

Ask: **"Does this cover it? Anything feel missing?"**

If the user says yes, you're done. If they add more, incorporate and re-present.

## Step 4: Write to Plan

Once confirmed, write the spec section into the relevant plan file (usually `build-plan.md`), directly above the implementation section for that feature. Use this format:

```markdown
### [Feature Name]

#### Spec
- Happy: user searches "coffee" near current location, sees pins on map within 2s
- Failure: Overture API timeout shows "Search unavailable, try again" with retry button
- Edge: no results in area shows "No places found nearby" with suggestion to zoom out
- ...

#### Implementation
- [ ] ...
```

If there's no implementation section yet, create one with empty checkboxes based on the spec — each spec line likely maps to at least one implementation task.

## Guidelines

- **One category at a time.** Don't dump everything at once. Give the user space to think about each area.
- **Propose, don't interrogate.** The user shouldn't feel like they're being quizzed. You propose, they react. "Here's what I think should be true about failure states" is better than "What should happen when the API fails?"
- **Flag non-obvious risks.** This is your main value-add. The user knows their happy path. You know about gas estimation edge cases, API rate limits, tile caching, attestation schema versioning, and SSE reconnection. Surface those.
- **Keep it short.** Each "what should be true" statement is one line. No paragraphs. If it takes a paragraph to explain, it's too complex — break it into multiple statements.
- **Know when to stop.** Once all relevant categories are covered and the user confirms, you're done. Don't keep fishing. The checklist is finite — that's the point.
- **Respect the stack.** Reference `plans/master.md` for how things work in this specific project. Don't propose patterns that conflict with the existing architecture.
- **Don't spec implementation.** "User sees error toast" is a spec. "Use sonner with a 5 second timeout" is implementation. Stay at the behavior level.
- **Privacy is non-negotiable.** If the feature could leak location data, search history, or wallet activity, flag it immediately. This is the app's core differentiator.
