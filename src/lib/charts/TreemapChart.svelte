<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { isDark } from '$lib/stores/theme';
	import { get } from 'svelte/store';
	import type { TradeFlow, TradeDirection } from '$lib/types/trade';
	import { HS_CHAPTER_LABELS, type HSChapter } from '$lib/types/trade';
	import { formatTradeValue } from '$lib/data/transforms';
	import { getCountry } from '$lib/data/countries';

	interface Props {
		flows: TradeFlow[];
		direction: TradeDirection;
		height?: string;
	}

	let { flows, direction, height = '450px' }: Props = $props();

	let container: HTMLDivElement;
	let chart: any = null;

	const CHAPTER_COLORS: Record<string, string> = {
		'50': '#F5A623', '51': '#c9a96e', '52': '#e8d5a8', '53': '#5a9e6f',
		'54': '#487F84', '55': '#5F597E', '56': '#8899a6', '57': '#db5111',
		'58': '#e0874a', '59': '#3a7d75', '60': '#c47a9b', '61': '#d65d7a',
		'62': '#6e6aaa', '63': '#6b7d8d'
	};

	function buildTreemapData(flows: TradeFlow[]) {
		// Group: Country → HS Chapter → value
		const countryMap = new Map<string, Map<HSChapter, number>>();

		for (const f of flows) {
			if (f.direction !== direction) continue;
			const country = f.reporter;
			if (!countryMap.has(country)) countryMap.set(country, new Map());
			const chapters = countryMap.get(country)!;
			chapters.set(f.hsChapter, (chapters.get(f.hsChapter) ?? 0) + f.tradeValue);
		}

		return [...countryMap.entries()]
			.map(([iso3, chapters]) => ({
				name: getCountry(iso3)?.name ?? iso3,
				value: [...chapters.values()].reduce((a, b) => a + b, 0),
				children: [...chapters.entries()].map(([ch, val]) => ({
					name: HS_CHAPTER_LABELS[ch],
					value: val,
					itemStyle: { color: CHAPTER_COLORS[ch] }
				}))
			}))
			.sort((a, b) => b.value - a.value)
			.slice(0, 20);
	}

	async function initChart() {
		const echarts = await import('echarts/core');
		const { CanvasRenderer } = await import('echarts/renderers');
		const { TooltipComponent } = await import('echarts/components');
		const { TreemapChart } = await import('echarts/charts');

		echarts.use([CanvasRenderer, TooltipComponent, TreemapChart]);

		chart = echarts.init(container, get(isDark) ? 'dark' : undefined);
		updateChart();
	}

	function updateChart() {
		if (!chart) return;
		const data = buildTreemapData(flows);

		chart.setOption({
			tooltip: {
				formatter: (params: any) => {
					return `${params.name}<br/>${formatTradeValue(params.value)}`;
				}
			},
			series: [{
				type: 'treemap',
				roam: false,
				nodeClick: 'zoomToNode',
				breadcrumb: {
					show: true,
					itemStyle: { color: get(isDark) ? '#2a2a44' : '#f0f1f3' },
					textStyle: { color: get(isDark) ? '#e8e8f0' : '#1a1a2e' }
				},
				label: {
					show: true,
					formatter: '{b}',
					fontSize: 12,
					color: '#fff',
					textShadowColor: 'rgba(0,0,0,0.3)',
					textShadowBlur: 2
				},
				upperLabel: {
					show: true,
					height: 24,
					color: '#fff',
					fontSize: 12,
					fontWeight: 600,
					textShadowColor: 'rgba(0,0,0,0.3)',
					textShadowBlur: 2
				},
				itemStyle: {
					borderColor: get(isDark) ? '#0f0f1a' : '#ffffff',
					borderWidth: 2,
					gapWidth: 2
				},
				levels: [
					{
						itemStyle: { borderWidth: 3, gapWidth: 3 },
						upperLabel: { show: true }
					},
					{
						itemStyle: { borderWidth: 1, gapWidth: 1 },
						upperLabel: { show: false }
					}
				],
				data
			}]
		}, { notMerge: true });
	}

	function handleResize() { chart?.resize(); }

	onMount(() => {
		initChart();
		window.addEventListener('resize', handleResize);
	});

	onDestroy(() => {
		chart?.dispose();
		if (typeof window !== 'undefined') window.removeEventListener('resize', handleResize);
	});

	$effect(() => {
		if (chart && flows) updateChart();
	});
</script>

<div bind:this={container} class="treemap-container" style:height></div>

<style>
	.treemap-container { width: 100%; }
</style>
