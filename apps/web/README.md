# RIGVERSE – Web app

## Quick start

From the **repo root** (this is an npm workspaces monorepo: `apps/web`, `apps/api`, `shared`):

```bash
npm install
npm run dev:web      # web only, http://localhost:3000
npm run dev          # web + api (needs apps/api/src)
```

Other useful scripts (run from the root):

```bash
npm run typecheck    # tsc on the web app
npm run build:web    # production build
```

## What this app contains
- A three-stage PC configurator (Forge → Studio → Showcase)
- Zustand stores with persist middleware (`session`, `build`, `scene`, `ui`, `pricing`), hydrated after mount by `StoreHydrator`
- Demo product catalog and demo prices (`src/lib/catalog.ts`) standing in for the API
- Live price aggregation with an auto-refresh toggle
- Compatibility checking across components (`src/lib/engine/check.ts`)
- 3D scene controls (environment, DPR cap, triangle budget)
- Neon UI theme (cyan, violet, pink, amber)

## Path aliases
Defined in `tsconfig.json` and picked up by Next.js:

| Alias | Points to |
|---|---|
| `@/*` | `apps/web/src/*` |
| `@shared/*` | `shared/src/*` (outside this folder, so `next.config.js` enables `experimental.externalDir`) |
