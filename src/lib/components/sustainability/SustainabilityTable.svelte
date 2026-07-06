<script lang="ts">
	import type { ExposureTier } from '$lib/types/sustainability';
	import { REGION_COLORS, TIER_COLORS, TIER_LABELS } from '$lib/types/sustainability';
	import type { MarketView } from '$lib/utils/marketRisk';

	interface Props {
		countries: MarketView[];
		selectedIso3: string | null;
		onSelect: (iso3: string) => void;
	}

	let { countries, selectedIso3, onSelect }: Props = $props();

	type SortKey = 'carbon' | 'water' | 'grid' | 'lowCarbon' | 'dpp' | 'wage' | 'cost' | 'risk' | 'footprint';
	let sortBy = $state<SortKey>('risk');
	let sortAsc = $state(false);

	const keyValue = (c: MarketView, key: SortKey): number => {
		switch (key) {
			case 'carbon':
				return c.carbonPerTon;
			case 'water':
				return c.waterPerKg;
			case 'grid':
				return c.gridCarbonIntensity;
			case 'lowCarbon':
				return c.lowCarbonShare;
			case 'dpp':
				return c.dppReadiness;
			case 'wage':
				return c.laborCostUsd;
			case 'cost':
				return c.costIndex;
			case 'footprint':
				return c.footprintScore;
			default:
				return c.marketRisk;
		}
	};

	let sorted = $derived.by(() => {
		const arr = [...countries];
		arr.sort((a, b) =>
			sortAsc ? keyValue(a, sortBy) - keyValue(b, sortBy) : keyValue(b, sortBy) - keyValue(a, sortBy)
		);
		return arr;
	});

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

{#snippet tierChip(tier: ExposureTier)}
	<span class="tier-chip" style:background="{TIER_COLORS[tier]}20" style:color={TIER_COLORS[tier]}>
		{TIER_LABELS[tier]}
	</span>
{/snippet}

<div class="table-card card">
	<h3 class="section-title">All countries — click a row for detail, headers to sort</h3>
	<p class="table-note">Cost and Risk columns reflect your selected selling markets</p>
	<div class="table-scroll">
		<table class="data-table">
			<thead>
				<tr>
					<th>#</th>
					<th>Country</th>
					<th class="hide-mobile">Region</th>
					<th class="th-right sortable" onclick={() => toggleSort('carbon')}>Carbon{sortIndicator('carbon')}</th>
					<th class="th-right sortable hide-mobile" onclick={() => toggleSort('water')}>Water{sortIndicator('water')}</th>
					<th class="th-right sortable hide-mobile" onclick={() => toggleSort('grid')}>Grid{sortIndicator('grid')}</th>
					<th class="th-right sortable hide-mobile" onclick={() => toggleSort('lowCarbon')}>Low-C %{sortIndicator('lowCarbon')}</th>
					<th class="hide-mobile">CBAM</th>
					<th class="hide-mobile">CSRD</th>
					<th class="hide-mobile">EPR</th>
					<th class="hide-mobile">UFLPA</th>
					<th class="th-right sortable hide-mobile" onclick={() => toggleSort('dpp')}>DPP{sortIndicator('dpp')}</th>
					<th class="th-right sortable hide-mobile" onclick={() => toggleSort('wage')}>Wage $/mo{sortIndicator('wage')}</th>
					<th class="th-right sortable" onclick={() => toggleSort('cost')}>Cost{sortIndicator('cost')}</th>
					<th class="th-right sortable hide-mobile" onclick={() => toggleSort('footprint')}>Footprint{sortIndicator('footprint')}</th>
					<th class="th-right sortable" onclick={() => toggleSort('risk')}>Risk{sortIndicator('risk')}</th>
				</tr>
			</thead>
			<tbody>
				{#each sorted as country, i (country.iso3)}
					<tr
						class:selected={country.iso3 === selectedIso3}
						onclick={() => onSelect(country.iso3)}
					>
						<td class="rank">{i + 1}</td>
						<td class="country-name">{country.country}</td>
						<td class="hide-mobile">
							<span
								class="region-tag"
								style:background="{REGION_COLORS[country.region]}20"
								style:color={REGION_COLORS[country.region]}
							>
								{country.region}
							</span>
						</td>
						<td class="value">{country.carbonPerTon.toLocaleString()}</td>
						<td class="value hide-mobile">{country.waterPerKg}</td>
						<td class="value hide-mobile">{country.gridCarbonIntensity}</td>
						<td class="value hide-mobile">{country.lowCarbonShare}%</td>
						<td class="hide-mobile">{@render tierChip(country.cbamExposure)}</td>
						<td class="hide-mobile">{@render tierChip(country.csrdExposure)}</td>
						<td class="hide-mobile">{@render tierChip(country.eprExposure)}</td>
						<td class="hide-mobile">{@render tierChip(country.uflpaExposure)}</td>
						<td class="value hide-mobile">{country.dppReadiness}</td>
						<td class="value hide-mobile">{country.laborCostUsd.toLocaleString()}</td>
						<td class="value">{country.costIndex}</td>
						<td class="value hide-mobile">{country.footprintScore}</td>
						<td class="value risk-score">{country.marketRisk}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	.table-card {
		border-radius: var(--radius-xl);
	}

	.section-title {
		font-size: var(--text-base);
		font-weight: 600;
		color: var(--eco-primary);
		margin-bottom: var(--space-3);
	}

	:global([data-theme='dark']) .section-title {
		color: var(--eco-secondary);
	}

	.table-note {
		font-size: var(--text-xs);
		color: var(--text-tertiary);
		font-family: var(--font-mono);
		margin-bottom: var(--space-3);
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

	.data-table tbody tr {
		cursor: pointer;
	}

	.data-table tbody tr:hover {
		background: var(--bg-secondary);
	}

	.data-table tbody tr.selected {
		background: var(--eco-bg-tint);
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

	.risk-score {
		font-weight: 700;
		color: var(--eco-primary) !important;
	}

	:global([data-theme='dark']) .risk-score {
		color: var(--eco-secondary) !important;
	}

	.region-tag,
	.tier-chip {
		font-size: var(--text-xs);
		font-weight: 600;
		padding: 2px 8px;
		border-radius: var(--radius-full);
		white-space: nowrap;
	}

	@media (max-width: 768px) {
		.data-table .hide-mobile {
			display: none;
		}
	}
</style>
