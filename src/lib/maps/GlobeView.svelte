<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { isDark } from '$lib/stores/theme';
	import { get } from 'svelte/store';
	import type { ArcFlow } from '$lib/types/trade';
	import { HS_CHAPTER_LABELS, type HSChapter } from '$lib/types/trade';
	import { formatTradeValue } from '$lib/data/transforms';

	interface Props {
		arcs: ArcFlow[];
		height?: string;
		onCountryClick?: (iso3: string) => void;
		onRefresh?: () => void;
	}

	let { arcs, height = '600px', onCountryClick, onRefresh }: Props = $props();

	let container: HTMLDivElement;
	let map: any = null;
	let deckOverlay: any = null;

	const CHAPTER_COLORS: Record<string, [number, number, number]> = {
		'50': [245, 166, 35],   // Silk — V10 gold
		'51': [201, 169, 110],  // Wool — warm tan
		'52': [232, 213, 168],  // Cotton — cream
		'53': [90, 158, 111],   // Vegetable — green
		'54': [72, 127, 132],   // Filaments — V10 teal
		'55': [95, 89, 126],    // Staple — V10 purple
		'56': [136, 153, 166],  // Nonwovens — slate
		'57': [219, 81, 17],    // Carpets — V10 coral
		'58': [224, 135, 74],   // Special — amber
		'59': [58, 125, 117],   // Coated — dark teal
		'60': [196, 122, 155],  // Knitted — muted rose
		'61': [214, 93, 122],   // Knit Apparel — rose
		'62': [110, 106, 170],  // Woven Apparel — soft indigo
		'63': [107, 125, 141]   // Other — blue-gray
	};

	function getArcColor(hsChapter: string): [number, number, number, number] {
		const rgb = CHAPTER_COLORS[hsChapter] ?? [100, 100, 100];
		return [...rgb, 180] as [number, number, number, number];
	}

	function getArcWidth(tradeValue: number): number {
		// Scale width from 1 to 8 based on trade value
		const minVal = 1e8;    // $100M
		const maxVal = 2e10;   // $20B
		const clamped = Math.max(minVal, Math.min(maxVal, tradeValue));
		const normalized = (Math.log(clamped) - Math.log(minVal)) / (Math.log(maxVal) - Math.log(minVal));
		return 1 + normalized * 7;
	}

	async function initMap() {
		const maplibregl = await import('maplibre-gl');
		await import('maplibre-gl/dist/maplibre-gl.css');
		const { MapboxOverlay } = await import('@deck.gl/mapbox');
		const { ArcLayer } = await import('@deck.gl/layers');

		const darkStyle = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
		const lightStyle = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

		// @ts-expect-error — MapLibre 5 supports 'projection' but types lag behind
		map = new maplibregl.Map({
			container,
			style: get(isDark) ? darkStyle : lightStyle,
			center: [30, 20],
			zoom: 1.5,
			projection: 'globe',
			antialias: true,
			scrollZoom: false
		});

		// Only enable scroll zoom when user clicks the map
		map.on('click', () => {
			map.scrollZoom.enable();
		});

		// Disable again when mouse leaves
		container.addEventListener('mouseleave', () => {
			map?.scrollZoom.disable();
		});

		const arcLayer = new ArcLayer({
			id: 'trade-arcs',
			data: arcs,
			getSourcePosition: (d: ArcFlow) => [d.source.longitude, d.source.latitude],
			getTargetPosition: (d: ArcFlow) => [d.target.longitude, d.target.latitude],
			getSourceColor: (d: ArcFlow) => getArcColor(d.hsChapter),
			getTargetColor: (d: ArcFlow) => getArcColor(d.hsChapter),
			getWidth: (d: ArcFlow) => getArcWidth(d.tradeValue),
			greatCircle: true,
			numSegments: 50,
			pickable: true
		});

		deckOverlay = new MapboxOverlay({
			layers: [arcLayer],
			getTooltip: ({object}: {object?: ArcFlow}) => {
				if (!object) return null;
				const label = HS_CHAPTER_LABELS[object.hsChapter as HSChapter] ?? object.hsChapter;
				return {
					html: `<b>${object.source.name} → ${object.target.name}</b><br/>${label}<br/>${formatTradeValue(object.tradeValue)}`,
					style: {
						backgroundColor: 'rgba(22,18,29,0.9)',
						color: '#e8ecf0',
						fontSize: '12px',
						fontFamily: 'Inter, sans-serif',
						padding: '8px 12px',
						borderRadius: '6px',
						border: '1px solid rgba(255,255,255,0.1)'
					}
				};
			}
		});

		map.addControl(deckOverlay);
		map.addControl(new maplibregl.NavigationControl(), 'top-right');
	}

	async function updateArcs() {
		if (!deckOverlay) return;

		const { ArcLayer } = await import('@deck.gl/layers');
		deckOverlay.setProps({
			layers: [
				new ArcLayer({
					id: 'trade-arcs',
					data: arcs,
					getSourcePosition: (d: ArcFlow) => [d.source.longitude, d.source.latitude],
					getTargetPosition: (d: ArcFlow) => [d.target.longitude, d.target.latitude],
					getSourceColor: (d: ArcFlow) => getArcColor(d.hsChapter),
					getTargetColor: (d: ArcFlow) => getArcColor(d.hsChapter),
					getWidth: (d: ArcFlow) => getArcWidth(d.tradeValue),
					greatCircle: true,
					numSegments: 50,
					pickable: true
				})
			]
		});
	}

	onMount(() => {
		initMap();
	});

	onDestroy(() => {
		map?.remove();
	});

	$effect(() => {
		if (deckOverlay && arcs) updateArcs();
	});
