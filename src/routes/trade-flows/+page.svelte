<script lang="ts">
	import type { PageData } from './$types';
	import type { HSChapter, TradeDirection, TradeFlow } from '$lib/types/trade';
	import { HS_CHAPTER_LABELS } from '$lib/types/trade';
	import { flowsToArcs, topCountries, flowsByChapter, formatTradeValue, aggregateFlows } from '$lib/data/transforms';
	import FilterPanel from '$lib/components/FilterPanel.svelte';
	import StatCard from '$lib/components/StatCard.svelte';
	import GlobeView from '$lib/maps/GlobeView.svelte';
	import SankeyChart from '$lib/charts/SankeyChart.svelte';
	import TreemapChart from '$lib/charts/TreemapChart.svelte';

	let { data }: { data: PageData } = $props();

	const allChapters = Object.keys(HS_CHAPTER_LABELS) as HSChapter[];

	// Filter state
	let year = $state(2023);
	let selectedChapters = $state<HSChapter[]>([...allChapters]);
	let direction = $state<TradeDirection>('export');

	// Filtered data
	let filteredFlows = $derived(
		data.flows.filter(f =>
			f.year === year &&
			selectedChapters.includes(f.hsChapter)
		)
	);

	let aggregatedFlows = $derived(aggregateFlows(filteredFlows));
	let arcs = $derived(flowsToArcs(filteredFlows));
	let topExporters = $derived(topCountries(filteredFlows, 'export', 10));
	let topImporters = $derived(topCountries(filteredFlows, 'import', 10));
	let chapterBreakdown = $derived(flowsByChapter(filteredFlows));

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
				HS Codes 50–63 | UN Comtrade Data | {year}
				{#if data.dataSource === 'demo'}
					<span class="data-badge demo">Demo Data</span>
				{:else}
					<span class="data-badge live">Live Data</span>
				{/if}
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
		{year}
		availableYears={[2023]}
		{selectedChapters}
		{direction}
		onYearChange={(y) => year = y}
		onChaptersChange={(ch) => selectedChapters = ch}
		onDirectionChange={(d) => direction = d}
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

	.data-badge.demo {
		background: var(--accent-warning);
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
