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
