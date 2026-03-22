# Google Maps Surveillance Research

## Purpose
Factual ammunition for our privacy comparison page and pitch narrative.

---

## What Google Maps Collects

### Location Data
- GPS coordinates logged **every ~2 minutes** via Location History (Timeline)
- Even with Location History "off", Web & App Activity still saves location with searches
- Location Accuracy service saves precise location **even when Google apps aren't in use**
- Sensorvault database: detailed location records for **hundreds of millions of devices dating back nearly a decade**
- A deputy police chief described Sensorvault data as showing "the whole pattern of life"

### Search History
- Every Maps search query saved to Web & App Activity (ON by default)
- Includes businesses, addresses, categories, landmarks
- Google infers "location interest" from search terms (search for Chicago restaurants → Google knows you're interested in Chicago)

### Navigation Data
- Real-time speed, routes taken, start/end points, waypoints, stops
- Mode of transport, trip duration, voice commands
- **Every Maps user is an unwitting traffic sensor** — speed/movement crowdsourced for traffic maps and "popular times"

### Business Interaction Data
- Every view, website click, phone call tap, direction request, photo view, booking
- This data provided to business owners via Google Business Profile dashboards
- Google retains granular per-user data to generate these aggregates

### Reviews
- Review text, star rating, photos (with EXIF metadata), timestamps — all publicly tied to Google account
- Review history builds a public profile of places visited
- Local Guide program incentivizes contributing more data

### Cross-App Profiling
- Web & App Activity spans: Search, Assistant, Maps, Photos, News, YouTube, Chrome
- Non-listed services "are always linked and able to share data with each other"
- Maps location data feeds ad profiles, search personalization, recommendations across entire Google ecosystem

### Device Data
- Device metadata, unique identifiers, IP address, crash metrics
- All motion sensors (accelerometer, gyroscope, magnetometer, barometer)
- WiFi/Bluetooth scan results, cell tower IDs
- Google tracks Android phones via Bluetooth **even when Bluetooth is turned off** (Quartz, 2018)

### Audio
- Google Assistant integration records voice commands + seconds before wake word
- Audio recordings saved to Google Account

### Law Enforcement
- **11,500+ geofence warrants in 2020** (up to 180/week)
- 3-step process: anonymous device IDs in an area → movement histories → unmask individuals (names, phone numbers)
- Innocent people swept up for being near crime scenes

### Advertising
- Location-based ad targeting via Local Search Ads
- Location-of-interest targeting (where you've been AND searched)
- Radius-based targeting down to specific points
- Maps data is key signal feeding Google's $224.5B annual ad revenue

---

## Legal Penalties (Maps-related and adjacent)

| Case | Amount | What happened |
|---|---|---|
| 40-state AG settlement (2022) | **$392M** | Dark patterns, false claims location tracking was off |
| Texas settlement (2024) | **$1.375B** | Tracked geolocation + biometrics without consent |
| Jury verdict (2025) | **$425.7M** | Tracked 98M users via third-party apps for 8 years after opt-out |
| Incognito mode settlement (2023) | **$5B** | Secretly collected browsing data in Incognito mode |
| Arizona settlement | $85M | Location tracking deceptions |
| Washington settlement | $40M | Location tracking |
| Indiana + DC settlement | $29.5M | Location tracking |
| DC dark patterns | $9.5M | Deceptive location settings |
| **Total** | **$7.1B+** | |

### Key findings from cases:
- Google used **dark patterns**: repeatedly prompting location enable, falsely claiming apps wouldn't work without it, burying real opt-out
- Deceptive practices from **at least 2014 to 2019**
- Collected data from **98 million users and 174 million devices** through third-party apps (Uber, Lyft, Amazon, Venmo, Meta) for **eight years** even when users opted out

---

## Our Privacy Coverage

| Google Maps Collects | Our App |
|---|---|
| Location every ~2 minutes | No location storage. Venice = zero retention |
| Every search query saved | Venice = zero data retention |
| Navigation routes + speed + stops | TomTom calculates route, we don't store it |
| Every business view, click, call | No interaction tracking |
| Reviews tied to real identity | Pseudonymous (wallet address only) |
| Cross-app profiling (YouTube, Search, Ads) | No other services, no ad network |
| 11,500+ geofence warrants/year | Nothing to hand over — data never exists |
| Tracked 98M users who opted out | No opt-out needed — data never collected |
| $224.5B/year ad revenue from your data | No ads, no data monetization |

**Transparency note:** TomTom sees origin + destination for route calculation. Long-term, self-host Valhalla for fully private routing.

---

## Sources

- [NPR: $392M settlement](https://www.npr.org/2022/11/14/1136521305/google-settlement-location-tracking-data-privacy)
- [TechCrunch: AP investigation](https://techcrunch.com/2018/08/13/google-keeps-a-history-of-your-locations-even-when-location-history-is-off/)
- [EFF: Sensorvault](https://www.eff.org/deeplinks/2019/04/googles-sensorvault-can-tell-police-where-youve-been)
- [The Hacker News: $1.375B Texas](https://thehackernews.com/2025/05/google-pays-1375-billion-to-texas-over.html)
- [Fox Business: $425M verdict](https://www.foxbusiness.com/technology/google-pay-425-million-after-years-improper-spying-smartphone-activity)
- [NPR: $5B incognito settlement](https://www.npr.org/2023/12/30/1222268415/google-settles-5-billion-privacy-lawsuit)
- [Harvard Law Review: Geofence warrants](https://harvardlawreview.org/blog/2025/02/much-ado-about-geofence-warrants/)
- [DC AG: Dark patterns](https://oag.dc.gov/release/ag-racine-announces-google-must-pay-95-million)
- [Google Privacy Policy](https://policies.google.com/privacy?hl=en-US)
- [Quartz: Bluetooth tracking when off](https://qz.com/1169760/phone-data)
