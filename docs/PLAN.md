# Vector10 — Project Plan

## Vision
A suite of lightweight, visually striking dashboards for textile industry intelligence. Designed to be embedded into a textile consulting company's website. Each dashboard is a self-contained module that can be added incrementally.

---

## Dashboard 1: Global Textile Trade Flows (UN Comtrade)

### Data Source
- **UN Comtrade API v2** — international trade statistics
- **HS Codes 50-63** — all textile-related commodity classifications
- Annual trade data (imports/exports by country, by HS chapter)
- Free tier: 500 records/call, no API key required
- Registered tier: 100K records/call, 500 calls/day

### Visualizations Planned

#### 1. Globe View — Trade Flow Arcs
- Interactive 3D globe using **deck.gl GlobeView + MapLibre GL**
- Animated arc layers showing export flows between countries
- Color-coded by HS chapter (silk = gold, cotton = white, synthetics = blue, etc.)
- Click a country to filter — see its imports/exports
- Zoom into regions for detail

#### 2. Sankey Diagram — Flow Breakdown
- **ECharts Sankey** showing: Exporter → HS Category → Importer
- Filter by year, by HS chapter, by trade value threshold
- Hover for detailed trade values

#### 3. Treemap — Market Share
- **ECharts Treemap** showing top exporters/importers by trade value
- Drill down: Country → HS Chapter → Specific codes
- Toggle between export and import view

#### 4. Time Series — Trend Analysis
- **ECharts Line/Area charts** showing trade value over time
- Compare countries, compare HS chapters
- Highlight disruptions (COVID, trade wars, etc.)

#### 5. Country Profile Cards
- Summary cards for top textile trading nations
- Key metrics: total trade value, top partners, dominant categories
- Sparkline trends

### Data Strategy
1. **Pre-process** — Download bulk Comtrade data for key years, transform into optimized JSON
2. **Static-first** — Ship pre-processed data in `static/data/` for instant loading
3. **Live queries** — Optional API calls for custom filters / latest data
4. **Caching** — Server-side cache with SvelteKit to avoid rate limits

### Implementation Phases

#### Phase 1A: Foundation
- [x] Project setup (SvelteKit, TypeScript, git)
- [x] CLAUDE.md, CHANGELOG.md
- [ ] Install core dependencies (ECharts, deck.gl, MapLibre)
- [ ] Design system: color palette, typography, layout grid
- [ ] Root layout with navigation shell
- [ ] Dark/light theme toggle

#### Phase 1B: Data Pipeline
- [ ] UN Comtrade API client (server-side)
- [ ] Data transformation utilities (aggregate by country, by HS chapter)
- [ ] Pre-process sample dataset (top 20 textile trading countries, 2020-2024)
- [ ] TypeScript types for trade data structures
- [ ] Static JSON data files for demo mode

#### Phase 1C: Globe Visualization
- [ ] MapLibre GL base map with globe projection
- [ ] deck.gl ArcLayer for trade flows
- [ ] Country selection interaction
- [ ] Legend and controls
- [ ] Responsive layout

#### Phase 1D: Charts
- [ ] ECharts Sankey diagram (trade flows)
- [ ] ECharts Treemap (market share)
- [ ] ECharts time series (trends)
- [ ] Country profile cards
- [ ] Filter panel (year, HS chapter, direction)

#### Phase 1E: Polish
- [ ] Loading states and transitions
- [ ] Mobile responsiveness
- [ ] Performance optimization (lazy load charts)
- [ ] SEO meta tags
- [ ] Demo mode (no API key needed)

---

## Future Dashboards (Roadmap)

### Dashboard 2: Fiber Price Index
- Track cotton, polyester, nylon, wool price indices
- Data from public commodity exchanges
- Correlation analysis between prices and trade volumes

### Dashboard 3: Sustainability Metrics
- ESG scores for textile supply chains by country
- Water usage, carbon footprint, labor indices
- Sustainability certification tracking

### Dashboard 4: Trade Agreement Impact
- Visualize how FTAs affect textile trade flows
- Before/after analysis for major agreements
- Tariff rate mapping

### Dashboard 5: Industry Discovery
- Company directory for textile industry
- Interactive supply chain mapping
- Trade show and event calendar

---

## Technical Decisions Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | SvelteKit | Zero runtime, smallest bundle, compiles to vanilla JS |
| Charts | ECharts | Modular, widest chart variety, great Sankey/Treemap support |
| Maps | deck.gl + MapLibre | Open source, globe view, WebGL arc layers, no Mapbox fees |
| Styling | CSS custom properties | No framework overhead, native browser support |
| Data | Static JSON + API | Fast initial load, optional live queries |
| No Tailwind | CSS custom props | Smaller bundle, more control, less bloat |
