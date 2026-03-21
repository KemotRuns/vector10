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

	<div class="filter-group chapters-group">
		<div class="filter-label-row">
			<span class="filter-label">HS Chapters</span>
			<div class="filter-actions">
				<button class="link-btn" onclick={selectAllChapters}>All</button>
				<button class="link-btn" onclick={clearChapters}>None</button>
			</div>
		</div>
		<div class="chapter-chips">
			{#each allChapters as ch}
				<button
					class="chip"
					class:selected={selectedChapters.includes(ch)}
					onclick={() => toggleChapter(ch)}
					title={HS_CHAPTER_LABELS[ch]}
				>
					{ch}
				</button>
			{/each}
		</div>
	</div>
</div>

<style>
	.filter-panel {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-6);
		padding: var(--space-4) var(--space-6);
		background: var(--bg-card);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-lg);
		align-items: flex-start;
	}

	.filter-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.chapters-group {
		flex: 1;
		min-width: 200px;
	}

	.filter-label {
		font-size: var(--text-xs);
		font-weight: 600;
		color: var(--text-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.filter-label-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
	}

	.filter-actions {
		display: flex;
		gap: var(--space-2);
	}

	.link-btn {
		background: none;
		border: none;
		color: var(--accent-primary);
		font-size: var(--text-xs);
		cursor: pointer;
		padding: 0;
	}

	.link-btn:hover {
		text-decoration: underline;
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

	.chapter-chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1);
	}

	.chip {
		padding: 2px 8px;
		border: 1px solid var(--border-default);
		border-radius: var(--radius-full);
		background: var(--bg-secondary);
		color: var(--text-secondary);
		font-size: var(--text-xs);
		font-family: var(--font-mono);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.chip:hover {
		border-color: var(--accent-primary);
		color: var(--accent-primary);
	}

	.chip.selected {
		background: var(--accent-primary);
		border-color: var(--accent-primary);
		color: white;
	}
</style>
