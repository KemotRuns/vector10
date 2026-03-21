<script lang="ts">
	import { HS_CHAPTER_LABELS, type HSChapter, type TradeDirection } from '$lib/types/trade';

	interface Props {
		year: number;
		availableYears: number[];
		selectedChapters: HSChapter[];
		direction: TradeDirection;
		onYearChange: (year: number) => void;
		onChaptersChange: (chapters: HSChapter[]) => void;
		onDirectionChange: (direction: TradeDirection) => void;
	}

	let {
		year, availableYears, selectedChapters, direction,
		onYearChange, onChaptersChange, onDirectionChange
	}: Props = $props();

	const allChapters = Object.keys(HS_CHAPTER_LABELS) as HSChapter[];

	function toggleChapter(ch: HSChapter) {
		if (selectedChapters.includes(ch)) {
			onChaptersChange(selectedChapters.filter(c => c !== ch));
		} else {
			onChaptersChange([...selectedChapters, ch]);
		}
	}

	function selectAllChapters() {
		onChaptersChange([...allChapters]);
	}

	function clearChapters() {
		onChaptersChange([]);
	}
</script>

<div class="filter-panel">
	<div class="filter-row-top">
		<div class="filter-group">
			<label class="filter-label" for="year-select">Year</label>
			<select
				id="year-select"
				class="filter-select"
				value={year}
				onchange={(e) => onYearChange(Number((e.target as HTMLSelectElement).value))}
			>
				{#each availableYears as y}
					<option value={y}>{y}</option>
				{/each}
			</select>
		</div>

		<div class="filter-group">
			<span class="filter-label">Direction</span>
			<div class="toggle-group">
				<button
					class="toggle-btn"
					class:active={direction === 'export'}
					onclick={() => onDirectionChange('export')}
				>
					Exports
				</button>
				<button
					class="toggle-btn"
					class:active={direction === 'import'}
					onclick={() => onDirectionChange('import')}
				>
					Imports
				</button>
			</div>
		</div>

		<div class="filter-group bulk-actions">
			<span class="filter-label">Products</span>
			<div class="toggle-group">
				<button class="toggle-btn action-btn" onclick={selectAllChapters}>Select All</button>
				<button class="toggle-btn action-btn" onclick={clearChapters}>Clear All</button>
			</div>
		</div>
	</div>

	<div class="products-section">
		<div class="product-chips">
			{#each allChapters as ch}
				<button
					class="product-chip"
					class:selected={selectedChapters.includes(ch)}
					onclick={() => toggleChapter(ch)}
				>
					<span class="product-code">{ch}</span>
					<span class="product-name">{HS_CHAPTER_LABELS[ch]}</span>
				</button>
			{/each}
		</div>
	</div>
</div>

<style>
	.filter-panel {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		padding: var(--space-5) var(--space-6);
		background: var(--bg-card);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-lg);
	}

	.filter-row-top {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-6);
		align-items: flex-end;
	}

	.filter-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.bulk-actions {
		margin-left: auto;
	}

	.filter-label {
		font-size: var(--text-xs);
		font-weight: 600;
		color: var(--text-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.filter-select {
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-md);
		background: var(--bg-secondary);
		color: var(--text-primary);
		font-size: var(--text-sm);
		font-family: var(--font-body);
		cursor: pointer;
	}

	.toggle-group {
		display: flex;
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
		background: var(--accent-primary);
		color: white;
	}

	.action-btn:hover {
		background: var(--bg-tertiary);
		color: var(--text-primary);
	}

	/* Product chips */
	.products-section {
		border-top: 1px solid var(--border-subtle);
		padding-top: var(--space-4);
	}

	.product-chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.product-chip {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-md);
		background: var(--bg-secondary);
		color: var(--text-secondary);
		font-size: var(--text-sm);
		font-family: var(--font-body);
		cursor: pointer;
		transition: all var(--transition-fast);
		white-space: nowrap;
	}

	.product-chip:hover {
		border-color: var(--accent-secondary);
		color: var(--text-primary);
		background: var(--bg-tertiary);
	}

	.product-chip.selected {
		background: var(--accent-primary);
		border-color: var(--accent-primary);
		color: white;
	}

	.product-code {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 600;
		opacity: 0.7;
	}

	.product-name {
		font-weight: 500;
	}

	@media (max-width: 768px) {
		.filter-row-top {
			flex-direction: column;
			align-items: stretch;
			gap: var(--space-3);
		}

		.bulk-actions {
			margin-left: 0;
		}
	}
</style>
