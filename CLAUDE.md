# Vector10 — Textile Intelligence Dashboards

## Project Overview
A collection of lightweight, beautiful data dashboards for the textile industry. Built to be integrated into a textile consulting company's website. The first dashboard visualizes global textile trade flows using UN Comtrade data (HS codes 50-63).

## Tech Stack
- **Framework**: SvelteKit (Svelte 5) — compiles to vanilla JS, zero runtime overhead
- **Language**: TypeScript (strict mode)
- **Charting**: ECharts (modular imports only — never import all of echarts)
- **Maps/Globe**: deck.gl + MapLibre GL JS (for trade flow arc visualizations)
- **Styling**: CSS custom properties + minimal utility classes (no Tailwind — keep it light)
- **Build**: Vite 7
- **Data Source**: UN Comtrade API v2 (HS codes 50-63: textiles, apparel, made-up articles)

## Project Structure
```
src/
  lib/
    components/    # Reusable Svelte components
    charts/        # ECharts wrapper components
    maps/          # deck.gl / MapLibre components
    data/          # Data fetching, transformation, caching
    types/         # TypeScript type definitions
    stores/        # Svelte stores for shared state
    utils/         # Pure utility functions
  routes/
    +layout.svelte # Root layout (nav, theme)
    +page.svelte   # Landing / dashboard index
    trade-flows/   # UN Comtrade trade flow dashboard
static/
  data/            # Pre-processed JSON data files (for offline/demo mode)
  fonts/           # Self-hosted fonts (no external CDN calls)
```

## Development Commands
```bash
npm run dev          # Start dev server on :5173
npm run build        # Production build
npm run preview      # Preview production build
npm run check        # TypeScript + Svelte diagnostics
```

## Coding Conventions

### General
- Keep bundle size minimal — always use tree-shakeable, modular imports
- No unnecessary dependencies — justify each addition
- Prefer CSS custom properties for theming over JS-based solutions
- All data transformations happen server-side or in +page.server.ts loaders
- Static/pre-processed data in `static/data/` for demo mode without API keys

### TypeScript
- Strict mode, no `any` types
- Define shared types in `src/lib/types/`
- Use Zod for runtime validation of external API data

### Svelte
- Use Svelte 5 runes (`$state`, `$derived`, `$effect`) — no legacy reactive syntax
- Components should be small and focused (< 150 lines)
- Props via `$props()` with TypeScript interfaces

### Styling
- CSS custom properties defined in `:root` in the layout
- Component-scoped styles (Svelte default)
- Mobile-first responsive design
- Dark mode support via `prefers-color-scheme` + manual toggle
- Design aesthetic: clean, professional, data-dense but not cluttered

### Data
- UN Comtrade API key stored in `.env` as `COMTRADE_API_KEY`
- All API calls go through SvelteKit server routes (`+server.ts`)
- Cache API responses to avoid rate limits (free tier: 500 records/call)
- Pre-process heavy datasets into static JSON for fast loading

### Git
- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`
- Maintain CHANGELOG.md with each meaningful change
- One feature per branch, squash merge to main

## HS Code Reference (Textiles: 50-63)
| Code | Category |
|------|----------|
| 50 | Silk |
| 51 | Wool, fine/coarse animal hair, horsehair yarn |
| 52 | Cotton |
| 53 | Other vegetable textile fibres; paper yarn |
| 54 | Man-made filaments; strip of man-made textile materials |
| 55 | Man-made staple fibres |
| 56 | Wadding, felt & nonwovens; special yarns; twine, cordage |
| 57 | Carpets and other textile floor coverings |
| 58 | Special woven fabrics; tufted textile fabrics; lace; tapestries |
| 59 | Impregnated, coated, covered or laminated textile fabrics |
| 60 | Knitted or crocheted fabrics |
| 61 | Articles of apparel & clothing accessories, knitted or crocheted |
| 62 | Articles of apparel & clothing accessories, not knitted or crocheted |
| 63 | Other made up textile articles; sets; worn clothing; rags |

## Future Dashboards (Planned)
- Fiber price indices and trends
- Sustainability / ESG metrics for textile supply chains
- Country-level textile industry profiles
- Trade agreement impact analysis
