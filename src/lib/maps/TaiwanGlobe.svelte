<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { TaiwanArc } from '$lib/types/taiwan';

	interface Props {
		arcs: TaiwanArc[];
		totalExports: number;
		totalImports: number;
		onHover?: (arc: TaiwanArc | null) => void;
		height?: string;
	}

	let { arcs, totalExports, totalImports, onHover, height = '540px' }: Props = $props();

	const TAIWAN = [120.96, 23.70] as [number, number];
	const EXPORT_COLOR: [number, number, number, number] = [0, 212, 255, 210];
	const IMPORT_COLOR: [number, number, number, number] = [255, 107, 53, 210];

	let container: HTMLDivElement;
	let map: any = null;
	let deckOverlay: any = null;

	function arcWidth(value: number): number {
		const minV = 10_000;
		const maxV = 500_000_000;
		const clamped = Math.max(minV, Math.min(maxV, value));
		const t = (Math.log(clamped) - Math.log(minV)) / (Math.log(maxV) - Math.log(minV));
		return 0.5 + t * 5.5;
	}

	function arcColor(direction: 'Imports' | 'Exports'): [number, number, number, number] {
		return direction === 'Exports' ? EXPORT_COLOR : IMPORT_COLOR;
	}

	function makeArcLayer(arcData: TaiwanArc[]) {
		return {
			id: 'taiwan-arcs',
			type: 'ArcLayer',
			data: arcData,
			getSourcePosition: () => TAIWAN,
			getTargetPosition: (d: TaiwanArc) => [d.lon, d.lat] as [number, number],
			getSourceColor: (d: TaiwanArc) => arcColor(d.direction),
			getTargetColor: (d: TaiwanArc) => arcColor(d.direction),
			getWidth: (d: TaiwanArc) => arcWidth(d.value),
			greatCircle: true,
			numSegments: 64,
			pickable: true
		};
	}

	function makeDotsLayer(arcData: TaiwanArc[]) {
		return {
			id: 'taiwan-dots',
			type: 'ScatterplotLayer',
			data: arcData,
			getPosition: (d: TaiwanArc) => [d.lon, d.lat] as [number, number],
			getRadius: 40000,
			getFillColor: (d: TaiwanArc) => arcColor(d.direction),
			pickable: false,
			opacity: 0.9
		};
	}

	function makeTaiwanMarker() {
		return {
			id: 'taiwan-marker',
			type: 'ScatterplotLayer',
			data: [{ pos: TAIWAN }],
			getPosition: (d: { pos: [number, number] }) => d.pos,
			getRadius: 80000,
			getFillColor: [0, 212, 255, 255] as [number, number, number, number],
			stroked: true,
			getLineColor: [255, 255, 255, 200] as [number, number, number, number],
			getLineWidth: 2,
			lineWidthUnits: 'pixels',
			pickable: false
		};
	}

	async function initMap() {
		const maplibregl = await import('maplibre-gl');
		await import('maplibre-gl/dist/maplibre-gl.css');
		const { MapboxOverlay } = await import('@deck.gl/mapbox');
		const { ArcLayer, ScatterplotLayer } = await import('@deck.gl/layers');

		map = new maplibregl.Map({
			container,
			style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
			center: TAIWAN,
			zoom: 1.5,
			// @ts-ignore — MapLibre globe projection
			projection: 'globe',
			antialias: true,
			scrollZoom: false
		});

		map.on('click', () => map.scrollZoom.enable());
		container.addEventListener('mouseleave', () => map?.scrollZoom.disable());

		function buildArcLayer(data: TaiwanArc[]) {
			return new ArcLayer({
				id: 'taiwan-arcs',
				data,
				getSourcePosition: () => TAIWAN,
				getTargetPosition: (d: TaiwanArc) => [d.lon, d.lat] as [number, number],
				getSourceColor: (d: TaiwanArc) => arcColor(d.direction),
				getTargetColor: (d: TaiwanArc) => arcColor(d.direction),
				getWidth: (d: TaiwanArc) => arcWidth(d.value),
				greatCircle: true,
				numSegments: 64,
				pickable: true
			});
		}

		function buildDotsLayer(data: TaiwanArc[]) {
			return new ScatterplotLayer({
				id: 'taiwan-dots',
				data,
				getPosition: (d: TaiwanArc) => [d.lon, d.lat] as [number, number],
				getRadius: 40000,
				getFillColor: (d: TaiwanArc) => arcColor(d.direction),
				pickable: false,
				opacity: 0.9
			});
		}

		function buildMarkerLayer() {
			return new ScatterplotLayer({
				id: 'taiwan-marker',
				data: [{ pos: TAIWAN }],
				getPosition: (d: { pos: [number, number] }) => d.pos,
				getRadius: 80000,
				getFillColor: [0, 212, 255, 255] as [number, number, number, number],
				stroked: true,
				getLineColor: [255, 255, 255, 200] as [number, number, number, number],
				getLineWidth: 2,
				lineWidthUnits: 'pixels' as const,
				pickable: false
			});
		}

		function formatVal(v: number) {
			if (v >= 1e9) return '$' + (v / 1e9).toFixed(2) + 'B';
			if (v >= 1e6) return '$' + (v / 1e6).toFixed(1) + 'M';
			if (v >= 1e3) return '$' + (v / 1e3).toFixed(0) + 'K';
			return '$' + v;
		}

		deckOverlay = new MapboxOverlay({
			layers: [buildArcLayer(arcs), buildDotsLayer(arcs), buildMarkerLayer()],
			getTooltip: ({ object }: { object?: TaiwanArc }) => {
				if (!object) { onHover?.(null); return null; }
				onHover?.(object);
				const dir = object.direction === 'Exports' ? '↗ Export from Taiwan' : '↙ Import to Taiwan';
				const total = object.direction === 'Exports' ? totalExports : totalImports;
				const pct = total > 0 ? ((object.value / total) * 100).toFixed(1) : '—';
				const topSubs = Object.entries(object.subcats)
					.sort((a, b) => b[1] - a[1])
					.slice(0, 3)
					.map(([code, val]) => `<div class="tt-sub"><span>HS${code}</span><span>${formatVal(val)}</span></div>`)
					.join('');
				return {
					html: `
						<div class="tt-country">${object.country}</div>
						<div class="tt-dir${object.direction === 'Exports' ? ' exp' : ' imp'}">${dir}</div>
						<div class="tt-row"><span>Total Value</span><span>${formatVal(object.value)}</span></div>
						<div class="tt-row"><span>% of ${object.direction}</span><span>${pct}%</span></div>
						<div class="tt-subs">${topSubs}</div>`,
					style: {
						backgroundColor: 'rgba(6,11,24,0.97)',
						color: '#d4e8ff',
						fontSize: '12px',
						fontFamily: 'Inter, sans-serif',
						padding: '12px 15px',
						borderRadius: '10px',
						border: '1px solid rgba(0,180,255,0.22)',
						minWidth: '200px',
						lineHeight: '1.6',
						backdropFilter: 'blur(12px)'
					}
				};
			}
		});

		map.addControl(deckOverlay);
		map.addControl(new maplibregl.NavigationControl(), 'top-right');

		// Tooltip sub-styles injected once
		if (!document.getElementById('tw-tt-styles')) {
			const s = document.createElement('style');
			s.id = 'tw-tt-styles';
			s.textContent = `
				.tt-country{font-size:14px;font-weight:600;margin-bottom:2px}
				.tt-dir{font-size:10px;text-transform:uppercase;letter-spacing:.09em;margin-bottom:8px}
				.tt-dir.exp{color:#00d4ff}.tt-dir.imp{color:#ff6b35}
				.tt-row{display:flex;justify-content:space-between;gap:16px;font-size:11px;padding:2px 0;border-bottom:1px solid rgba(0,120,200,.12)}
				.tt-row:last-of-type,.tt-subs{border:none}
				.tt-subs{margin-top:6px}
				.tt-sub{display:flex;justify-content:space-between;font-size:10px;padding:1px 0;color:#6a8aaa}`;
			document.head.appendChild(s);
		}
	}

	async function updateLayers() {
		if (!deckOverlay) return;
		const { ArcLayer, ScatterplotLayer } = await import('@deck.gl/layers');

		deckOverlay.setProps({
			layers: [
				new ArcLayer({
					id: 'taiwan-arcs',
					data: arcs,
					getSourcePosition: () => TAIWAN,
					getTargetPosition: (d: TaiwanArc) => [d.lon, d.lat] as [number, number],
					getSourceColor: (d: TaiwanArc) => arcColor(d.direction),
					getTargetColor: (d: TaiwanArc) => arcColor(d.direction),
					getWidth: (d: TaiwanArc) => arcWidth(d.value),
					greatCircle: true,
					numSegments: 64,
					pickable: true
				}),
				new ScatterplotLayer({
					id: 'taiwan-dots',
					data: arcs,
					getPosition: (d: TaiwanArc) => [d.lon, d.lat] as [number, number],
					getRadius: 40000,
					getFillColor: (d: TaiwanArc) => arcColor(d.direction),
					pickable: false,
					opacity: 0.9
				}),
				new ScatterplotLayer({
					id: 'taiwan-marker',
					data: [{ pos: TAIWAN }],
					getPosition: (d: { pos: [number, number] }) => d.pos,
					getRadius: 80000,
					getFillColor: [0, 212, 255, 255] as [number, number, number, number],
					stroked: true,
					getLineColor: [255, 255, 255, 200] as [number, number, number, number],
					getLineWidth: 2,
					lineWidthUnits: 'pixels' as const,
					pickable: false
				})
			]
		});
	}

	onMount(() => { initMap(); });
	onDestroy(() => { map?.remove(); });

	$effect(() => {
		const _len = arcs.length;
		if (deckOverlay) updateLayers();
	});
</script>

<div class="globe-wrap" style:height>
	<div bind:this={container} class="globe-canvas"></div>
	<div class="globe-hint">Click to enable zoom · Move away to scroll</div>
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

	.globe-canvas {
		width: 100%;
		height: 100%;
	}

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
