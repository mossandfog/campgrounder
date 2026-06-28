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
`cg_compass_seen`, `cg_trail_discovered`
