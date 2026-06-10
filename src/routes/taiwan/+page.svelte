<script lang="ts">
	import type { PageData } from './$types';
	import type { TaiwanRecord, TaiwanArc } from '$lib/types/taiwan';
	import TaiwanGlobe from '$lib/maps/TaiwanGlobe.svelte';

	let { data }: { data: PageData } = $props();

	const HS_LABELS: Record<string, string> = {
		'50': 'Silk', '51': 'Wool', '52': 'Cotton', '53': 'Veg. Fibres',
		'54': 'Man-made Filaments', '55': 'Staple Fibres', '56': 'Nonwovens & Twine',
		'57': 'Carpets', '58': 'Special Woven', '59': 'Coated Fabrics',
		'60': 'Knitted Fabrics', '61': 'Knit Apparel', '62': 'Woven Apparel', '63': 'Other Articles'
	};

	// ─── Filter state ────────────────────────────────────────────────────────────
	const availableYears = Object.keys(data.data.years).sort();
	let selectedYear = $state<string>(availableYears.at(-1) ?? '2025');
	let direction = $state<'both' | 'Imports' | 'Exports'>('both');
	let hsCode    = $state('all');
	let minValM   = $state(0);          // minimum value in $M
	let topN      = $state(0);          // 0 = all
	let search    = $state('');
	let sortCol   = $state<keyof TaiwanRecord | 'pct'>('value');
	let sortDir   = $state<'asc' | 'desc'>('desc');

	const activeRecords = $derived(data.data.years[selectedYear]?.records ?? []);
	const activeLabel   = $derived(data.data.years[selectedYear]?.label ?? selectedYear);

	// ─── Totals ──────────────────────────────────────────────────────────────────
	const totalExports = $derived(
		activeRecords.filter(r => r.direction === 'Exports').reduce((s, r) => s + r.value, 0)
	);
	const totalImports = $derived(
		activeRecords.filter(r => r.direction === 'Imports').reduce((s, r) => s + r.value, 0)
	);

	// ─── Filtered records (for table) ────────────────────────────────────────────
	let filteredRecords = $derived.by(() => {
		let rows = activeRecords.slice();
		if (direction !== 'both') rows = rows.filter(r => r.direction === direction);
		if (hsCode !== 'all')     rows = rows.filter(r => r.code === hsCode);
		if (search)               rows = rows.filter(r => r.country.toLowerCase().includes(search.toLowerCase()));
		// Add pct
		const withPct = rows.map(r => ({
			...r,
			pct: (r.value / (r.direction === 'Exports' ? totalExports : totalImports)) * 100
		}));
		// Min value filter
		const minVal = minValM * 1_000_000;
		const filtered = minVal > 0 ? withPct.filter(r => r.value >= minVal) : withPct;
		// Sort
		filtered.sort((a, b) => {
			const va = (a as Record<string, unknown>)[sortCol] as number | string ?? 0;
			const vb = (b as Record<string, unknown>)[sortCol] as number | string ?? 0;
			if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb as string) : (vb as string).localeCompare(va);
			return sortDir === 'asc' ? (va as number) - (vb as number) : (vb as number) - (va as number);
		});
		return filtered;
	});

	// ─── Arc data (aggregated by country+direction, for globe) ───────────────────
	let arcData = $derived.by((): TaiwanArc[] => {
		const map = new Map<string, TaiwanArc>();
		for (const r of filteredRecords) {
			const key = `${r.direction}|${r.country}`;
			if (!map.has(key)) {
				map.set(key, { country: r.country, direction: r.direction, value: 0, lat: r.lat, lon: r.lon, subcats: {} });
			}
			const arc = map.get(key)!;
			arc.value += r.value;
			arc.subcats[r.code] = (arc.subcats[r.code] ?? 0) + r.value;
		}
		let arcs = [...map.values()];
		if (topN > 0) {
			arcs.sort((a, b) => b.value - a.value);
			arcs = arcs.slice(0, topN);
		}
		return arcs;
	});

	// ─── Summary stats ───────────────────────────────────────────────────────────
	let visibleExports  = $derived(arcData.filter(a => a.direction === 'Exports').reduce((s, a) => s + a.value, 0));
	let visibleImports  = $derived(arcData.filter(a => a.direction === 'Imports').reduce((s, a) => s + a.value, 0));
	let partnerCount    = $derived(new Set(arcData.map(a => a.country)).size);

	// ─── Hover state (from globe) ─────────────────────────────────────────────────
	let hoveredArc = $state<TaiwanArc | null>(null);

	// ─── Table sort ──────────────────────────────────────────────────────────────
	function setSort(col: typeof sortCol) {
		if (sortCol === col) sortDir = sortDir === 'desc' ? 'asc' : 'desc';
		else { sortCol = col; sortDir = 'desc'; }
	}

	// ─── Formatters ──────────────────────────────────────────────────────────────
	function fmt(v: number): string {
		if (v >= 1e9) return '$' + (v / 1e9).toFixed(2) + 'B';
		if (v >= 1e6) return '$' + (v / 1e6).toFixed(1) + 'M';
		if (v >= 1e3) return '$' + (v / 1e3).toFixed(0) + 'K';
		return '$' + v;
	}
