<script lang="ts">
	import type { MarketKey } from '$lib/types/sustainability';
	import { MARKET_LABELS } from '$lib/types/sustainability';

	interface Props {
		selected: MarketKey[];
		onChange: (markets: MarketKey[]) => void;
	}

	let { selected, onChange }: Props = $props();

	const ALL_MARKETS: MarketKey[] = ['eu', 'us', 'asia', 'row'];

	function toggle(market: MarketKey) {
		if (selected.includes(market)) {
			if (selected.length === 1) return; // keep at least one market
			onChange(selected.filter((m) => m !== market));
		} else {
			onChange([...selected, market]);
		}
	}
</script>

<div class="market-bar">
	<span class="market-label">Where do you sell?</span>
	<div class="toggle-group">
		{#each ALL_MARKETS as market (market)}
			<button
				class="toggle-btn"
				class:active={selected.includes(market)}
				onclick={() => toggle(market)}
			>
				{MARKET_LABELS[market]}
			</button>
		{/each}
	</div>
	<span class="market-hint">Risk and cost scores adapt to your selling markets</span>
</div>

<style>
	.market-bar {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-4) var(--space-5);
		background: var(--eco-bg-tint);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-lg);
	}

	.market-label {
		font-size: var(--text-xs);
		font-weight: 600;
		color: var(--text-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		white-space: nowrap;
	}

	.toggle-group {
		display: flex;
		flex-wrap: wrap;
		border: 1px solid var(--border-default);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.toggle-btn {
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
		background: var(--eco-accent);
		color: white;
	}

	.toggle-btn:not(.active):hover {
		background: var(--bg-tertiary);
		color: var(--text-primary);
	}

	.market-hint {
		font-size: var(--text-xs);
		color: var(--text-tertiary);
		font-style: italic;
	}

	@media (max-width: 768px) {
		.market-bar {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-2);
		}
	}
</style>
