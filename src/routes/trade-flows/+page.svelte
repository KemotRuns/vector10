<script lang="ts">
	import type { PageData } from './$types';
	import type { HSChapter, TradeDirection } from '$lib/types/trade';
	import { HS_CHAPTER_LABELS } from '$lib/types/trade';
	import { flowsToArcs, topCountries, flowsByChapter, formatTradeValue, aggregateFlows } from '$lib/data/transforms';
	import { getCountry } from '$lib/data/countries';
	import FilterPanel from '$lib/components/FilterPanel.svelte';
	import StatCard from '$lib/components/StatCard.svelte';
	import GlobeView from '$lib/maps/GlobeView.svelte';
	import SankeyChart from '$lib/charts/SankeyChart.svelte';
	import TreemapChart from '$lib/charts/TreemapChart.svelte';

	let { data }: { data: PageData } = $props();

	const allChapters = Object.keys(HS_CHAPTER_LABELS) as HSChapter[];

	// Filter state
	let selectedChapters = $state<HSChapter[]>([...allChapters]);
	let direction = $state<TradeDirection>('export');
	let selectedCountry = $state('');

	// All countries appearing in the data, resolved to names, junk codes excluded
	let countryOptions = $derived.by(() => {
		const codes = new Set<string>();
		for (const f of data.flows) {
			codes.add(f.reporter);
			codes.add(f.partner);
		}
		return [...codes]
			.map(iso3 => ({ iso3, name: getCountry(iso3)?.name ?? '' }))
			.filter(c => c.name !== '')
			.sort((a, b) => a.name.localeCompare(b.name));
	});

	// Filtered data — country filter matches reporter OR partner
	let filteredFlows = $derived(
		data.flows.filter(f =>
			selectedChapters.includes(f.hsChapter) &&
			(selectedCountry === '' || f.reporter === selectedCountry || f.partner === selectedCountry)
		)
	);

	let aggregatedFlows = $derived(aggregateFlows(filteredFlows));
	let topExporters = $derived(topCountries(filteredFlows, 'export', 10));
	let chapterBreakdown = $derived(flowsByChapter(filteredFlows));

	// Globe arcs: limit to flows where the reporter is a top-10 country to avoid visual noise
	let globeFlows = $derived.by(() => {
		const topCodes = new Set(topExporters.map(c => c.iso3));
		return filteredFlows.filter(f => topCodes.has(f.reporter));
	});
	let arcs = $derived(flowsToArcs(globeFlows));

	// Summary stats
	let totalTradeValue = $derived(
		filteredFlows
			.filter(f => f.direction === 'export')
			.reduce((sum, f) => sum + f.tradeValue, 0)
	);
	let uniqueCountries = $derived(
		new Set([
			...filteredFlows.map(f => f.reporter),
			...filteredFlows.map(f => f.partner)
		]).size
	);
	let activeChapters = $derived(
		new Set(filteredFlows.map(f => f.hsChapter)).size
	);

	// Active visualization tab
	let activeTab = $state<'globe' | 'sankey' | 'treemap'>('globe');
</script>

<svelte:head>
	<title>Trade Flows — Vector10</title>
	<meta name="description" content="Global textile trade flow visualization powered by UN Comtrade data." />
</svelte:head>

