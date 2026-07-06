<script lang="ts">
	import type { PageData } from './$types';
	import type { ProducerRegion, SustainabilityMetric } from '$lib/types/sustainability-legacy';
	import { REGION_COLORS, METRIC_LABELS, METRIC_UNITS } from '$lib/types/sustainability-legacy';
	import StatCard from '$lib/components/StatCard.svelte';
	import SustainabilityHeatmap from '$lib/charts/SustainabilityHeatmap.svelte';
	import SustainabilityRankingChart from '$lib/charts/SustainabilityRankingChart.svelte';

	let { data }: { data: PageData } = $props();

	// Region filter
	let allRegions = $derived([...new Set(data.countries.map(c => c.region))].sort() as ProducerRegion[]);
	let selectedRegion = $state<ProducerRegion | ''>('');

	let filtered = $derived(
		selectedRegion === ''
			? data.countries
			: data.countries.filter(c => c.region === selectedRegion)
	);

	// Table sort
	type SortKey = SustainabilityMetric | 'composite';
	let sortBy = $state<SortKey>('composite');
	let sortAsc = $state(false);

	let sortedForTable = $derived.by(() => {
		const arr = [...filtered];
		arr.sort((a, b) => {
			let va: number, vb: number;
			switch (sortBy) {
				case 'carbon': va = a.carbonPerTon; vb = b.carbonPerTon; break;
				case 'water': va = a.waterPerKg; vb = b.waterPerKg; break;
				case 'labor': va = a.laborIndex; vb = b.laborIndex; break;
				case 'transparency': va = a.transparencyIndex; vb = b.transparencyIndex; break;
				default: va = a.compositeScore; vb = b.compositeScore;
			}
			return sortAsc ? va - vb : vb - va;
		});
		return arr;
	});

	// Stats
	let bestOverall = $derived(filtered.reduce((a, b) => a.compositeScore > b.compositeScore ? a : b));
	let avgCarbon = $derived(Math.round(filtered.reduce((s, c) => s + c.carbonPerTon, 0) / filtered.length));
	let avgWater = $derived(Math.round(filtered.reduce((s, c) => s + c.waterPerKg, 0) / filtered.length));

	function toggleSort(key: SortKey) {
		if (sortBy === key) {
			sortAsc = !sortAsc;
		} else {
			sortBy = key;
			sortAsc = false;
		}
	}

	function sortIndicator(key: SortKey): string {
		if (sortBy !== key) return '';
		return sortAsc ? ' ↑' : ' ↓';
	}
</script>

<svelte:head>
	<title>Sustainability Metrics — Vector10</title>
	<meta name="description" content="ESG scores, water usage, carbon footprint, and labor indices for textile supply chains." />
</svelte:head>

