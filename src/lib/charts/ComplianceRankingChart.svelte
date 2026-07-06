<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { isDark } from '$lib/stores/theme';
	import { get } from 'svelte/store';
	import type { EChartsType } from 'echarts/core';
	import type { CountrySustainability } from '$lib/types/sustainability';
	import { TIER_COLORS } from '$lib/types/sustainability';

	interface Props {
		data: CountrySustainability[];
		onSelect?: (iso3: string) => void;
	}

	let { data, onSelect }: Props = $props();

	let container: HTMLDivElement;
	let chart = $state<EChartsType | null>(null);

	// Category axis renders bottom-up, so ascending sort puts highest risk on top
	const sorted = $derived([...data].sort((a, b) => a.complianceRiskScore - b.complianceRiskScore));
	const chartHeight = $derived(`${Math.max(320, sorted.length * 24 + 90)}px`);

	const riskColor = (score: number): string =>
		score >= 60 ? TIER_COLORS.high : score >= 40 ? TIER_COLORS.medium : TIER_COLORS.low;

	function updateChart() {
		if (!chart || sorted.length === 0) return;
		const dark = get(isDark);
		const mutedColor = dark ? '#8a90a0' : '#6b6b80';

		chart.setOption(
			{
				backgroundColor: 'transparent',
				tooltip: {
					trigger: 'item',
					formatter: (params: { name: string; value: number }) =>
						`<b>${params.name}</b><br/>Compliance risk: <b>${params.value}</b>/100<br/><i>Click for country detail</i>`
				},
				grid: { left: 110, right: 48, top: 16, bottom: 32 },
				xAxis: {
					type: 'value' as const,
					max: 100,
					splitLine: { lineStyle: { color: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' } },
					axisLabel: { color: mutedColor }
				},
				yAxis: {
					type: 'category' as const,
					data: sorted.map((d) => d.country),
					axisLabel: { color: mutedColor, fontSize: 11 },
					axisTick: { show: false },
					axisLine: { lineStyle: { color: dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)' } }
				},
				series: [
					{
						type: 'bar' as const,
						data: sorted.map((d) => ({
							value: d.complianceRiskScore,
							itemStyle: { color: riskColor(d.complianceRiskScore), borderRadius: [0, 3, 3, 0] }
						})),
						barMaxWidth: 14,
						label: {
							show: true,
							position: 'right' as const,
							color: mutedColor,
							fontSize: 10,
							formatter: '{c}'
						}
					}
				]
			},
			{ notMerge: true }
		);
	}

	async function initChart() {
		const echarts = await import('echarts/core');
		const { CanvasRenderer } = await import('echarts/renderers');
		const { TooltipComponent, GridComponent } = await import('echarts/components');
		const { BarChart } = await import('echarts/charts');

		echarts.use([CanvasRenderer, TooltipComponent, GridComponent, BarChart]);

		chart = echarts.init(container, get(isDark) ? 'dark' : undefined);
		chart.on('click', (params) => {
			const match = sorted.find((d) => d.country === params.name);
			if (match && onSelect) onSelect(match.iso3);
		});
		updateChart();
	}

	function handleResize() {
		chart?.resize();
	}

	onMount(() => {
		initChart();
		window.addEventListener('resize', handleResize);
	});

	onDestroy(() => {
		chart?.dispose();
		if (typeof window !== 'undefined') window.removeEventListener('resize', handleResize);
	});

	$effect(() => {
		void sorted.length;
		void $isDark;
		if (chart) {
			updateChart();
			chart.resize();
		}
	});
</script>

<div bind:this={container} class="ranking-container" style:height={chartHeight}></div>

<style>
	.ranking-container {
		width: 100%;
	}
</style>
