<script lang="ts">
	import type { PageData } from './$types';
	import type { ConsumerRegion } from '$lib/types/consumer';
	import { REGION_COLORS } from '$lib/types/consumer';
	import StatCard from '$lib/components/StatCard.svelte';
	import ConsumerScatterChart from '$lib/charts/ConsumerScatterChart.svelte';

	let { data }: { data: PageData } = $props();

	// Region filter
	let allRegions = $derived([...new Set(data.countries.map(c => c.region))].sort() as ConsumerRegion[]);
	let selectedRegion = $state<ConsumerRegion | ''>('');

	let filtered = $derived(
		selectedRegion === ''
			? data.countries
			: data.countries.filter(c => c.region === selectedRegion)
	);

	// Stats
	let avgSpend = $derived(Math.round(filtered.reduce((s, c) => s + c.spendPerCapita, 0) / filtered.length));
	let highestSpender = $derived(filtered.reduce((a, b) => a.spendPerCapita > b.spendPerCapita ? a : b));
	let mostItems = $derived(filtered.reduce((a, b) => a.itemsPerCapita > b.itemsPerCapita ? a : b));
</script>

<svelte:head>
	<title>Consumer Spending — Vector10</title>
	<meta name="description" content="Global apparel consumer spending per capita vs items purchased." />
</svelte:head>

<div class="consumer-page">
	<header class="page-header">
		<div class="header-text">
			<h1>Global Apparel Consumer Spending</h1>
			<p class="subtitle">Annual spend per person vs. items purchased | {filtered.length} markets</p>
		</div>
	</header>

	<!-- Stats Bar -->
	<div class="stats-bar">
		<StatCard
			label="Avg Spend"
			value="${avgSpend}"
			subtitle="Per person / year"
		/>
		<StatCard
			label="Markets"
			value={String(filtered.length)}
			subtitle="Countries tracked"
		/>
		<StatCard
			label="Highest Spend"
			value={highestSpender.country}
			subtitle={'$' + highestSpender.spendPerCapita + '/person'}
		/>
		<StatCard
			label="Most Items"
			value={mostItems.country}
			subtitle={mostItems.itemsPerCapita + ' items/person'}
		/>
	</div>

	<!-- Region Filter -->
	<div class="filter-bar">
		<span class="filter-label">Region</span>
		<div class="toggle-group">
			<button
				class="toggle-btn"
				class:active={selectedRegion === ''}
				onclick={() => selectedRegion = ''}
			>All</button>
			{#each allRegions as region}
				<button
					class="toggle-btn"
					class:active={selectedRegion === region}
					onclick={() => selectedRegion = region}
				>
					<span class="region-dot" style:background={REGION_COLORS[region]}></span>
					{region}
				</button>
			{/each}
		</div>
	</div>

	<!-- Scatter Chart -->
	<div class="viz-container card">
		<ConsumerScatterChart data={filtered} height="520px" />
	</div>

	<!-- Data Table -->
	<div class="table-card card">
		<h3 class="table-title">All Markets — Ranked by Spend per Capita</h3>
		<table class="data-table">
			<thead>
				<tr>
					<th>#</th>
					<th>Country</th>
					<th>Region</th>
					<th class="th-right">Spend / Person</th>
					<th class="th-right">Items / Person</th>
					<th class="th-right">Avg Price / Item</th>
				</tr>
			</thead>
			<tbody>
				{#each [...filtered].sort((a, b) => b.spendPerCapita - a.spendPerCapita) as country, i}
					<tr>
						<td class="rank">{i + 1}</td>
						<td class="country-name">{country.country}</td>
						<td>
							<span class="region-tag" style:background="{REGION_COLORS[country.region]}20" style:color={REGION_COLORS[country.region]}>
								{country.region}
							</span>
						</td>
						<td class="value">${country.spendPerCapita}</td>
						<td class="value">{country.itemsPerCapita}</td>
						<td class="value">${Math.round(country.spendPerCapita / country.itemsPerCapita)}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<!-- Methodology -->
	<div class="methodology">
		<h4 class="methodology-title">Methodology</h4>
		<p>Consumer spending data compiled from <strong>NIQ-GfK 2025 European Consumer Study</strong> (25 European markets), <strong>Statista</strong> (apparel spend per capita), and <strong>Wunderlabel</strong> industry reports. Spend per capita represents annual apparel expenditure in USD. Items per capita sourced from industry surveys and national statistics where available. Average price per item is calculated (spend / items). Population figures from World Bank 2023 estimates.</p>
	</div>
</div>

<style>
	.consumer-page {
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
	}

	.stats-bar {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: var(--space-4);
	}

	/* Filter bar */
	.filter-bar {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-4) var(--space-5);
		background: var(--bg-card);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-lg);
	}

	.filter-label {
		font-size: var(--text-xs);
		font-weight: 600;
		color: var(--text-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.toggle-group {
		display: flex;
		flex-wrap: wrap;
		border: 1px solid var(--border-default);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.toggle-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		border: none;
		background: var(--bg-secondary);
		color: var(--text-secondary);
		font-size: var(--text-sm);
		font-family: var(--font-body);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.toggle-btn:not(:last-child) {
		border-right: 1px solid var(--border-default);
	}

	.toggle-btn.active {
		background: var(--accent-primary);
		color: white;
	}

	.toggle-btn:not(.active):hover {
		background: var(--bg-tertiary);
		color: var(--text-primary);
	}

	.region-dot {
		display: inline-block;
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}

	.toggle-btn.active .region-dot {
		background: white !important;
	}

	/* Chart */
	.viz-container {
		padding: var(--space-4);
		overflow: hidden;
	}

	/* Table */
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

	.data-table .th-right {
		text-align: right;
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

	.country-name {
		font-weight: 500;
		color: var(--text-primary);
	}

	.data-table .value {
		font-family: var(--font-mono);
		font-weight: 500;
		color: var(--text-primary);
		text-align: right;
	}

	.region-tag {
		font-size: var(--text-xs);
		font-weight: 600;
		padding: 2px 8px;
		border-radius: var(--radius-full);
		white-space: nowrap;
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

		.filter-bar {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
