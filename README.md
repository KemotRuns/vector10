# Vector10

Textile intelligence dashboards — lightweight, beautiful, data-driven.

## What is this?

A collection of interactive dashboards for the global textile industry, built to be embedded into a consulting company's website.

### Dashboards

1. **Global Trade Flows** — Visualize textile trade between countries using UN Comtrade data (HS 50-63). Interactive globe, Sankey diagrams, treemaps, and time series.

*More dashboards coming soon.*

## Tech Stack

- [SvelteKit](https://svelte.dev/) + TypeScript
- [ECharts](https://echarts.apache.org/) for charts
- [deck.gl](https://deck.gl/) + [MapLibre GL](https://maplibre.org/) for globe/map visualizations
- UN Comtrade API v2 for trade data

## Getting Started

```bash
npm install
cp .env.example .env  # Add your Comtrade API key (optional — demo data included)
npm run dev
```

## License

Private — all rights reserved.
