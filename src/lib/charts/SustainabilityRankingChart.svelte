<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { isDark } from '$lib/stores/theme';
	import { get } from 'svelte/store';
	import type { CountrySustainability } from '$lib/types/sustainability';
	import { REGION_COLORS } from '$lib/types/sustainability';

	interface Props {
		data: CountrySustainability[];
		height?: string;
	}

	let { data, height = '520px' }: Props = $props();

	let container: HTMLDivElement;
	let chart = $state<any>(null);

	function updateChart() {
		if (!chart || data.length === 0) return;

		const sorted = [...data].sort((a, b) => a.compositeScore - b.compositeScore);
		const dark = get(isDark);

		chart.setOption({
			tooltip: {
				trigger: 'axis',
				axisPointer: { type: 'shadow' },
				formatter: (params: any) => {
					const d = sorted[params[0].dataIndex];
					return `<b>${d.country}</b> — ${d.region}<br/>` +
						`Composite Score: <b>${d.compositeScore}</b>/100`;
				}
			},
			grid: {
				left: 110,
				right: 40,
				top: 20,
				bottom: 30
			},
			xAxis: {
				type: 'value',
				max: 100,
				name: 'Composite Score',
				nameLocation: 'center',
				nameGap: 20,
				nameTextStyle: { fontSize: 12, color: dark ? '#8a90a0' : '#6b6b80' },
				axisLabel: { color: dark ? '#8a90a0' : '#6b6b80' },
				splitLine: { lineStyle: { color: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' } },
				axisLine: { show: false }
			},
			yAxis: {
				type: 'category',
				data: sorted.map(d => d.country),
				axisLabel: {
					color: dark ? '#a0b0c0' : '#4a5568',
					fontSize: 11
				},
				axisLine: { show: false },
				axisTick: { show: false }
			},
			series: [{
				type: 'bar',
				data: sorted.map(d => ({
					value: d.compositeScore,
					itemStyle: { color: REGION_COLORS[d.region] }
				})),
				barWidth: '60%',
				label: {
					show: true,
					position: 'right',
					fontSize: 11,
					fontWeight: 500,
					color: dark ? '#c8cdd4' : '#3a3a4e',
					formatter: (params: any) => params.value
				},
				emphasis: {
					itemStyle: { opacity: 1 }
				},
				itemStyle: {
					borderRadius: [0, 4, 4, 0],
					opacity: 0.85
				}
			}]
		}, { notMerge: true });
	}

	async function initChart() {
		const echarts = await import('echarts/core');
		const { CanvasRenderer } = await import('echarts/renderers');
		const { TooltipComponent, GridComponent } = await import('echarts/components');
		const { BarChart } = await import('echarts/charts');

		echarts.use([CanvasRenderer, TooltipComponent, GridComponent, BarChart]);

		chart = echarts.init(container, get(isDark) ? 'dark' : undefined);
		updateChart();
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
		const _len = data.length;
		if (chart) updateChart();
	});
</script>

<div bind:this={container} class="ranking-container" style:height></div>

<style>
	.ranking-container { width: 100%; }
</style>
