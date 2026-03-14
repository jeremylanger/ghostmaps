# Place Photos Research

## Decision: User-generated photos from reviews (primary) + potential TripAdvisor (if approved)

---

## Viable Photo Sources

| Source | Cost | Specific business photos? | Catch |
|---|---|---|---|
| **User-generated (our reviews)** | Storage only | Yes, over time | Cold start — zero on day 1 |
| **Mapillary** | Free | Street-level views near location | Not interior/food — more "what does this block look like" |
| **TripAdvisor API** | 5K calls/mo free | Yes, up to 5 per place | Requires approval process, must show attribution |
| **Flickr CC** | Free | Sometimes, geo-searchable | Hit or miss, not reliable for specific restaurants |
| **Wikimedia Commons** | Free | Landmarks only | Won't have small businesses |

## Blocked/Rejected Sources

| Source | Why not |
|---|---|
| **Google Places** | **ToS prohibits display on non-Google maps** — totally blocked |
| **Yelp** | $10/1K calls, no free tier, 24hr cache limit, heavy attribution |
| **Foursquare** | $18.75/1K calls — too expensive |
| **Unsplash** | Generic stock photos only, can't find specific businesses |

## HERE → TripAdvisor Bridge

HERE's `references` field returns TripAdvisor and Yelp IDs for each place. Flow:
```
HERE API → get TripAdvisor ID for this place
         ↓
TripAdvisor API → fetch up to 5 photos (5K free calls/mo)
```
No fuzzy matching needed — HERE gives us the ID directly.

## TripAdvisor Content API Details
- Up to 5 photos per location
- 5,000 API calls/month free
- Requires application/approval before access
- Must display TripAdvisor attribution (logo, bubble ratings)
- Risk: approval process could reject a crypto review platform

## Mapillary Details
- 2.5B+ street-level images, crowdsourced (Meta-owned)
- CC-BY-SA 4.0, completely free for commercial use
- Query by bounding box or coordinates
- Coverage uneven — good in cities, sparse rural
- Not curated business photos, but could show storefronts

## Hackathon Strategy

**Primary:** Every review requires a proof-of-visit photo → review photos become place photos. Solves cold-start organically as reviews accumulate.

**Pitch:** "Every photo here is from a real person who actually went there."

**For demo:** Seed a few real reviews with photos so judges see the full experience.

**Post-hackathon:** Apply for TripAdvisor API access, add Mapillary street-level views.
