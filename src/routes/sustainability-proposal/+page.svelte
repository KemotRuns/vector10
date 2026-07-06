<script lang="ts">
	import type { PageData } from './$types';
	import type { MarketKey, ProducerRegion } from '$lib/types/sustainability';
	import { toMarketView } from '$lib/utils/marketRisk';
	import StatCard from '$lib/components/StatCard.svelte';
	import SustainabilityHero from '$lib/components/sustainability/SustainabilityHero.svelte';
	import RegionFilter from '$lib/components/sustainability/RegionFilter.svelte';
	import MarketSelector from '$lib/components/sustainability/MarketSelector.svelte';
	import CountryDetailPanel from '$lib/components/sustainability/CountryDetailPanel.svelte';
	import RegTimeline from '$lib/components/sustainability/RegTimeline.svelte';
	import FootprintCheck from '$lib/components/sustainability/FootprintCheck.svelte';
	import SustainabilityTable from '$lib/components/sustainability/SustainabilityTable.svelte';
	import MethodologySection from '$lib/components/sustainability/MethodologySection.svelte';
	import CtaBand from '$lib/components/sustainability/CtaBand.svelte';
	import RiskQuadrantChart from '$lib/charts/RiskQuadrantChart.svelte';
	import ComplianceRankingChart from '$lib/charts/ComplianceRankingChart.svelte';

	let { data }: { data: PageData } = $props();

	let countries = $derived(data.dataset.countries);

	let allRegions = $derived([...new Set(countries.map((c) => c.region))].sort() as ProducerRegion[]);
	let selectedRegion = $state<ProducerRegion | ''>('');
	let selectedMarkets = $state<MarketKey[]>(['eu']);
	let selectedIso3 = $state<string | null>(null);
	let vizMode = $state<'footprint' | 'cost'>('cost');

	let filtered = $derived(
		selectedRegion === '' ? countries : countries.filter((c) => c.region === selectedRegion)
	);
	let enriched = $derived(filtered.map((c) => toMarketView(c, selectedMarkets)));
	let selectedCountry = $derived(countries.find((c) => c.iso3 === selectedIso3) ?? null);

	// KPI stats (market-aware)
	let highRiskCount = $derived(enriched.filter((c) => c.marketRisk >= 60).length);
	let cleanestGrid = $derived(
		filtered.reduce((a, b) => (a.gridCarbonIntensity < b.gridCarbonIntensity ? a : b))
	);
	let bestValue = $derived(
		enriched.reduce((a, b) => (a.costIndex + a.marketRisk < b.costIndex + b.marketRisk ? a : b))
	);

	function selectCountry(iso3: string) {
		selectedIso3 = selectedIso3 === iso3 ? null : iso3;
	}
</script>

<svelte:head>
	<title>Sourcing Compliance & Footprint (Proposal) — Vector10</title>
	<meta
		name="description"
		content="Cost, footprint and market-conditional regulatory exposure — CSRD, CBAM, EPR, UFLPA and Digital Product Passports — across 43 textile sourcing countries, with an interactive sourcing check."
	/>
	<!-- Internal review page — keep out of search indexes -->
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="sustainability-page">
	<SustainabilityHero countryCount={countries.length} />

	<div class="stats-bar">
		<StatCard label="Countries" value={String(filtered.length)} subtitle="Sourcing countries mapped" />
		<StatCard label="High Compliance Risk" value={String(highRiskCount)} subtitle="For your selling markets" />
		<StatCard
			label="Cleanest Grid"
			value={cleanestGrid.country}
			subtitle={cleanestGrid.gridCarbonIntensity + ' gCO₂/kWh'}
		/>
		<StatCard
			label="Best Value"
			value={bestValue.country}
			subtitle="Lowest cost × risk for your markets"
		/>
	</div>

	<MarketSelector selected={selectedMarkets} onChange={(m) => (selectedMarkets = m)} />
	<RegionFilter regions={allRegions} selected={selectedRegion} onChange={(r) => (selectedRegion = r)} />

	<div class="viz-container card">
		<div class="viz-header">
			<div>
				<h3 class="section-title">
					{vizMode === 'cost' ? 'Cost vs. compliance risk' : 'Footprint vs. compliance risk'}
				</h3>
				<p class="section-subtitle">
					{vizMode === 'cost'
						? 'The sourcing trade-off for your selling markets · bubble size = EU export share · click a country for detail'
						: 'Bubble size = share of textile exports going to the EU · click a country for detail'}
				</p>
			</div>
			<div class="viz-toggle">
				<button class="viz-btn" class:active={vizMode === 'cost'} onclick={() => (vizMode = 'cost')}>
					Cost
				</button>
				<button
					class="viz-btn"
					class:active={vizMode === 'footprint'}
					onclick={() => (vizMode = 'footprint')}
				>
					Footprint
				</button>
			</div>
		</div>
		<RiskQuadrantChart data={enriched} mode={vizMode} onSelect={selectCountry} />
	</div>

	{#if selectedCountry}
		<CountryDetailPanel
			country={selectedCountry}
			all={countries}
			markets={selectedMarkets}
			sources={data.dataset.sources}
			onClose={() => (selectedIso3 = null)}
		/>
	{/if}

	<div class="viz-container card">
		<h3 class="section-title">Compliance risk ranking</h3>
		<p class="section-subtitle">
			Scored for your selling markets — CSRD, EPR, CBAM and DPP where you sell into the EU; UFLPA
			and traceability where you sell into North America
		</p>
		<ComplianceRankingChart data={enriched} onSelect={selectCountry} />
	</div>

	<RegTimeline />

	<FootprintCheck {countries} initialMarkets={selectedMarkets} />

	<SustainabilityTable countries={enriched} {selectedIso3} onSelect={selectCountry} />

	<CtaBand />

	<MethodologySection sources={data.dataset.sources} generatedAt={data.dataset.generatedAt} />
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
		--eco-risk: #c0574f;
		--eco-bg-tint: #f7faf5;
	}

	:global([data-theme='dark']) .sustainability-page {
		--eco-bg-tint: #0f1f14;
	}

	.stats-bar {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: var(--space-4);
	}

	.viz-container {
		padding: var(--space-4);
		overflow: hidden;
		background: var(--eco-bg-tint);
		border-radius: var(--radius-xl);
	}

	.viz-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-4);
	}

	.viz-toggle {
		display: flex;
		border: 1px solid var(--border-default);
		border-radius: var(--radius-md);
		overflow: hidden;
		flex-shrink: 0;
	}

	.viz-btn {
		padding: var(--space-1) var(--space-3);
		border: none;
		background: var(--bg-secondary);
		color: var(--text-secondary);
		font-size: var(--text-xs);
		font-weight: 600;
		font-family: var(--font-body);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.viz-btn:not(:last-child) {
		border-right: 1px solid var(--border-default);
	}

	.viz-btn.active {
		background: var(--eco-primary);
		color: white;
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

	@media (max-width: 768px) {
		.stats-bar {
			grid-template-columns: repeat(2, 1fr);
		}

		.viz-container {
			padding: var(--space-2);
		}

		.viz-header {
			flex-direction: column;
		}
	}
</style>
