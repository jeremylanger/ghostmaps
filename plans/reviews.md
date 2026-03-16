# On-Chain Attestation System

## Overview

On-chain attestations — reviews, business data, photos — that can't be deleted, manipulated, or extorted. Defense-in-depth approach: multiple layers so the aggregate cost of gaming exceeds any reward.

## Beyond Reviews: Decentralized Business Data

Reviews are just one type of attestation. The same EAS infrastructure supports community-contributed business data that reduces our dependence on Google Places over time.

### Attestation Types

| Type | Example | Schema Fields |
|------|---------|---------------|
| **Review** | "Amazing tacos, great outdoor seating" | rating, text, photo, quality_score |
| **Hours** | "Open Mon-Fri 8am-6pm" | hours_text, observed_date |
| **Status** | "I'm here right now, they're open" | is_open, timestamp |
| **Menu/Prices** | "Latte $5.50, cold brew $6" | items (JSON), observed_date |
| **Attributes** | "Has wifi, outdoor seating, pet friendly" | attributes (array) |
| **Photo** | Interior/exterior/food photo | photo_hash, photo_type, exif_gps |
| **Correction** | "Name is actually spelled..." | field, old_value, new_value |

### How Conflicts Resolve
- **Latest attestation wins** for factual data (hours, status)
- **Venice AI arbitrates** when attestations conflict ("3 say closes at 9, 1 says 10 → probably 9")
- **Attestor reputation** (ERC-8004) weights trustworthiness
- **Multiple confirmations** increase confidence