<div class="trade-flows">
	<header class="page-header">
		<div class="header-text">
			<h1>Global Textile Trade Flows</h1>
			<p class="subtitle">
				HS Codes 50–63 | UN Comtrade Data | 2023
				<span class="data-badge live">Live Data</span>
			</p>
		</div>
	</header>

	<!-- Stats Bar -->
	<div class="stats-bar">
		<StatCard
			label="Total Trade"
			value={formatTradeValue(totalTradeValue)}
			subtitle="Export value"
		/>
		<StatCard
			label="Countries"
			value={String(uniqueCountries)}
			subtitle="Trading partners"
		/>
		<StatCard
			label="HS Chapters"
			value={String(activeChapters)}
			subtitle="Active categories"
		/>
		<StatCard
			label="Trade Flows"
			value={String(filteredFlows.length)}
			subtitle="Bilateral flows"
		/>
	</div>

	<!-- Filters -->
	<FilterPanel
		{selectedChapters}
		{direction}
		countries={countryOptions}
		{selectedCountry}
		onChaptersChange={(ch) => selectedChapters = ch}
		onDirectionChange={(d) => direction = d}
		onCountryChange={(iso3) => selectedCountry = iso3}
	/>

	<!-- Visualization Tabs -->
	<div class="viz-section">
		<div class="tab-bar">
			<button class="tab" class:active={activeTab === 'globe'} onclick={() => activeTab = 'globe'}>
				Globe
			</button>
			<button class="tab" class:active={activeTab === 'sankey'} onclick={() => activeTab = 'sankey'}>
				Flow Diagram
			</button>
			<button class="tab" class:active={activeTab === 'treemap'} onclick={() => activeTab = 'treemap'}>
				Market Share
			</button>
		</div>

		<div class="viz-container card">
			{#if activeTab === 'globe'}
				<GlobeView {arcs} height="550px" />
			{:else if activeTab === 'sankey'}
				<SankeyChart flows={aggregatedFlows} height="500px" />
			{:else if activeTab === 'treemap'}
				<TreemapChart flows={aggregatedFlows} {direction} height="500px" />
			{/if}
		</div>
	</div>

	<!-- Top Countries Tables -->
	<div class="tables-grid">
		<div class="table-card card">
			<h3 class="table-title">Top Exporters</h3>
			<table class="data-table">
				<thead>
					<tr>
						<th>#</th>
						<th>Country</th>
						<th>Export Value</th>
					</tr>
				</thead>
				<tbody>
					{#each topExporters as country, i}
						<tr>
							<td class="rank">{i + 1}</td>
							<td>{country.name}</td>
							<td class="value">{formatTradeValue(country.totalValue)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<div class="table-card card">
			<h3 class="table-title">HS Chapter Breakdown</h3>
			<table class="data-table">
				<thead>
					<tr>
						<th>Code</th>
						<th>Category</th>
						<th>Value</th>
					</tr>
				</thead>
				<tbody>
					{#each [...chapterBreakdown.entries()].sort((a, b) => b[1] - a[1]) as [chapter, value]}
						<tr>
							<td class="rank">{chapter}</td>
							<td>{HS_CHAPTER_LABELS[chapter]}</td>
							<td class="value">{formatTradeValue(value)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Methodology -->
	<div class="methodology">
		<h4 class="methodology-title">Methodology</h4>
		<p>Trade flow data sourced from the <strong>UN Comtrade</strong> database (2023), covering HS codes 50–63 (textiles, apparel, and made-up articles). Values represent reported bilateral merchandise trade in USD. Aggregate and unresolved partner codes are excluded. The globe visualization shows flows from the top 10 exporters to reduce visual clutter. Sankey diagrams aggregate the top 12 exporters/importers and top 8 product categories by value.</p>
	</div>
</div>

<style>
	.trade-flows {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
	}

	h1 {
		font-size: var(--text-3xl);
		font-weight: 700;
		letter-spacing: -0.03em;
		color: var(--text-primary);
	}

	.subtitle {
		font-size: var(--text-sm);
		color: var(--text-tertiary);
		margin-top: var(--space-1);
		font-family: var(--font-mono);
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.data-badge {
		font-size: var(--text-xs);
		font-family: var(--font-body);
		padding: 1px 8px;
		border-radius: var(--radius-full);
		font-weight: 600;
		letter-spacing: 0;
	}

	.data-badge.live {
		background: var(--accent-success);
		color: #16121d;
	}

	.stats-bar {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: var(--space-4);
	}

	/* Viz Tabs */
	.viz-section {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.tab-bar {
		display: flex;
		gap: var(--space-1);
		border-bottom: 1px solid var(--border-default);
		padding-bottom: 0;
	}

	.tab {
		padding: var(--space-3) var(--space-5);
		border: none;
		background: none;
		color: var(--text-secondary);
		font-size: var(--text-sm);
		font-weight: 500;
		font-family: var(--font-body);
		cursor: pointer;
		border-bottom: 2px solid transparent;
		transition: all var(--transition-fast);
		margin-bottom: -1px;
	}

	.tab:hover {
		color: var(--text-primary);
	}

	.tab.active {
		color: var(--accent-primary);
		border-bottom-color: var(--accent-primary);
	}

	.viz-container {
		border-top-left-radius: 0;
		border-top-right-radius: 0;
		padding: 0;
		overflow: hidden;
	}

	/* Tables */
	.tables-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
		gap: var(--space-4);
	}

	.table-title {
		font-size: var(--text-base);
		font-weight: 600;
		color: var(--text-primary);
		margin-bottom: var(--space-4);
	}

	.data-table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--text-sm);
	}

	.data-table th {
		text-align: left;
		font-size: var(--text-xs);
		font-weight: 600;
		color: var(--text-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: var(--space-2) var(--space-3);
		border-bottom: 1px solid var(--border-default);
	}

	.data-table td {
		padding: var(--space-2) var(--space-3);
		border-bottom: 1px solid var(--border-subtle);
		color: var(--text-secondary);
	}

	.data-table .rank {
		color: var(--text-tertiary);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		width: 30px;
	}

	.data-table .value {
		font-family: var(--font-mono);
		font-weight: 500;
		color: var(--text-primary);
		text-align: right;
	}

	.data-table tbody tr:hover {
		background: var(--bg-secondary);
	}

	.methodology {
		padding: var(--space-4);
		font-size: var(--text-xs);
		color: var(--text-tertiary);
		line-height: 1.6;
		border-top: 1px solid var(--border-subtle);
	}

	.methodology-title {
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--text-secondary);
		margin-bottom: var(--space-2);
	}

	@media (max-width: 768px) {
		h1 { font-size: var(--text-2xl); }

		.stats-bar {
			grid-template-columns: repeat(2, 1fr);
		}

		.tables-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
