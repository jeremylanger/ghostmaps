# Auth & Wallet Research

## Decision: Coinbase CDP Embedded Wallets (email OTP for hackathon, migrate to Supabase+CDP later if needed)

---

## Coinbase CDP Embedded Wallets

### What it is
Creates a non-custodial wallet inside your app in <500ms when a user authenticates. No MetaMask, no seed phrase, no browser extension. User enters email, gets OTP code, wallet exists.

### Key facts
- **Non-custodial:** Device-specific cryptographic keys generated and stored locally. Never exposed to Coinbase. Users can export keys anytime.
- **Base L2 native:** First-class support. Base is Coinbase's chain. EAS is deployed on Base.
- **Gas sponsorship:** CDP Paymaster — users pay $0 for transactions
- **SDKs:** `@coinbase/cdp-react`, `@coinbase/cdp-hooks`, `@coinbase/cdp-core` (frontend), `@coinbase/cdp-sdk` (Node.js backend). Requires Node 22+.

### Pricing
- 5,000 wallet operations/month free
- Then $0.005/operation
- A review submission = ~2-3 operations ($0.01-0.015)
- Far cheaper than Privy's $299/mo at 500+ users

### Auth modes
1. **Built-in auth** (email OTP, Google) — simplest, what we use for hackathon
2. **Custom JWT mode** — pass JWTs from any auth provider (Supabase, Auth0, etc.), CDP validates via JWKS endpoint
- Can't mix both in the same project
- Migration path: start with built-in → add Supabase later → switch to custom JWT mode

### UX Flow
```
User enters email
  → receives OTP code
  → enters code
  → CDP creates invisible wallet on Base (<500ms)
  → user writes review, takes photo
  → app constructs EAS attestation
  → embedded wallet signs (invisible to user)
  → Paymaster sponsors gas ($0 cost)
  → "Review submitted!"
  → user never encountered crypto terminology
```

---

## Alternatives Evaluated

### Privy (runner-up)
- Acquired by Stripe, polished DX
- Email, social login, wallet creation
- $299/mo after 499 users — too expensive for our use case
- Good option if we outgrow CDP's free tier

### Dynamic
- Similar to Privy, multi-chain support
- Good embedded wallet UX
- More expensive than CDP

### Web3Auth
- Open source option
- More complex to set up
- Less polished UX than CDP/Privy

### Alchemy Account Kit
- Smart accounts (ERC-4337)
- Good for account abstraction
- More complexity than we need

### RainbowKit + MetaMask (traditional approach)
- ~1-2 days to code
- **60-80% user drop-off** — users must install extension, manage seed phrase
- Wrong tool for "anyone can use this" UX
- Fine for crypto-native users, terrible for everyone else

---

## Why CDP Over RainbowKit

The hackathon pitch is "private maps for everyone." If users need MetaMask to leave a review, we've already lost the "everyone" part. CDP makes crypto invisible — the user experience is identical to signing up for any web app.

AI judges will likely evaluate whether the app is actually usable by real people, not just crypto enthusiasts. CDP proves we understand real-world UX.
