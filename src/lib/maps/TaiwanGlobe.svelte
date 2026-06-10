<script lang="ts">
	import { onMount } from 'svelte';
	import { geoOrthographic } from 'd3-geo';
	import { feature } from 'topojson-client';
	import { Chart, GeoPath, GeoPoint, GeoVisible, Graticule, Svg } from 'layerchart';
	import type { TransformContext } from 'layerchart';
	import type { TaiwanArc } from '$lib/types/taiwan';

	interface Props {
		arcs: TaiwanArc[];
		totalExports: number;
		totalImports: number;
		onHover?: (arc: TaiwanArc | null) => void;
		height?: string;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		geojson: any;
	}

	let { arcs, totalExports, totalImports, onHover, height = '540px', geojson }: Props = $props();

	const TAIWAN: [number, number] = [120.96, 23.7];
	const EXPORT_COLOR = '#00d4ff';
	const IMPORT_COLOR = '#ff6b35';

	const countries = $derived(feature(geojson, geojson.objects.countries));

	let transformContext = $state<TransformContext | undefined>(undefined);

	onMount(() => {
		// Center globe on Taiwan on first render
		transformContext?.setTranslate({ x: -TAIWAN[0], y: -TAIWAN[1] });
	});

	function arcWidth(value: number): number {
		const minV = 10_000;
		const maxV = 500_000_000;
		const clamped = Math.max(minV, Math.min(maxV, value));
		const t = (Math.log(clamped) - Math.log(minV)) / (Math.log(maxV) - Math.log(minV));
		return 0.5 + t * 5.5;
	}

	function fmt(v: number): string {
		if (v >= 1e9) return '$' + (v / 1e9).toFixed(2) + 'B';
		if (v >= 1e6) return '$' + (v / 1e6).toFixed(1) + 'M';
		if (v >= 1e3) return '$' + (v / 1e3).toFixed(0) + 'K';
		return '$' + v;
	}

	let tooltipArc = $state<TaiwanArc | null>(null);
	let tooltipX = $state(0);
	let tooltipY = $state(0);

	function onArcHover(e: PointerEvent, arc: TaiwanArc) {
		tooltipArc = arc;
		tooltipX = e.clientX + 14;
		tooltipY = e.clientY - 10;
		onHover?.(arc);
	}

	function onArcLeave() {
		tooltipArc = null;
		onHover?.(null);
	}
</script>