</script>

<div class="globe-wrapper">
	<div bind:this={container} class="globe-container" style:height></div>

	<div class="scroll-hint">Click map to enable zoom, move mouse away to scroll page</div>

	<button class="refresh-btn" onclick={() => updateArcs()} title="Refresh map arcs">
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
			<path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
		</svg>
		Refresh
	</button>

	<!-- Legend -->
	<div class="legend">
		<div class="legend-title">Product Categories</div>
		{#each Object.entries(CHAPTER_COLORS) as [code, rgb]}
			<div class="legend-item">
				<span
					class="legend-color"
					style:background="rgb({rgb[0]}, {rgb[1]}, {rgb[2]})"
				></span>
				<span class="legend-label">{HS_CHAPTER_LABELS[code as HSChapter]}</span>
			</div>
		{/each}
	</div>
</div>

<style>
	.globe-wrapper {
		position: relative;
		border-radius: var(--radius-lg);
		overflow: hidden;
		border: 1px solid var(--border-default);
	}

	.globe-container {
		width: 100%;
	}

	.scroll-hint {
		position: absolute;
		top: var(--space-3);
		left: 50%;
		transform: translateX(-50%);
		font-size: var(--text-xs);
		color: var(--text-tertiary);
		background: color-mix(in srgb, var(--bg-card) 80%, transparent);
		backdrop-filter: blur(6px);
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-full);
		border: 1px solid var(--border-subtle);
		opacity: 0.7;
		pointer-events: none;
	}

	.refresh-btn {
		position: absolute;
		top: var(--space-3);
		right: 52px;
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		font-size: var(--text-xs);
		font-family: var(--font-body);
		font-weight: 500;
		color: var(--text-primary);
		background: color-mix(in srgb, var(--bg-card) 90%, transparent);
		backdrop-filter: blur(8px);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all var(--transition-fast);
		z-index: 2;
	}

	.refresh-btn:hover {
		background: var(--accent-primary);
		color: white;
		border-color: var(--accent-primary);
	}

	.legend {
		position: absolute;
		bottom: var(--space-4);
		left: var(--space-4);
		background: color-mix(in srgb, var(--bg-card) 90%, transparent);
		backdrop-filter: blur(8px);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-md);
		padding: var(--space-3);
		max-height: 280px;
		overflow-y: auto;
		font-size: var(--text-xs);
	}

	.legend-title {
		font-weight: 600;
		font-size: var(--text-xs);
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: var(--space-2);
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: 2px 0;
	}

	.legend-color {
		display: inline-block;
		width: 10px;
		height: 10px;
		border-radius: 2px;
		flex-shrink: 0;
	}

	.legend-label {
		color: var(--text-secondary);
		white-space: nowrap;
	}
</style>
