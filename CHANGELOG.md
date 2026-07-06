# Changelog

All notable changes to the Vector10 project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2026-07-06

### Added
- New "Sourcing Compliance & Footprint" module at `/sustainability-proposal` — an
  unlisted, noindexed page for team review; the existing `/sustainability` dashboard
  is unchanged until the proposal is approved (then it replaces it)
- Market-aware risk and cost dimension on the proposal page: "Where do you sell?"
  selector (EU & UK / North America / Japan & Korea / Rest of world) makes compliance
  risk market-conditional (UFLPA-driven for the US, CSRD/EPR/CBAM/DPP for the EU);
  new sourcing cost index (ILO labor cost + tariff preference + lead time) with a
  cost-vs-risk quadrant as the headline chart, cost profile and per-market risk in
  the country detail panel, and a selling-markets step in the footprint check
  - Expanded from 20 to 43 countries (now includes Taiwan, Japan, Uzbekistan, and 20 more)
  - New metrics: grid carbon intensity, low-carbon electricity share, WRI water stress,
    ITUC labor risk, EU export share, plus Vector10-assessed regulatory exposure tiers
    (CBAM, CSRD, textile EPR) and Digital Product Passport readiness
  - New composite scores: footprint score (higher = cleaner) and compliance risk score
  - Risk quadrant scatter (footprint vs. compliance risk, bubble = EU export share)
    and compliance risk ranking replace the heatmap and composite ranking charts
  - Country detail panel with metrics vs. median, tier chips, citations, contextual CTA
  - EU regulatory timeline (CSRD → EPR → ESPR/DPP)
  - Interactive "Where do you stand?" footprint check: pick sourcing countries and
    product category → directional footprint/risk estimate with prefilled Let's Talk CTA
  - Reproducible data pipeline: curated cited CSVs in static/data/raw/sustainability/
    built by scripts/build-sustainability-data.mjs, Zod-validated at load
  - Nav renamed to "Sustainability & Compliance"

## [0.1.0] - 2026-03-21

### Added
- Full Trade Flows dashboard with Globe, Sankey, and Treemap visualizations
- Design system: CSS custom properties, dark/light themes, Inter font
- Root layout with navigation shell and theme toggle
- Globe visualization using deck.gl ArcLayer + MapLibre GL (globe projection)
- ECharts Sankey diagram (Exporter → HS Chapter → Importer flows)
- ECharts Treemap (market share by country and HS chapter)
- ECharts Time Series chart component (for multi-year data)
- Filter panel with year, direction, and HS chapter chip selectors
- Stat cards for key metrics (total trade, countries, chapters, flows)
- Top exporters and HS chapter breakdown tables
- Landing page with dashboard index and HS classification reference
- UN Comtrade API client (server-side, Zod-validated)
- Demo dataset: 120 realistic trade flow records for 2023 (20 countries, 8 HS chapters)
- Country coordinate data for 40 textile-trading nations
- Data transformation utilities (aggregate, arcs, top countries, format)
- Core TypeScript types for trade data

### Dependencies
- echarts 6.0, deck.gl 9.2, maplibre-gl 5.21, zod 4.3

## [0.0.1] - 2026-03-21

### Added
- Initial project scaffolding with SvelteKit + TypeScript
- CLAUDE.md with project conventions and technical decisions
- Project plan for Phase 1: Global Textile Trade Flow Dashboard
- Git repository initialization
