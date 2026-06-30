# Campgrounder — Project Instructions

## Correct folder
The live codebase is `/Users/benjaminvanderveen/Documents/GitHub/campgrounder`.
Always read from and write to this folder. Do NOT use `Documents/Claude/Projects/Campgrounder` — that is an older archive copy.

## Main file
The entire app lives in a single file: `index.html` (~10,800+ lines).
There is no build system or package.json. Edit `index.html` directly.

## Deployment
Connected to Vercel via GitHub remote: `https://github.com/mossandfog/campgrounder.git`
Pushing to `main` deploys to campgrounder.io.

## Tech stack
- Leaflet.js for mapping (loaded via CDN)
- Capacitor (`capacitor.config.json`) for native iOS/Android wrapping
- Service worker (`sw.js`) for PWA
- LocalStorage for all user data persistence (no backend)
- Vercel serverless functions in `/api/`

## Design tokens (CSS variables)
- `--g0: #0C1F15` (darkest bg)
- `--g1: #132B1C`
- `--g2: #1E3D2A`
- `--o: #E8481C` (orange accent)
- `--w: #FFFFFF`

## Screen system
Screens use `.screen` / `.screen.active` toggled by `go(toId, fromId)`.
All screens: `#home`, `#results`, `#map-screen`, `#saved`, `#profile`, `#trail`, `#about`, `#partners`, `#privacy`, `#terms`, `#detail`

## LocalStorage keys in use
`cg_saved`, `cg_saved_data`, `cg_profile_name`, `cg_profile_bio`, `cg_profile_vibes`,
`cg_profile_outfit`, `cg_profile_since`, `cg_welcomed`, `cg_app_banner_dismissed`,
`cg_compass_seen`, `cg_trail_discovered`, `cg_trips`, `cg_trips_ids`

## Release notes
At the end of every session where iOS-worthy changes were made, draft pithy App Store release notes and append them to the ## Pending v1.2 release notes section below. Notes should be specific, human, and benefit-led — not technical. When a new iOS version ships, archive the notes and start a fresh section.

## Pending v1.2 release notes
- **Passport** — Mark any camp as visited and collect it as a trip card on your profile. Each card includes a scannable QR code that links straight back to that campground.
- **Sunrise & Sunset** — Every listing now shows a live arc of the sun's path for that location, with exact rise and set times for today.
- **The Torch** — A built-in flashlight, accessible from any screen. Slide to activate your phone's torch without leaving the app.
- **Bug fixes** — Resolved a navigation issue where camp listings were unresponsive in Safari and on some iOS devices.

---

## Business Development & Funding History

### iOS App Launch
- Campgrounder iOS app approved by Apple App Store ("Ready for Distribution") — June 2026
- App went live June 30, 2026

### Michigan Outdoor Innovation Fund (MOIF)
- **Contact:** Jim Baker
- **Fund:** Michigan Outdoor Innovation Fund — revenue-based / SAFE structure. Typical terms: 1.3x return over 2 years or 1.5x over 3 years. Michigan operational presence required for eligibility.
- **Meeting:** Initial pitch meeting held ~June 30, 2026. Ben presented pitch deck. Meeting went well — Jim expressed strong interest and requested a financial projection.
- **Follow-up:** Ben sent a follow-up email after the meeting (drafted with Claude), mentioning iOS app going live same day.
- **Ben's follow-up:** Sent June 30, 2026. Ben has now followed up with Jim again (as of end of this session).
- **Status:** Active — awaiting Jim's response on next steps.

### Financial Projections (built June 2026)
File: `Documents/Claude/Projects/Campgrounder/Campgrounder_Financial_Projection.xlsx`

Three scenarios, each with two clearly labeled investment sources:

| Scenario | MOIF (★) | Other Sources | Total | 18-Mo Revenue | Breakeven |
|---|---|---|---|---|---|
| Conservative | $50,000 | $25,000 | $75,000 | ~$19K | Month 13-14 |
| Base Case | $62,500 | $25,000 | $87,500 | ~$57K | Month 9-10 |
| Optimistic | $75,000 | $25,000 | $100,000 | ~$229K | Month 5-6 |

Optimistic scenario hits ~$30K/mo revenue by Month 18, driven by:
- 74 partner campgrounds at $100/mo each
- Brand sponsorships (Yeti/Patagonia/REI tier) growing to ~$20K/mo
- Booking referral commissions scaling at 15%/mo

Revenue streams: (1) Campground partnership fees, (2) Brand sponsorships, (3) Booking referral commissions. No banner ads.

MOIF investment row is highlighted blue (★) in the spreadsheet, clearly separated from "Other Sources ($25K)."

### Next Steps (Business)
- [ ] Await Jim Baker's response to Ben's follow-up
- [ ] Be ready to share the financial projection spreadsheet with Jim
- [ ] Confirm what the "Other Sources ($25K)" represents (angel, friends/family, other grant?)
- [ ] Michigan operational presence — clarify how Ben plans to satisfy this requirement
- [ ] Prepare for a possible second meeting / term sheet discussion
