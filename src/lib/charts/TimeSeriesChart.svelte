<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { ECharts } from 'echarts';
	import { themeStore } from '$lib/stores/theme';
	import type { TradeFlow } from '$lib/types/trade';
	import { HS_CHAPTER_LABELS, type HSChapter } from '$lib/types/trade';
	import { formatTradeValue } from '$lib/data/transforms';

	interface Props {
		/** Flows across multiple years */
		flowsByYear: Map<number, TradeFlow[]>;
		/** Which HS chapters to show as series */
		chapters?: HSChapter[];
		height?: string;
	}

	let { flowsByYear, chapters, height = '380px' }: Props = $props();

	let container: HTMLDivElement;
	let chart: ECharts | null = null;

	const SERIES_COLORS: string[] = [
		'#2563eb', '#e84393', '#7c6bc4', '#10b981', '#f59e0b',
		'#c44e52', '#5b8dd9', '#d4a853', '#4a9b8f', '#636e72'
	];

	function buildTimeSeriesData() {
		const years = [...flowsByYear.keys()].sort();

		// Determine which chapters to show
		const chapterTotals = new Map<HSChapter, number>();
		for (const [, flows] of flowsByYear) {
			for (const f of flows) {
				if (f.direction !== 'export') continue;
				chapterTotals.set(f.hsChapter, (chapterTotals.get(f.hsChapter) ?? 0) + f.tradeValue);
			}
		}

		const selectedChapters = chapters ??
			[...chapterTotals.entries()]
				.sort((a, b) => b[1] - a[1])
				.slice(0, 6)
				.map(([ch]) => ch);

		// Build series data
		const series = selectedChapters.map((ch, i) => {
			const data = years.map(year => {
				const flows = flowsByYear.get(year) ?? [];
				return flows
					.filter(f => f.hsChapter === ch && f.direction === 'export')
					.reduce((sum, f) => sum + f.tradeValue, 0);
			});

			return {
				name: HS_CHAPTER_LABELS[ch],
				type: 'line' as const,
				smooth: true,
				symbol: 'circle',
				symbolSize: 6,
				lineStyle: { width: 2.5 },
				areaStyle: { opacity: 0.05 },
				itemStyle: { color: SERIES_COLORS[i % SERIES_COLORS.length] },
				data
			};
		});

		return { years, series };
	}

	async function initChart() {
		const echarts = await import('echarts/core');
		const { CanvasRenderer } = await import('echarts/renderers');
		const { TooltipComponent, LegendComponent, GridComponent } = await import('echarts/components');
		const { LineChart } = await import('echarts/charts');

		echarts.use([CanvasRenderer, TooltipComponent, LegendComponent, GridComponent, LineChart]);

		chart = echarts.init(container, themeStore.isDark ? 'dark' : undefined);
		updateChart();
	}

	function updateChart() {
		if (!chart) return;
		const { years, series } = buildTimeSeriesData();

		chart.setOption({
			tooltip: {
				trigger: 'axis',
				formatter: (params: any) => {
					let html = `<strong>${params[0]?.axisValue}</strong><br/>`;
					for (const p of params) {
						html += `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p.color};margin-right:6px"></span>${p.seriesName}: ${formatTradeValue(p.value)}<br/>`;
					}
					return html;
				}
			},
			legend: {
				bottom: 0,
				textStyle: { color: themeStore.isDark ? '#a8a8c0' : '#4a4a68', fontSize: 11 }
			},
			grid: {
				left: 70,
				right: 20,
				top: 20,
				bottom: 50
			},
			xAxis: {
				type: 'category',
				data: years.map(String),
				axisLine: { lineStyle: { color: themeStore.isDark ? '#2a2a44' : '#e2e4e8' } },
				axisLabel: { color: themeStore.isDark ? '#a8a8c0' : '#4a4a68' }
			},
			yAxis: {
				type: 'value',
				axisLabel: {
					color: themeStore.isDark ? '#a8a8c0' : '#4a4a68',
					formatter: (v: number) => formatTradeValue(v)
				},
				splitLine: { lineStyle: { color: themeStore.isDark ? '#2a2a44' : '#f0f1f3' } }
			},
			series
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
		if (chart && flowsByYear) updateChart();
	});
</script>

<div bind:this={container} class="timeseries-container" style:height></div>

<style>
	.timeseries-container { width: 100%; }
</style>
