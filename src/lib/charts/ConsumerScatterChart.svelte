<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { isDark } from '$lib/stores/theme';
	import { get } from 'svelte/store';
	import type { ConsumerSpendData, ConsumerRegion } from '$lib/types/consumer';
	import { REGION_COLORS } from '$lib/types/consumer';

	interface Props {
		data: ConsumerSpendData[];
		height?: string;
	}

	let { data, height = '500px' }: Props = $props();

	let container: HTMLDivElement;
	let chart = $state<any>(null);

	function updateChart() {
		if (!chart) return;

		const regions = [...new Set(data.map(d => d.region))] as ConsumerRegion[];

		const series = regions.map(region => {
			const regionData = data.filter(d => d.region === region);
			return {
				name: region,
				type: 'scatter' as const,
				data: regionData.map(d => [
					d.itemsPerCapita,
					d.spendPerCapita,
					d.population,
					d.country
				]),
				symbolSize: (val: number[]) => {
					// Scale bubble by population: log for wide range, dramatic sizing
					const pop = val[2]; // millions
					if (pop > 1000) return 70;
					if (pop > 200) return 45;
					if (pop > 60) return 30;
					if (pop > 20) return 20;
					return 10;
				},
				itemStyle: {
					color: REGION_COLORS[region],
					opacity: 0.8
				},
				emphasis: {
					itemStyle: { opacity: 1, borderColor: '#fff', borderWidth: 2 }
				},
				label: {
					show: true,
					formatter: (params: any) => params.value[3],
					position: 'right' as const,
					fontSize: 11,
					color: get(isDark) ? '#c8cdd4' : '#3a3a4e',
					distance: 6
				}
			};
		});

		const dark = get(isDark);

		chart.setOption({
			tooltip: {
				trigger: 'item',
				formatter: (params: any) => {
					const [items, spend, pop, country] = params.value;
					const pricePerItem = Math.round(spend / items);
					return `<b>${country}</b><br/>` +
						`Spend: <b>$${spend}</b>/person/year<br/>` +
						`Items: <b>${items}</b>/person/year<br/>` +
						`Avg price: <b>$${pricePerItem}</b>/item<br/>` +
						`Population: ${pop}M`;
				}
			},
			legend: {
				data: regions,
				top: 8,
				textStyle: { color: dark ? '#c8cdd4' : '#3a3a4e', fontSize: 12 }
			},
			grid: {
				left: 70,
				right: 100,
				top: 60,
				bottom: 60
			},
			xAxis: {
				name: 'Items purchased per person / year',
				nameLocation: 'center',
				nameGap: 36,
				nameTextStyle: { fontSize: 12, color: dark ? '#8a90a0' : '#6b6b80' },
				type: 'value',
				splitLine: { lineStyle: { color: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' } },
				axisLabel: { color: dark ? '#8a90a0' : '#6b6b80' },
				axisLine: { lineStyle: { color: dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)' } }
			},
			yAxis: {
				name: 'Annual spend per person (USD)',
				nameLocation: 'center',
				nameGap: 50,
				nameTextStyle: { fontSize: 12, color: dark ? '#8a90a0' : '#6b6b80' },
				type: 'value',
				axisLabel: {
					color: dark ? '#8a90a0' : '#6b6b80',
					formatter: '${value}'
				},
				splitLine: { lineStyle: { color: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' } },
				axisLine: { lineStyle: { color: dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)' } }
			},
			series
		}, { notMerge: true });
	}

	async function initChart() {
		const echarts = await import('echarts/core');
		const { CanvasRenderer } = await import('echarts/renderers');
		const { TooltipComponent, LegendComponent, GridComponent } = await import('echarts/components');
		const { ScatterChart } = await import('echarts/charts');

		echarts.use([CanvasRenderer, TooltipComponent, LegendComponent, GridComponent, ScatterChart]);

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

<div bind:this={container} class="scatter-container" style:height></div>

<style>
	.scatter-container { width: 100%; }
</style>
