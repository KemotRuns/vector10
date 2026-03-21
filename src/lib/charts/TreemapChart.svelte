<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { ECharts } from 'echarts';
	import { themeStore } from '$lib/stores/theme';
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
	let chart: ECharts | null = null;

	const CHAPTER_COLORS: Record<string, string> = {
		'50': '#d4a853', '51': '#c9b18c', '52': '#f5e6c8', '53': '#7ba05b',
		'54': '#5b8dd9', '55': '#7c6bc4', '56': '#a0a0a0', '57': '#c44e52',
		'58': '#e8956a', '59': '#4a9b8f', '60': '#d97ab5', '61': '#e84393',
		'62': '#6c5ce7', '63': '#636e72'
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

		chart = echarts.init(container, themeStore.isDark ? 'dark' : undefined);
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
					itemStyle: { color: themeStore.isDark ? '#2a2a44' : '#f0f1f3' },
					textStyle: { color: themeStore.isDark ? '#e8e8f0' : '#1a1a2e' }
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
					borderColor: themeStore.isDark ? '#0f0f1a' : '#ffffff',
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
