<script lang="ts">
	import type { PageData } from './$types';
	import type { ProducerRegion } from '$lib/types/sustainability';
	import StatCard from '$lib/components/StatCard.svelte';
	import SustainabilityHero from '$lib/components/sustainability/SustainabilityHero.svelte';
	import RegionFilter from '$lib/components/sustainability/RegionFilter.svelte';
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
	let selectedIso3 = $state<string | null>(null);

	let filtered = $derived(
		selectedRegion === '' ? countries : countries.filter((c) => c.region === selectedRegion)
	);
	let selectedCountry = $derived(countries.find((c) => c.iso3 === selectedIso3) ?? null);

	// KPI stats
	let highRiskCount = $derived(filtered.filter((c) => c.complianceRiskScore >= 60).length);
	let cleanestGrid = $derived(
		filtered.reduce((a, b) => (a.gridCarbonIntensity < b.gridCarbonIntensity ? a : b))
	);
	let medianFootprint = $derived.by(() => {
		const sorted = [...filtered].map((c) => c.footprintScore).sort((a, b) => a - b);
		const mid = Math.floor(sorted.length / 2);
		return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
	});

	function selectCountry(iso3: string) {
		selectedIso3 = selectedIso3 === iso3 ? null : iso3;
	}
</script>

<svelte:head>
	<title>Sourcing Compliance & Footprint — Vector10</title>
	<meta
		name="description"
		content="Footprint and 2026 regulatory exposure — CSRD, CBAM, EPR and Digital Product Passports — across 43 textile sourcing countries, with an interactive sourcing footprint check."
	/>
</svelte:head>

<div class="sustainability-page">
	<SustainabilityHero countryCount={countries.length} />

	<div class="stats-bar">
		<StatCard label="Countries" value={String(filtered.length)} subtitle="Sourcing countries mapped" />
		<StatCard label="High Compliance Risk" value={String(highRiskCount)} subtitle="Risk score ≥ 60/100" />
		<StatCard
			label="Cleanest Grid"
			value={cleanestGrid.country}
			subtitle={cleanestGrid.gridCarbonIntensity + ' gCO₂/kWh'}
		/>
		<StatCard label="Median Footprint" value={medianFootprint + '/100'} subtitle="Higher = cleaner" />
	</div>

	<RegionFilter regions={allRegions} selected={selectedRegion} onChange={(r) => (selectedRegion = r)} />

	<div class="viz-container card">
		<h3 class="section-title">Footprint vs. compliance risk</h3>
		<p class="section-subtitle">
			Bubble size = share of textile exports going to the EU · click a country for detail
		</p>
		<RiskQuadrantChart data={filtered} onSelect={selectCountry} />
	</div>

	{#if selectedCountry}
		<CountryDetailPanel
			country={selectedCountry}
			all={countries}
			sources={data.dataset.sources}
			onClose={() => (selectedIso3 = null)}
		/>
	{/if}

	<div class="viz-container card">
		<h3 class="section-title">Compliance risk ranking</h3>
		<p class="section-subtitle">
			CSRD, EPR and CBAM exposure, Digital Product Passport gap, and forced-labor regulation risk
		</p>
		<ComplianceRankingChart data={filtered} onSelect={selectCountry} />
	</div>

	<RegTimeline />

	<FootprintCheck {countries} />

	<SustainabilityTable countries={filtered} {selectedIso3} onSelect={selectCountry} />

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
	}
</style>
