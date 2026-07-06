<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { isDark } from '$lib/stores/theme';
	import { get } from 'svelte/store';
	import type { CountrySustainability } from '$lib/types/sustainability-legacy';
	import { METRIC_LABELS, METRIC_UNITS } from '$lib/types/sustainability-legacy';

	interface Props {
		data: CountrySustainability[];
		height?: string;
	}

	let { data, height = '560px' }: Props = $props();

	let container: HTMLDivElement;
	let chart = $state<any>(null);

	const metrics = ['carbon', 'water', 'labor', 'transparency'] as const;
	const metricLabels = metrics.map(m => METRIC_LABELS[m]);

	function normalize(data: CountrySustainability[]): number[][] {
		const carbonVals = data.map(d => d.carbonPerTon);
		const waterVals = data.map(d => d.waterPerKg);
		const cMin = Math.min(...carbonVals), cMax = Math.max(...carbonVals);
		const wMin = Math.min(...waterVals), wMax = Math.max(...waterVals);

		return data.map(d => [
			cMax === cMin ? 50 : Math.round(100 * (1 - (d.carbonPerTon - cMin) / (cMax - cMin))),
			wMax === wMin ? 50 : Math.round(100 * (1 - (d.waterPerKg - wMin) / (wMax - wMin))),
			d.laborIndex,
			d.transparencyIndex
		]);
	}

	function getRawValue(d: CountrySustainability, metricIdx: number): string {
		const units = metrics.map(m => METRIC_UNITS[m]);
		switch (metricIdx) {
			case 0: return `${d.carbonPerTon.toLocaleString()} ${units[0]}`;
			case 1: return `${d.waterPerKg} ${units[1]}`;
			case 2: return `${d.laborIndex} ${units[2]}`;
			case 3: return `${d.transparencyIndex} ${units[3]}`;
			default: return '';
		}
	}

	function updateChart() {
		if (!chart || data.length === 0) return;

		const sorted = [...data].sort((a, b) => a.compositeScore - b.compositeScore);
		const countries = sorted.map(d => d.country);
		const normalized = normalize(sorted);

		const heatmapData: number[][] = [];
		for (let ci = 0; ci < sorted.length; ci++) {
			for (let mi = 0; mi < metrics.length; mi++) {
				heatmapData.push([mi, ci, normalized[ci][mi]]);
			}
		}

		const dark = get(isDark);

		chart.setOption({
			tooltip: {
				position: 'top',
				formatter: (params: any) => {
					const [metricIdx, countryIdx, score] = params.value;
					const country = sorted[countryIdx];
					const raw = getRawValue(country, metricIdx);
					return `<b>${country.country}</b><br/>` +
						`${metricLabels[metricIdx]}: ${raw}<br/>` +
						`Normalized: <b>${score}</b>/100`;
				}
			},
			grid: {
				left: 110,
				right: 80,
				top: 30,
				bottom: 50
			},
			xAxis: {
				type: 'category',
				data: metricLabels,
				position: 'bottom',
				splitArea: { show: false },
				axisLabel: {
					color: dark ? '#a0b0c0' : '#4a5568',
					fontSize: 12,
					fontWeight: 500
				},
				axisLine: { show: false },
				axisTick: { show: false }
			},
			yAxis: {
				type: 'category',
				data: countries,
				splitArea: { show: false },
				axisLabel: {
					color: dark ? '#a0b0c0' : '#4a5568',
					fontSize: 11
				},
				axisLine: { show: false },
				axisTick: { show: false }
			},
			visualMap: {
				min: 0,
				max: 100,
				calculable: false,
				orient: 'vertical',
				right: 10,
				top: 'center',
				itemHeight: 200,
				inRange: {
					color: ['#c0392b', '#e67e22', '#f1c40f', '#6b8f71', '#27ae60']
				},
				textStyle: {
					color: dark ? '#a0b0c0' : '#4a5568',
					fontSize: 11
				},
				text: ['Good', 'Poor']
			},
			series: [{
				type: 'heatmap',
				data: heatmapData,
				label: {
					show: true,
					formatter: (params: any) => params.value[2],
					fontSize: 11,
					fontWeight: 500,
					color: (params: any) => {
						const score = params.value[2];
						return score > 60 || score < 30 ? '#fff' : '#333';
					}
				},
				emphasis: {
					itemStyle: {
						shadowBlur: 8,
						shadowColor: 'rgba(0,0,0,0.3)'
					}
				},
				itemStyle: {
					borderColor: dark ? '#132338' : '#ffffff',
					borderWidth: 2,
					borderRadius: 3
				}
			}]
		}, { notMerge: true });
	}

	async function initChart() {
		const echarts = await import('echarts/core');
		const { CanvasRenderer } = await import('echarts/renderers');
		const { TooltipComponent, GridComponent, VisualMapComponent } = await import('echarts/components');
		const { HeatmapChart } = await import('echarts/charts');

		echarts.use([CanvasRenderer, TooltipComponent, GridComponent, VisualMapComponent, HeatmapChart]);

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

<div bind:this={container} class="heatmap-container" style:height></div>

<style>
	.heatmap-container { width: 100%; }
</style>
