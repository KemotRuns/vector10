<script lang="ts">
	import type { CountrySustainability, MarketKey } from '$lib/types/sustainability';
	import { MARKET_LABELS } from '$lib/types/sustainability';
	import { PRODUCT_CATEGORIES, type ProductCategory } from '$lib/data/productCategories';
	import { estimateFootprint } from '$lib/utils/footprintCheck';
	import FootprintCheckResult from './FootprintCheckResult.svelte';

	interface Props {
		countries: CountrySustainability[];
		/** Pre-seeded from the page-level market selector */
		initialMarkets: MarketKey[];
	}

	let { countries, initialMarkets }: Props = $props();

	const ALL_MARKETS: MarketKey[] = ['eu', 'us', 'asia', 'row'];

	let selectedIso3 = $state<string[]>([]);
	// Deliberately a one-time seed: the tool's market choice is independent after first render
	// svelte-ignore state_referenced_locally
	let selectedMarkets = $state<MarketKey[]>([...initialMarkets]);
	let categoryId = $state<string>('');
	let query = $state('');

	let sortedCountries = $derived([...countries].sort((a, b) => a.country.localeCompare(b.country)));
	let matches = $derived(
		query.length === 0
			? sortedCountries
			: sortedCountries.filter((c) => c.country.toLowerCase().includes(query.toLowerCase()))
	);

	let selected = $derived(countries.filter((c) => selectedIso3.includes(c.iso3)));
	let category = $derived<ProductCategory | undefined>(
		PRODUCT_CATEGORIES.find((c) => c.id === categoryId)
	);
	let estimate = $derived(
		selected.length > 0 && category && selectedMarkets.length > 0
			? estimateFootprint(selected, category, selectedMarkets, countries)
			: null
	);

	function toggleCountry(iso3: string) {
		selectedIso3 = selectedIso3.includes(iso3)
			? selectedIso3.filter((c) => c !== iso3)
			: [...selectedIso3, iso3];
	}

	function toggleMarket(market: MarketKey) {
		if (selectedMarkets.includes(market)) {
			if (selectedMarkets.length === 1) return;
			selectedMarkets = selectedMarkets.filter((m) => m !== market);
		} else {
			selectedMarkets = [...selectedMarkets, market];
		}
	}
</script>

<div class="check card">
	<div class="check-header">
		<h3 class="check-title">Where do you stand?</h3>
		<p class="check-sub">
			Pick your sourcing countries, selling markets and product category for a directional
			footprint, cost and compliance profile — in 30 seconds, no email required.
		</p>
	</div>

	<div class="step">
		<span class="step-label">1 · Where do you source?</span>
		<input
			class="search"
			type="search"
			placeholder="Search countries…"
			bind:value={query}
			aria-label="Search sourcing countries"
		/>
		<div class="country-chips">
			{#each matches as c (c.iso3)}
				<button
					class="chip"
					class:selected={selectedIso3.includes(c.iso3)}
					onclick={() => toggleCountry(c.iso3)}
				>
					{c.country}
				</button>
			{/each}
		</div>
	</div>

	<div class="step">
		<span class="step-label">2 · Where do you sell?</span>
		<div class="category-btns">
			{#each ALL_MARKETS as market (market)}
				<button
					class="chip market-chip"
					class:selected={selectedMarkets.includes(market)}
					onclick={() => toggleMarket(market)}
				>
					{MARKET_LABELS[market]}
				</button>
			{/each}
		</div>
	</div>

	<div class="step">
		<span class="step-label">3 · What do you make?</span>
		<div class="category-btns">
			{#each PRODUCT_CATEGORIES as cat (cat.id)}
				<button
					class="cat-btn"
					class:selected={categoryId === cat.id}
					onclick={() => (categoryId = cat.id)}
				>
					{cat.label}
					{#if cat.hsChapters.length > 0}
						<span class="hs">HS {cat.hsChapters.join(', ')}</span>
					{/if}
				</button>
			{/each}
		</div>
	</div>

	{#if estimate && category}
		<FootprintCheckResult {estimate} {selected} {category} markets={selectedMarkets} />
	{:else}
		<p class="empty-hint">
			{selected.length === 0
				? 'Select at least one sourcing country to see your profile.'
				: 'Now pick a product category.'}
		</p>
	{/if}
</div>

<style>
	.check {
		padding: var(--space-6);
		border-radius: var(--radius-xl);
		background: var(--eco-bg-tint);
		border: 2px solid var(--eco-secondary);
	}

	.check-header {
		margin-bottom: var(--space-5);
	}

	.check-title {
		font-size: var(--text-xl);
		font-weight: 700;
		color: var(--eco-primary);
	}

	:global([data-theme='dark']) .check-title {
		color: var(--eco-secondary);
	}

	.check-sub {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		margin-top: var(--space-1);
		max-width: 560px;
	}

	.step {
		margin-bottom: var(--space-5);
	}

	.step-label {
		display: block;
		font-size: var(--text-xs);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-tertiary);
		margin-bottom: var(--space-2);
	}

	.search {
		width: 100%;
		max-width: 320px;
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-md);
		background: var(--bg-primary);
		color: var(--text-primary);
		font-size: var(--text-sm);
		font-family: var(--font-body);
		margin-bottom: var(--space-3);
	}

	.country-chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		max-height: 160px;
		overflow-y: auto;
	}

	.chip {
		padding: var(--space-1) var(--space-3);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-full);
		background: var(--bg-primary);
		color: var(--text-secondary);
		font-size: var(--text-xs);
		font-family: var(--font-body);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.chip:hover {
		border-color: var(--eco-secondary);
		color: var(--text-primary);
	}

	.chip.selected {
		background: var(--eco-primary);
		border-color: var(--eco-primary);
		color: white;
	}

	.market-chip {
		font-size: var(--text-sm);
		padding: var(--space-2) var(--space-3);
	}

	.market-chip.selected {
		background: var(--eco-accent);
		border-color: var(--eco-accent);
	}

	.category-btns {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.cat-btn {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 2px;
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-md);
		background: var(--bg-primary);
		color: var(--text-primary);
		font-size: var(--text-sm);
		font-family: var(--font-body);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.cat-btn:hover {
		border-color: var(--eco-secondary);
	}

	.cat-btn.selected {
		background: var(--eco-primary);
		border-color: var(--eco-primary);
		color: white;
	}

	.hs {
		font-size: 10px;
		font-family: var(--font-mono);
		opacity: 0.7;
	}

	.empty-hint {
		font-size: var(--text-sm);
		color: var(--text-tertiary);
		font-style: italic;
	}
</style>
