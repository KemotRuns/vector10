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
	let chart = $state<any>(null);

	const CHAPTER_COLORS: Record<string, string> = {
		'50': '#F5A623', '51': '#c9a96e', '52': '#e8d5a8', '53': '#5a9e6f',
		'54': '#487F84', '55': '#5F597E', '56': '#8899a6', '57': '#db5111',
		'58': '#e0874a', '59': '#3a7d75', '60': '#c47a9b', '61': '#d65d7a',
		'62': '#6e6aaa', '63': '#6b7d8d'
	};

	// Distinct country-level colors so they don't blend together
	const COUNTRY_COLORS = [
		'#1e3a5c', '#487F84', '#db5111', '#5F597E', '#F5A623',
		'#3a7d75', '#d65d7a', '#6e6aaa', '#c9a96e', '#5a9e6f',
		'#8899a6', '#e0874a', '#c47a9b', '#6b7d8d', '#2a6496',
		'#7b4f8a', '#b87333', '#2d8659', '#a04050', '#4a6fa5'
	];

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
			.map(([iso3, chapters], i) => ({
				name: getCountry(iso3)?.name ?? iso3,
				value: [...chapters.values()].reduce((a, b) => a + b, 0),
				itemStyle: { color: COUNTRY_COLORS[i % COUNTRY_COLORS.length] },
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
					const path = params.treePathInfo?.map((p: any) => p.name).filter(Boolean).join(' → ');
					return `<b>${path || params.name}</b><br/>${formatTradeValue(params.value)}`;
				}
			},
			series: [{
				type: 'treemap',
				roam: false,
				nodeClick: false,
				breadcrumb: { show: false },
				label: {
					show: true,
					formatter: '{b}',
					fontSize: 11,
					color: '#fff',
					textShadowColor: 'rgba(0,0,0,0.5)',
					textShadowBlur: 3
				},
				upperLabel: {
					show: true,
					height: 28,
					color: '#fff',
					fontSize: 13,
					fontWeight: 700,
					textShadowColor: 'rgba(0,0,0,0.6)',
					textShadowBlur: 4,
					padding: [4, 8]
				},
				itemStyle: {
					borderColor: get(isDark) ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
					borderWidth: 1,
					gapWidth: 1
				},
				levels: [
					{
						itemStyle: {
							borderColor: get(isDark) ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
							borderWidth: 2,
							gapWidth: 2
						},
						upperLabel: {
							show: true,
							height: 30,
							fontSize: 13,
							fontWeight: 700,
							formatter: (params: any) => `  ${params.name}  —  ${formatTradeValue(params.value)}`
						},
						colorSaturation: [0.4, 0.7]
					},
					{
						itemStyle: {
							borderColor: 'rgba(255,255,255,0.1)',
							borderWidth: 1,
							gapWidth: 0
						},
						upperLabel: { show: false },
						colorSaturation: [0.5, 0.8]
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
		const _len = flows.length;
		const _dir = direction;
		if (chart) updateChart();
	});
</script>

<div bind:this={container} class="treemap-container" style:height></div>

<style>
	.treemap-container { width: 100%; }
</style>
