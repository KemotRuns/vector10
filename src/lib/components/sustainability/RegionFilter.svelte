<script lang="ts">
	import type { ProducerRegion } from '$lib/types/sustainability';
	import { REGION_COLORS } from '$lib/types/sustainability';

	interface Props {
		regions: ProducerRegion[];
		selected: ProducerRegion | '';
		onChange: (region: ProducerRegion | '') => void;
	}

	let { regions, selected, onChange }: Props = $props();
</script>

<div class="filter-bar">
	<span class="filter-label">Region</span>
	<div class="toggle-group">
		<button class="toggle-btn" class:active={selected === ''} onclick={() => onChange('')}>All</button>
		{#each regions as region (region)}
			<button class="toggle-btn" class:active={selected === region} onclick={() => onChange(region)}>
				<span class="region-dot" style:background={REGION_COLORS[region]}></span>
				{region}
			</button>
		{/each}
	</div>
</div>

<style>
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

	@media (max-width: 768px) {
		.filter-bar {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