</script>

<svelte:head>
	<title>Taiwan Trade Lens — Vector10</title>
	<meta name="description" content="Taiwan textile trade intelligence: imports and exports by country and HS chapter, Jan–Mar 2026." />
</svelte:head>

<div class="tw-page">

	<!-- Page header -->
	<div class="tw-header">
		<div class="tw-header-left">
			<h1 class="tw-title">Taiwan Trade Lens</h1>
			<p class="tw-subtitle">Textile imports &amp; exports by country · HS 50–63</p>
		</div>
		<div class="tw-header-right">
			<span class="badge period">{activeLabel}</span>
			<span class="badge hs">HS 50 – 63</span>
			<span class="badge note">Taiwan not in UN Comtrade</span>
		</div>
	</div>

	<div class="tw-layout">

		<!-- ── Sidebar ─────────────────────────────────────────────────────── -->
		<aside class="tw-sidebar">

			<!-- Year selector -->
			<div class="ctrl-group">
				<span class="ctrl-label">Year</span>
				<div class="year-toggle">
					{#each availableYears as yr}
						<button
							class="year-btn"
							class:active={selectedYear === yr}
							onclick={() => selectedYear = yr}
						>{yr}</button>
					{/each}
				</div>
			</div>

			<!-- Direction -->
			<div class="ctrl-group">
				<span class="ctrl-label">Direction</span>
				<div class="dir-toggle">
					{#each [['both','Both'],['Exports','Export'],['Imports','Import']] as [val, label]}
						<button
							class="dir-btn"
							class:active={direction === val}
							data-dir={val}
							onclick={() => direction = val as typeof direction}
						>{label}</button>
					{/each}
				</div>
			</div>

			<!-- HS Category -->
			<div class="ctrl-group">
				<span class="ctrl-label">Product Category</span>
				<select class="styled-select" bind:value={hsCode}>
					<option value="all">All Categories</option>
					{#each Object.entries(HS_LABELS) as [code, label]}
						<option value={code}>HS{code} — {label}</option>
					{/each}
				</select>
			</div>

			<!-- Min value -->
			<div class="ctrl-group">
				<span class="ctrl-label">Min. Trade Value</span>
				<div class="slider-row">
					<input type="range" min="0" max="50" step="1" bind:value={minValM} />
					<span class="slider-val">{minValM === 0 ? '$0M' : `$${minValM}M`}</span>
				</div>
			</div>

			<!-- Top N -->
			<div class="ctrl-group">
				<span class="ctrl-label">Top Partners</span>
				<div class="topn-row">
					<button class="topn-btn" onclick={() => { if (topN > 0) topN = topN <= 5 ? 0 : topN - 5; }}>−</button>
					<span class="topn-val">{topN === 0 ? 'All' : topN}</span>
					<button class="topn-btn" onclick={() => { topN = topN === 0 ? 5 : Math.min(topN + 5, 50); }}>+</button>
				</div>
			</div>

			<!-- Search -->
			<div class="ctrl-group">
				<span class="ctrl-label">Search Country</span>
				<input class="search-input" type="text" placeholder="e.g. Vietnam…" bind:value={search} />
			</div>

			<!-- Legend -->
			<div class="ctrl-group">
				<span class="ctrl-label">Key</span>
				<div class="legend">
					<div class="legend-item">
						<div class="legend-line export"></div>
						<span>Exports from Taiwan</span>
					</div>
					<div class="legend-item">
						<div class="legend-line import"></div>
						<span>Imports to Taiwan</span>
					</div>
					<div class="legend-note">Arc thickness = trade value</div>
				</div>
			</div>

			<!-- Summary stats -->
			<div class="ctrl-group">
				<span class="ctrl-label">Summary</span>
				<div class="stats">
					<div class="stat">
						<span class="stat-label">Exports</span>
						<span class="stat-val export">{fmt(visibleExports)}</span>
					</div>
					<div class="stat">
						<span class="stat-label">Imports</span>
						<span class="stat-val import">{fmt(visibleImports)}</span>
					</div>
					<div class="stat">
						<span class="stat-label">Partners</span>
						<span class="stat-val">{partnerCount}</span>
					</div>
				</div>
			</div>

		</aside>

		<!-- ── Main content ──────────────────────────────────────────────── -->
		<div class="tw-main">

			<!-- Globe -->
			<TaiwanGlobe
				arcs={arcData}
				{totalExports}
				{totalImports}
				onHover={arc => hoveredArc = arc}
				height="520px"
				geojson={data.geojson}
			/>

			<!-- Table -->
			<div class="table-wrap">
				<div class="table-header">
					<div>
						<div class="table-title">Trade Detail — {activeLabel}</div>
						<div class="table-count">{filteredRecords.length.toLocaleString()} records · {new Set(filteredRecords.map(r => r.country)).size} countries</div>
					</div>
				</div>

				<div class="table-scroll">
					<table>
						<thead>
							<tr>
								<th onclick={() => setSort('country')} class:sort-asc={sortCol==='country'&&sortDir==='asc'} class:sort-desc={sortCol==='country'&&sortDir==='desc'}>Country</th>
								<th>Direction</th>
								<th onclick={() => setSort('description')} class:sort-asc={sortCol==='description'&&sortDir==='asc'} class:sort-desc={sortCol==='description'&&sortDir==='desc'}>Category</th>
								<th>HS</th>
								<th onclick={() => setSort('value')} class:sort-asc={sortCol==='value'&&sortDir==='asc'} class:sort-desc={sortCol==='value'&&sortDir==='desc'}>Trade Value</th>
								<th onclick={() => setSort('pct')} class:sort-asc={sortCol==='pct'&&sortDir==='asc'} class:sort-desc={sortCol==='pct'&&sortDir==='desc'}>% of Total</th>
							</tr>
						</thead>
						<tbody>
							{#each filteredRecords.slice(0, 500) as row}
								{@const maxV = row.direction === 'Exports'
									? Math.max(...filteredRecords.filter(r=>r.direction==='Exports').map(r=>r.value), 1)
									: Math.max(...filteredRecords.filter(r=>r.direction==='Imports').map(r=>r.value), 1)}
								{@const barW = Math.max(2, Math.round((row.value / maxV) * 100))}
								<tr class:highlighted={hoveredArc?.country === row.country && hoveredArc?.direction === row.direction}>
									<td class="td-country">{row.country}</td>
									<td>
										<span class="dir-badge" class:exp={row.direction==='Exports'} class:imp={row.direction==='Imports'}>
											{row.direction === 'Exports' ? '↗' : '↙'} {row.direction}
										</span>
									</td>
									<td class="td-dim td-desc" title={row.description}>{row.description.length > 38 ? row.description.slice(0,38)+'…' : row.description}</td>
									<td class="td-mono td-dim">HS{row.code}</td>
									<td class="td-mono">
										<div class="bar-cell">
											<div class="bar-bg">
												<div class="bar-fill" class:exp={row.direction==='Exports'} class:imp={row.direction==='Imports'} style:width="{barW}%"></div>
											</div>
											{fmt(row.value)}
										</div>
									</td>
									<td class="td-mono td-dim">{'pct' in row ? (row as typeof row & { pct: number }).pct.toFixed(2) + '%' : '—'}</td>
								</tr>
							{/each}
						</tbody>
					</table>
					{#if filteredRecords.length > 500}
						<div class="table-more">Showing 500 of {filteredRecords.length.toLocaleString()} records. Use filters to narrow results.</div>
					{/if}
				</div>
			</div>

		</div>
	</div>
</div>

<style>
	/* ── Page wrapper ──────────────────────────────────────────────────────────── */
	.tw-page {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
		min-height: calc(100vh - var(--nav-height));
	}

	/* ── Header ──────────────────────────────────────────────────────────────── */
	.tw-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-4);
		flex-wrap: wrap;
	}

	.tw-title {
		font-size: var(--text-2xl);
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--text-primary);
		margin: 0;
	}

	.tw-subtitle {
		font-size: var(--text-sm);
		color: var(--text-tertiary);
		margin: var(--space-1) 0 0;
	}

	.tw-header-right {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.badge {
		font-size: 10px;
		font-weight: 600;
		letter-spacing: 0.07em;
		text-transform: uppercase;
		padding: 3px 10px;
		border-radius: var(--radius-full);
	}

	.badge.period {
		background: color-mix(in srgb, #00d4ff 8%, transparent);
		color: #00d4ff;
		border: 1px solid rgba(0, 212, 255, 0.25);
	}

	.badge.hs {
		background: var(--bg-tertiary);
		color: var(--text-tertiary);
		border: 1px solid var(--border-default);
	}

	.badge.note {
		background: color-mix(in srgb, var(--accent-primary) 8%, transparent);
		color: var(--text-tertiary);
		border: 1px solid var(--border-subtle);
		font-weight: 400;
		text-transform: none;
		font-size: 11px;
		letter-spacing: 0;
	}

	/* ── Layout: sidebar + main ───────────────────────────────────────────────── */
	.tw-layout {
		display: grid;
		grid-template-columns: 232px 1fr;
		gap: var(--space-6);
		align-items: start;
	}

	/* ── Sidebar ──────────────────────────────────────────────────────────────── */
	.tw-sidebar {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
		position: sticky;
		top: calc(var(--nav-height) + var(--space-4));
		max-height: calc(100vh - var(--nav-height) - var(--space-8));
		overflow-y: auto;
	}

	.ctrl-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.ctrl-label {
		font-size: 9.5px;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--text-tertiary);
	}

	/* Year toggle */
	.year-toggle {
		display: flex;
		gap: 4px;
	}

	.year-btn {
		flex: 1;
		padding: 6px 4px;
		border-radius: var(--radius-md);
		border: 1px solid var(--border-default);
		background: transparent;
		font-family: var(--font-mono);
		font-size: 11px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s;
		color: var(--text-secondary);
	}

	.year-btn.active {
		background: color-mix(in srgb, var(--accent-primary) 10%, transparent);
		border-color: var(--accent-primary);
		color: var(--accent-primary);
	}

	/* Direction toggle */
	.dir-toggle {
		display: flex;
		gap: 4px;
	}

	.dir-btn {
		flex: 1;
		padding: 6px 4px;
		border-radius: var(--radius-md);
		border: 1px solid var(--border-default);
		background: transparent;
		font-family: var(--font-body);
		font-size: 11px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s;
		color: var(--text-secondary);
	}

	.dir-btn[data-dir="Exports"].active {
		background: rgba(0, 212, 255, 0.1);
		border-color: #00d4ff;
		color: #00d4ff;
		box-shadow: 0 0 8px rgba(0, 212, 255, 0.15);
	}

	.dir-btn[data-dir="Imports"].active {
		background: rgba(255, 107, 53, 0.1);
		border-color: #ff6b35;
		color: #ff6b35;
		box-shadow: 0 0 8px rgba(255, 107, 53, 0.15);
	}

	.dir-btn[data-dir="both"].active {
		background: var(--bg-tertiary);
		border-color: var(--border-strong);
		color: var(--text-primary);
	}

	.styled-select {
		appearance: none;
		background: var(--bg-secondary);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-md);
		color: var(--text-primary);
		font-family: var(--font-body);
		font-size: 11px;
		padding: 7px 28px 7px 10px;
		cursor: pointer;
		width: 100%;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='7' viewBox='0 0 10 7'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236b7280' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 9px center;
	}

	.styled-select:focus { outline: none; border-color: var(--border-strong); }

	/* Min value slider */
	.slider-row {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.slider-row input[type="range"] {
		flex: 1;
		accent-color: #00d4ff;
		cursor: pointer;
		height: 3px;
	}

	.slider-val {
		font-family: var(--font-mono);
		font-size: 10px;
		color: #00d4ff;
		min-width: 40px;
		text-align: right;
	}

	/* Top N */
	.topn-row {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.topn-btn {
		width: 28px;
		height: 26px;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border-default);
		background: transparent;
		color: var(--text-secondary);
		font-size: 14px;
		cursor: pointer;
		transition: all 0.15s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.topn-btn:hover { border-color: var(--border-strong); color: var(--text-primary); }

	.topn-val {
		font-family: var(--font-mono);
		font-size: 14px;
		color: var(--text-primary);
		min-width: 28px;
		text-align: center;
	}

	/* Search */
	.search-input {
		background: var(--bg-secondary);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-md);
		color: var(--text-primary);
		font-family: var(--font-body);
		font-size: 11px;
		padding: 7px 10px;
		width: 100%;
		transition: border-color 0.15s;
	}

	.search-input::placeholder { color: var(--text-tertiary); }
	.search-input:focus { outline: none; border-color: var(--border-strong); }

	/* Legend */
	.legend {
		padding: var(--space-3);
		background: var(--bg-secondary);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: 11px;
		color: var(--text-secondary);
	}

	.legend-line {
		width: 24px;
		height: 3px;
		border-radius: 2px;
		flex-shrink: 0;
	}

	.legend-line.export { background: #00d4ff; box-shadow: 0 0 6px #00d4ff; }
	.legend-line.import { background: #ff6b35; box-shadow: 0 0 6px #ff6b35; }

	.legend-note {
		font-size: 10px;
		color: var(--text-tertiary);
		font-style: italic;
	}

	/* Stats */
	.stats {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.stat {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 7px 10px;
		background: var(--bg-secondary);
		border-radius: var(--radius-md);
		border: 1px solid var(--border-subtle);
	}

	.stat-label {
		font-size: 9.5px;
		color: var(--text-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.stat-val {
		font-family: var(--font-mono);
		font-size: 12px;
		color: var(--text-primary);
	}

	.stat-val.export { color: #00d4ff; }
	.stat-val.import { color: #ff6b35; }

	/* ── Main content ─────────────────────────────────────────────────────────── */
	.tw-main {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
		min-width: 0;
	}

	/* ── Table ────────────────────────────────────────────────────────────────── */
	.table-wrap {
		background: var(--bg-card);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-lg);
		overflow: hidden;
	}

	.table-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-4) var(--space-5);
		border-bottom: 1px solid var(--border-subtle);
	}

	.table-title {
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--text-primary);
	}

	.table-count {
		font-size: var(--text-xs);
		color: var(--text-tertiary);
		font-family: var(--font-mono);
		margin-top: 2px;
	}

	.table-scroll {
		overflow-x: auto;
		max-height: 480px;
		overflow-y: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 11.5px;
		min-width: 680px;
	}

	thead {
		position: sticky;
		top: 0;
		z-index: 2;
		background: var(--bg-secondary);
	}

	thead tr { border-bottom: 1px solid var(--border-strong); }

	th {
		padding: 9px 12px;
		text-align: left;
		font-size: 9.5px;
		font-weight: 700;
		letter-spacing: 0.09em;
		text-transform: uppercase;
		color: var(--text-tertiary);
		cursor: pointer;
		user-select: none;
		white-space: nowrap;
		transition: color 0.15s;
	}

	th:hover { color: var(--text-primary); }
	th.sort-asc::after  { content: ' ↑'; color: #00d4ff; }
	th.sort-desc::after { content: ' ↓'; color: #00d4ff; }

	tbody tr {
		border-bottom: 1px solid var(--border-subtle);
		transition: background 0.1s;
	}

	tbody tr:hover { background: var(--bg-secondary); }
	tbody tr.highlighted { background: color-mix(in srgb, #00d4ff 5%, transparent); }

	td { padding: 8px 12px; color: var(--text-primary); white-space: nowrap; }
	td.td-dim { color: var(--text-secondary); }
	td.td-mono { font-family: var(--font-mono); }
	td.td-desc { max-width: 220px; overflow: hidden; text-overflow: ellipsis; }
	td.td-country { font-weight: 500; }

	.dir-badge {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		padding: 2px 8px;
		border-radius: var(--radius-full);
		font-size: 9.5px;
		font-weight: 600;
	}

	.dir-badge.exp { background: rgba(0, 212, 255, 0.1); color: #00d4ff; }
	.dir-badge.imp { background: rgba(255, 107, 53, 0.1); color: #ff6b35; }

	.bar-cell {
		display: flex;
		align-items: center;
		gap: 7px;
	}

	.bar-bg {
		width: 80px;
		height: 3px;
		background: rgba(255, 255, 255, 0.06);
		border-radius: 2px;
		flex-shrink: 0;
	}

	.bar-fill {
		height: 100%;
		border-radius: 2px;
		transition: width 0.3s;
	}

	.bar-fill.exp { background: #00d4ff; box-shadow: 0 0 4px rgba(0, 212, 255, 0.5); }
	.bar-fill.imp { background: #ff6b35; box-shadow: 0 0 4px rgba(255, 107, 53, 0.5); }

	.table-more {
		padding: var(--space-3) var(--space-5);
		font-size: var(--text-xs);
		color: var(--text-tertiary);
		text-align: center;
		border-top: 1px solid var(--border-subtle);
	}

	/* ── Mobile ───────────────────────────────────────────────────────────────── */
	@media (max-width: 900px) {
		.tw-layout {
			grid-template-columns: 1fr;
		}

		.tw-sidebar {
			position: static;
			max-height: none;
			overflow: visible;
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
			gap: var(--space-4);
		}
	}

	@media (max-width: 600px) {
		.tw-header { flex-direction: column; }
		.tw-sidebar { grid-template-columns: 1fr 1fr; }
		.badge.note { display: none; }
	}
</style>