<div class="sustainability-page">
	<header class="page-header">
		<div class="header-text">
			<h1>
				<svg class="leaf-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.8 10-10 10Z"/>
					<path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
				</svg>
				Sustainability Metrics
			</h1>
			<p class="subtitle">ESG scores across textile supply chains | {filtered.length} producing countries</p>
		</div>
	</header>

	<!-- Stats Bar -->
	<div class="stats-bar">
		<StatCard
			label="Countries"
			value={String(filtered.length)}
			subtitle="Textile producers"
		/>
		<StatCard
			label="Best Overall"
			value={bestOverall.country}
			subtitle={'Score: ' + bestOverall.compositeScore + '/100'}
		/>
		<StatCard
			label="Avg Carbon"
			value={avgCarbon.toLocaleString()}
			subtitle="kg CO₂e / ton"
		/>
		<StatCard
			label="Avg Water"
			value={avgWater + ' L/kg'}
			subtitle="Per kg of textile"
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

	<!-- Heatmap -->
	<div class="viz-container card">
		<h3 class="section-title">Metric Comparison</h3>
		<p class="section-subtitle">Normalized scores — green is better, red is worse</p>
		<SustainabilityHeatmap data={filtered} height="560px" />
	</div>

	<!-- Ranking Chart -->
	<div class="viz-container card">
		<h3 class="section-title">Composite Score Ranking</h3>
		<p class="section-subtitle">Weighted average of all four metrics (equal weights, 0–100)</p>
		<SustainabilityRankingChart data={filtered} height="520px" />
	</div>

	<!-- Data Table -->
	<div class="table-card card">
		<h3 class="section-title">All Countries — Click headers to sort</h3>
		<div class="table-scroll">
			<table class="data-table">
				<thead>
					<tr>
						<th>#</th>
						<th>Country</th>
						<th class="hide-mobile">Region</th>
						<th class="th-right sortable" onclick={() => toggleSort('carbon')}>
							Carbon{sortIndicator('carbon')}
						</th>
						<th class="th-right sortable" onclick={() => toggleSort('water')}>
							Water{sortIndicator('water')}
						</th>
						<th class="th-right sortable hide-mobile" onclick={() => toggleSort('labor')}>
							Labor{sortIndicator('labor')}
						</th>
						<th class="th-right sortable hide-mobile" onclick={() => toggleSort('transparency')}>
							Transp.{sortIndicator('transparency')}
						</th>
						<th class="th-right sortable" onclick={() => toggleSort('composite')}>
							Score{sortIndicator('composite')}
						</th>
					</tr>
				</thead>
				<tbody>
					{#each sortedForTable as country, i}
						<tr>
							<td class="rank">{i + 1}</td>
							<td class="country-name">{country.country}</td>
							<td class="hide-mobile">
								<span class="region-tag" style:background="{REGION_COLORS[country.region]}20" style:color={REGION_COLORS[country.region]}>
									{country.region}
								</span>
							</td>
							<td class="value">{country.carbonPerTon.toLocaleString()}</td>
							<td class="value">{country.waterPerKg}</td>
							<td class="value hide-mobile">{country.laborIndex}</td>
							<td class="value hide-mobile">{country.transparencyIndex}</td>
							<td class="value composite-score">{country.compositeScore}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Methodology -->
	<div class="methodology">
		<h4 class="methodology-title">Methodology</h4>
		<p><strong>Carbon Footprint</strong> — Estimated from national grid carbon intensity (<strong>Low Carbon Power</strong>, 2024–25) combined with textile-specific energy consumption (~5 MWh/ton from DOE textile energy reviews). Countries with coal-heavy grids score higher emissions.</p>
		<p><strong>Water Usage</strong> — Based on <strong>Water Footprint Network</strong> cotton water footprint assessments and ICAC country-level data. Cotton-intensive producers (Pakistan, Egypt, India) show higher usage; synthetic-focused countries are lower.</p>
		<p><strong>Labor Index</strong> — Composite of minimum wage adequacy, working hours, and safety standards from <strong>ILO ILOSTAT</strong> garment worker data and <strong>ITUC Global Rights Index 2024</strong> ratings. Scale: 0 (worst) to 100 (best).</p>
		<p><strong>Transparency Index</strong> — Derived from <strong>Fashion Transparency Index 2024</strong> (Fashion Revolution) brand scores aggregated by country, supplemented by national supply chain legislation (e.g., German LkSG). Scale: 0 (opaque) to 100 (transparent).</p>
		<p><strong>Composite Score</strong> — All four metrics normalized to 0–100 (carbon and water inverted, since lower raw values are better), then averaged with equal weights (25% each).</p>
	</div>
</div>

<style>
	.sustainability-page {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);

		/* Eco-palette scoped to this page */
		--eco-primary: #5a7247;
		--eco-secondary: #6b8f71;
		--eco-accent: #4a90a4;
		--eco-warm: #c4956a;
		--eco-bg-tint: #f7faf5;
	}

	:global([data-theme='dark']) .sustainability-page {
		--eco-bg-tint: #0f1f14;
	}

	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
	}

	h1 {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		font-size: var(--text-3xl);
		font-weight: 700;
		letter-spacing: -0.03em;
		color: var(--eco-primary);
	}

	:global([data-theme='dark']) h1 {
		color: var(--eco-secondary);
	}

	.leaf-icon {
		width: 32px;
		height: 32px;
		color: var(--eco-secondary);
		flex-shrink: 0;
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
		background: var(--eco-bg-tint);
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
		background: var(--eco-primary);
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

	/* Chart sections */
	.viz-container {
		padding: var(--space-4);
		overflow: hidden;
		background: var(--eco-bg-tint);
		border-radius: var(--radius-xl);
	}

	.section-title {
		font-size: var(--text-base);
		font-weight: 600;
		color: var(--eco-primary);
		margin-bottom: var(--space-1);
	}

	:global([data-theme='dark']) .section-title {
		color: var(--eco-secondary);
	}

	.section-subtitle {
		font-size: var(--text-xs);
		color: var(--text-tertiary);
		margin-bottom: var(--space-4);
		font-family: var(--font-mono);
	}

	/* Table */
	.table-card {
		border-radius: var(--radius-xl);
	}

	.table-scroll {
		overflow-x: auto;
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

	.data-table .sortable {
		cursor: pointer;
		user-select: none;
	}

	.data-table .sortable:hover {
		color: var(--eco-primary);
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

	.composite-score {
		font-weight: 700;
		color: var(--eco-primary) !important;
	}

	:global([data-theme='dark']) .composite-score {
		color: var(--eco-secondary) !important;
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

	/* Methodology */
	.methodology {
		padding: var(--space-4);
		font-size: var(--text-xs);
		color: var(--text-tertiary);
		line-height: 1.6;
		border-top: 1px solid var(--border-subtle);
	}

	.methodology p {
		margin-bottom: var(--space-2);
	}

	.methodology p:last-child {
		margin-bottom: 0;
	}

	.methodology-title {
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--eco-primary);
		margin-bottom: var(--space-2);
	}

	:global([data-theme='dark']) .methodology-title {
		color: var(--eco-secondary);
	}

	@media (max-width: 768px) {
		h1 { font-size: var(--text-2xl); }

		.leaf-icon { width: 24px; height: 24px; }

		.stats-bar {
			grid-template-columns: repeat(2, 1fr);
		}

		.filter-bar {
			flex-direction: column;
			align-items: flex-start;
		}

		.viz-container {
			padding: var(--space-2);
		}

		.data-table .hide-mobile {
			display: none;
		}
	}
</style>