<div class="globe-wrap" style:height>
	<div class="chart-fill">
		<Chart
			geo={{
				projection: geoOrthographic,
				fitGeojson: countries,
				applyTransform: ['rotate']
			}}
			bind:transformContext
		>
			<Svg>
				<!-- Ocean sphere -->
				<GeoPath
					geojson={{ type: 'Sphere' }}
					fill="#060b18"
					stroke="rgba(0,180,255,0.18)"
					strokeWidth={0.6}
				/>
				<!-- Grid lines -->
				<Graticule stroke="rgba(255,255,255,0.05)" strokeWidth={0.5} />
				<!-- Countries -->
				<GeoPath
					geojson={countries}
					fill="#0d2137"
					stroke="rgba(255,255,255,0.14)"
					strokeWidth={0.5}
				/>

				<!-- Trade arcs: exports first, then imports (so imports render on top) -->
				{#each arcs.filter(a => a.direction === 'Exports') as arc (arc.country + '-' + arc.direction)}
					<GeoPath
						geojson={{ type: 'LineString', coordinates: [TAIWAN, [arc.lon, arc.lat]] }}
						fill="none"
						stroke={EXPORT_COLOR}
						strokeWidth={arcWidth(arc.value)}
						class="arc-path"
						onpointermove={(e) => onArcHover(e, arc)}
						onpointerleave={onArcLeave}
					/>
				{/each}
				{#each arcs.filter(a => a.direction === 'Imports') as arc (arc.country + '-' + arc.direction)}
					<GeoPath
						geojson={{ type: 'LineString', coordinates: [TAIWAN, [arc.lon, arc.lat]] }}
						fill="none"
						stroke={IMPORT_COLOR}
						strokeWidth={arcWidth(arc.value)}
						class="arc-path"
						onpointermove={(e) => onArcHover(e, arc)}
						onpointerleave={onArcLeave}
					/>
				{/each}

				<!-- Partner country dots (only visible hemisphere) -->
				{#each arcs as arc (arc.country + '-' + arc.direction + '-dot')}
					<GeoVisible lat={arc.lat} long={arc.lon}>
						<GeoPoint lat={arc.lat} long={arc.lon}>
							<circle
								r={3}
								fill={arc.direction === 'Exports' ? EXPORT_COLOR : IMPORT_COLOR}
								opacity={0.85}
							/>
						</GeoPoint>
					</GeoVisible>
				{/each}

				<!-- Taiwan origin marker -->
				<GeoPoint lat={TAIWAN[1]} long={TAIWAN[0]}>
					<circle r={6} fill="#00d4ff" stroke="white" stroke-width="1.5" />
					<circle r={10} fill="none" stroke="#00d4ff" stroke-width="1" opacity="0.4" />
				</GeoPoint>
			</Svg>
		</Chart>
	</div>

	<!-- Custom tooltip rendered at cursor position -->
	{#if tooltipArc}
		{@const dir = tooltipArc.direction === 'Exports' ? '↗ Export from Taiwan' : '↙ Import to Taiwan'}
		{@const total = tooltipArc.direction === 'Exports' ? totalExports : totalImports}
		{@const pct = total > 0 ? ((tooltipArc.value / total) * 100).toFixed(1) : '—'}
		{@const topSubs = Object.entries(tooltipArc.subcats)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 3)}
		<div class="tooltip" style:left="{tooltipX}px" style:top="{tooltipY}px">
			<div class="tt-country">{tooltipArc.country}</div>
			<div class="tt-dir" class:exp={tooltipArc.direction === 'Exports'} class:imp={tooltipArc.direction === 'Imports'}>{dir}</div>
			<div class="tt-row"><span>Total Value</span><span>{fmt(tooltipArc.value)}</span></div>
			<div class="tt-row"><span>% of {tooltipArc.direction}</span><span>{pct}%</span></div>
			{#if topSubs.length > 0}
				<div class="tt-subs">
					{#each topSubs as [code, val]}
						<div class="tt-sub"><span>HS{code}</span><span>{fmt(val)}</span></div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	<div class="globe-hint">Drag to rotate · Scroll to zoom</div>
	<div class="taiwan-label">🟦 Taiwan</div>
</div>

<style>
	.globe-wrap {
		position: relative;
		border-radius: var(--radius-lg);
		overflow: hidden;
		border: 1px solid rgba(0, 180, 255, 0.12);
		background: #060b18;
	}

	.chart-fill {
		position: absolute;
		inset: 0;
	}

	/* Make layercake container fill its parent */
	.chart-fill :global(.layercake-container) {
		height: 100% !important;
	}

	/* Arc hover effect */
	.chart-fill :global(.arc-path) {
		cursor: pointer;
		opacity: 0.75;
		transition: opacity 0.15s;
	}

	.chart-fill :global(.arc-path:hover) {
		opacity: 1;
	}

	/* Tooltip */
	.tooltip {
		position: fixed;
		z-index: 200;
		background: rgba(6, 11, 24, 0.97);
		color: #d4e8ff;
		font-size: 12px;
		font-family: Inter, sans-serif;
		padding: 12px 15px;
		border-radius: 10px;
		border: 1px solid rgba(0, 180, 255, 0.22);
		min-width: 200px;
		line-height: 1.6;
		backdrop-filter: blur(12px);
		pointer-events: none;
	}

	.tt-country {
		font-size: 14px;
		font-weight: 600;
		margin-bottom: 2px;
	}

	.tt-dir {
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.09em;
		margin-bottom: 8px;
	}

	.tt-dir.exp { color: #00d4ff; }
	.tt-dir.imp { color: #ff6b35; }

	.tt-row {
		display: flex;
		justify-content: space-between;
		gap: 16px;
		font-size: 11px;
		padding: 2px 0;
		border-bottom: 1px solid rgba(0, 120, 200, 0.12);
	}

	.tt-subs {
		margin-top: 6px;
	}

	.tt-sub {
		display: flex;
		justify-content: space-between;
		font-size: 10px;
		padding: 1px 0;
		color: #6a8aaa;
	}

	/* Overlay labels */
	.globe-hint {
		position: absolute;
		bottom: var(--space-3);
		left: 50%;
		transform: translateX(-50%);
		font-size: var(--text-xs);
		color: rgba(106, 138, 170, 0.8);
		background: rgba(6, 11, 24, 0.85);
		backdrop-filter: blur(6px);
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-full);
		border: 1px solid rgba(0, 180, 255, 0.1);
		pointer-events: none;
		white-space: nowrap;
	}

	.taiwan-label {
		position: absolute;
		top: var(--space-3);
		left: var(--space-4);
		font-size: 11px;
		font-weight: 600;
		color: #00d4ff;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(6px);
		padding: 4px 10px;
		border-radius: var(--radius-full);
		border: 1px solid rgba(0, 212, 255, 0.3);
		pointer-events: none;
		letter-spacing: 0.04em;
	}
</style>