### How This Replaces Google Places Over Time
1. **Cold start:** Google Places provides baseline data for every place
2. **Early users:** Attestations supplement Google data (user-contributed photos, real-time "open now" status)
3. **Growth:** Popular places have enough attestations to skip Google entirely
4. **Maturity:** Community data is richer than Google for covered areas (menus, accessibility, wifi speed, pet policy — things Google doesn't have)

Google Places calls decrease as attestation coverage increases. We can track coverage per place and only call Google when community data is insufficient.

### V2: Token Incentives for Business Data
Token incentives are deferred to V2 (see [token-incentivized-reviews-research.md](token-incentivized-reviews-research.md)) but the attestation types above are designed to be compatible with future token rewards. Key design constraints:
- Must avoid failure modes of Revain, Dentacoin, etc. (see "Why Previous Projects Failed" below)
- Proof-of-visit required for reviews, NOT for business data attestations (you can read hours off a website)
- Quality scoring applies to reviews, factual verification applies to business data
- First attestation for an under-covered place is worth more than the 100th confirmation of Starbucks hours

### V2+: Web Scraping as Attestation Source
Venice AI could scrape business websites, social media, and public listings, then submit the extracted data as attestations with source attribution. This is legal (publicly available data) and doesn't violate any API ToS since we're reading public web pages, not API data. Combined with community contributions, this could achieve near-Google coverage independently.

---

---

## Layer 1: Proof of Personhood

*One human, one identity. Prevents multi-wallet farming.*

### Hackathon MVP
- ERC-8004 identity (already registered for Synthesis — need to explore how easy it is to spin up new ones for users)
- Account age + activity displayed on reviews as trust signal
- Basic wallet-level rate limiting (max N reviews per day)
- **Open question:** Is ERC-8004 the right choice or are there simpler/better identity options? Need to research tradeoffs.

### V2
- Gitcoin Passport-style humanity scoring (collect stamps from social accounts, biometric, on-chain history)
- Cross-platform attestations via EAS (link ENS, GitHub, Twitter)
- More linked identities = higher credibility badge

### V3
- World ID or similar proof-of-personhood integration
- Sybil detection via social graph analysis (MeritRank-style)

---

## Layer 2: Proof of Visit

*Raise the cost of faking from $0 to "physically go there." The killer layer.*

### Hackathon MVP
- **Required to post:** Photo with EXIF GPS data matching business location
- Venice AI verifies photo isn't stock/AI-generated

### Nice-to-have for demo
- Venice AI visual verification (does this photo match a restaurant/cafe/etc?)
- Background GPS confirmation adds a "verified location" badge (not required to post, boosts authenticity)

### V2
- NFC tap at participating businesses
- On-chain payment proof (for businesses accepting crypto)
- Peer attestation (other verified users at same location co-sign)

### V3
- POS integration (business point-of-sale issues signed attestation)
- Zero-knowledge proof of location (prove you were in a zone without revealing exact coordinates or full location history)

---

## Layer 3: Quality-Weighted Rewards

*Incentivize useful reviews, not "5 stars great food" spam.*

### Hackathon MVP
- Venice AI specificity scoring — visible to readers as a quality badge
  - Does the review mention specific items, prices, experiences?
  - Score: generic (1x) → specific (3x) → detailed with photos (5x)
- Venice AI sentiment-rating consistency check (text says "terrible" but 5 stars = flagged)
- Structured review prompts:
  - "What did you order?"
  - "Rate: food / service / ambiance / value"
  - "One thing future visitors should know?"

### V2
- Quality score directly tied to token reward multiplier
- Photo/video bonuses
- Novelty scoring (does this review add info not already covered?)
- Recency bonus (review within 7 days of visit)

### V3
- AI-generated content detection
- Cross-wallet template/duplicate detection (farm detection)
- Reviewer expertise scoring based on history in specific categories

---

## Layer 4: Stake and Challenge

*Both sides have skin in the game. The Graph's dispute model applied to reviews.*

### Hackathon MVP
- **Skip.** Too complex for 10-day build.

### V2
- Reviewers optionally stake small amount ($1-5 in tokens) per review
- Challenge period: 14 days, challenger also stakes
- Adjudication: Venice AI pre-screen + Schelling-point jury of random staked reviewers
- Winner keeps portion of loser's stake
- Graduated slashing: warning → small slash → large slash → ban

### V3
- Appeal mechanism to higher-level jury
- Stake lockup periods
- Regional stake calibration

---

## Layer 5: Soulbound Reputation

*Non-transferable, decays over time, can't buy aged accounts.*

### Hackathon MVP
- **Skip.** Not enough value for demo scope.

### V2
- Soulbound reputation tokens (ERC-5484/5192) — non-transferable, bound to wallet
- Reputation decay if inactive
- Helpfulness votes from other users feed into reputation score
- Behavioral fingerprinting to detect account ownership changes

### V3
- Business feedback loop (businesses verify review accuracy)
- Cross-platform reputation portability
- MeritRank transitivity decay

---

## Layer 6: Quadratic Decay

*Diminishing returns prevent farming at scale.*

### Hackathon MVP
- **Skip.** Design for it but don't implement.

### V2
- Display weighting: Nth review from same wallet = 1/sqrt(N) weight
- Quadratic decay tied to token reward formula
- Per-business caps (1 review per business per wallet per 90 days)

### V3
- Quadratic funding for review quality (many small tips > one whale boost)
- Geographic weighting (first review of under-reviewed business worth more)

---

## Hackathon MVP Summary

What we build:
1. **Identity:** ERC-8004 (or better alternative TBD) + account age display
2. **Proof of visit:** Photo with EXIF GPS required + Venice AI verification
3. **Quality scoring:** Venice AI specificity/consistency scoring + structured prompts

What we skip:
4. Stake and challenge
5. Soulbound reputation
6. Quadratic decay

What we design the architecture to support later:
- Token economics and reward distribution
- All V2/V3 items above

---

## Why Previous On-Chain Review Projects Failed

### The Dead Projects
- **Revain (REV):** 85B token supply, effectively dead. Wrong domain (crypto reviews), trivially gameable, circular tokenomics.
- **Dentacoin (DCN):** 7.89T max supply, ~$0.000001/token. Solution looking for a problem, no visit verification.
- **Lina Review:** Pay-per-review attracted farm accounts.
- **Review.Network:** Raised $1.4M, disappeared.

### Common Failure Patterns
| Failure Mode | Description |
|---|---|
| Low-effort farming | Reward > effort of writing generic text = spam |
| No verification | No proof reviewer actually visited the place |
| Circular tokenomics | Token value depends on usage which depends on token value |
| Sybil vulnerability | One person, many wallets, farm rewards |
| No consequences | Nothing at risk for bad reviews |
| Quality indifference | Rewarded existence of review, not quality |

### What's Different Now (2026)
- Base L2: sub-cent transactions (vs $5-50 on mainnet in 2018)
- EAS: flexible attestation infrastructure, no custom token needed
- Proof-of-personhood: World ID has 17M+ users
- Venice AI: can score quality and detect fakes privately
- Overture Maps: 64M+ POIs with permissive license
- FTC actively penalizing fake reviews ($53k/violation)

### What Successful Crypto Projects Do Differently
| Project | Why It Works |
|---|---|
| Filecoin | Cryptographically verifiable work + collateral at risk |
| The Graph | 100K GRT minimum stake + bilateral dispute staking |
| Goldfinch | Your assessment requires first-loss capital behind it |
| Helium | Physical hardware ($500+) raises gaming cost |
| Braintrust | Rewards tied to verified outcomes, not inputs |

**Key insight:** Every system that works makes gaming *expensive*. Reviews failed because gaming was free. Our proof-of-visit layer (photo + EXIF GPS) raises the cost from $0 to "physically go to the restaurant."

---

## The Fake Review Problem (Scale)

- Amazon: 16-20% of 250M+ reviews may be fake
- Google: removed 240M fake reviews + 12M fake listings in 2024
- Google Maps extortion: criminals flood businesses with fake 1-stars, demand payment
- Yelp: ~700 lawsuits alleging pay-to-play filtering
- Consumer cost: $788B in unwanted purchases annually
- Amazon product swapping: sellers swap products but keep old high-quality reviews

---

## Key References

### Academic Papers
- MeritRank: Sybil-tolerant reputation (arXiv:2207.09950)
- Web3Recommend: Sybil-resistant recommendations (arXiv:2307.01411)
- Fake review detection via NLP (arXiv:2112.14343, 2504.06917)
- Review helpfulness prediction (arXiv:2303.00923)
- Proof of Personhood review (arXiv:2008.05300)

### Frameworks
- Vitalik: Quadratic Payments, Proof of Personhood
- a16z: Reputation-Based Systems (two-token design)
- The Graph: Dispute resolution with bilateral staking
