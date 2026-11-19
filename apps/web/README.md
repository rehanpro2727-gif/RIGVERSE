# RIGVERSE – Live Build Tracker

## Quick Start

1. **Install dependencies**
   ```bash
   cd C:\Users\user\GOOFEDMIND\apps\web
   npm install
   ```

2. **Run the development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

3. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## What this repo contains
- A three‑stage PC configurator (Forge → Studio → Showcase)
- Zustand stores with persist middleware (`session`, `build`, `scene`, `ui`, `pricing`, `hooks`)
- Live price aggregation with auto‑refresh toggle
- Compatibility checking across components
- 3D scene controls (environment, DPR cap, triangle budget)
- Neon UI theme (cyan, violet, pink, amber)

## Known issue resolved
- Added `apps/web/next.config.js` to resolve `@/*` and `@shared/*` path aliases, fixing the dev server import errors.

Feel free to explore the code under `src/` and contribute!