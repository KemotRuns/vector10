<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { isDark } from '$lib/stores/theme';
	import { get } from 'svelte/store';
	import type { EChartsType } from 'echarts/core';
	import type { ProducerRegion } from '$lib/types/sustainability';
	import { REGION_COLORS } from '$lib/types/sustainability';
	import type { MarketView } from '$lib/utils/marketRisk';

	interface Props {
		data: MarketView[];
		mode?: 'footprint' | 'cost';
		onSelect?: (iso3: string) => void;
		height?: string;
	}

	let { data, mode = 'footprint', onSelect, height = '520px' }: Props = $props();

	let container: HTMLDivElement;
	let chart = $state<EChartsType | null>(null);

	type Datum = [number, number, number, string, string]; // x, risk, euShare, country, iso3

	const MODE_CONFIG = {
		footprint: {
			xLabel: 'Footprint score (higher = cleaner) →',
			xValue: (d: MarketView) => d.footprintScore,
			xTooltip: (v: number) => `Footprint score: <b>${v}</b>/100 (higher = cleaner)`,
			quadrants: ['HEAVY & EXPOSED', 'CLEAN BUT EXPOSED', 'HEAVY & SHELTERED', 'CLEAN & READY']
		},
		cost: {
			xLabel: 'Sourcing cost index (higher = costlier) →',
			xValue: (d: MarketView) => d.costIndex,
			xTooltip: (v: number) => `Cost index: <b>${v}</b>/100 (labor + duty + lead time)`,
			quadrants: ['CHEAP BUT EXPOSED', 'COSTLY & EXPOSED', 'SWEET SPOT', 'COSTLY & SHELTERED']
		}
	} as const;

	const median = (values: number[]): number => {
		const sorted = [...values].sort((a, b) => a - b);
		const mid = Math.floor(sorted.length / 2);
		return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
	};

	function updateChart() {
		if (!chart || data.length === 0) return;
		const dark = get(isDark);
		const textColor = dark ? '#c8cdd4' : '#3a3a4e';
		const mutedColor = dark ? '#8a90a0' : '#6b6b80';
		const lineColor = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
		const cfg = MODE_CONFIG[mode];

		const medX = median(data.map(cfg.xValue));
		const medRisk = median(data.map((d) => d.marketRisk));
		const regions = [...new Set(data.map((d) => d.region))] as ProducerRegion[];

		const series = regions.map((region, i) => ({
			name: region,
			type: 'scatter' as const,
			data: data
				.filter((d) => d.region === region)
				.map((d) => ({
					value: [cfg.xValue(d), d.marketRisk, d.euExportShare, d.country, d.iso3] as Datum,
					label: {
						show: d.euExportShare >= 30 || d.marketRisk >= 70,
						formatter: d.country,
						position: 'right' as const,
						fontSize: 11,
						color: textColor,
						distance: 6
					}
				})),
			symbolSize: (val: Datum) => Math.max(9, Math.sqrt(val[2]) * 4.5),
			itemStyle: { color: REGION_COLORS[region], opacity: 0.8 },
			emphasis: { itemStyle: { opacity: 1, borderColor: '#fff', borderWidth: 2 } },
			...(i === 0
				? {
						markLine: {
							silent: true,
							symbol: 'none',
							lineStyle: { type: 'dashed' as const, color: mutedColor, opacity: 0.6 },
							label: { show: false },
							data: [{ xAxis: medX }, { yAxis: medRisk }]
						}
					}
				: {})
		}));

		const quadrantLabel = (text: string, left: string, top: string) => ({
			type: 'text' as const,
			left,
			top,
			silent: true,
			style: {
				text,
				fontSize: 11,
				fontWeight: 600,
				fill: mutedColor,
				opacity: 0.75
			}
		});

		chart.setOption(
			{
				backgroundColor: 'transparent',
				tooltip: {
					trigger: 'item',
					formatter: (params: { value: Datum }) => {
						const [x, risk, euShare, country] = params.value;
						return (
							`<b>${country}</b><br/>` +
							`${cfg.xTooltip(x)}<br/>` +
							`Compliance risk: <b>${risk}</b>/100 (your markets)<br/>` +
							`EU export share: <b>${euShare}%</b><br/>` +
							`<i>Click for country detail</i>`
						);
					}
				},
				legend: { data: regions, top: 8, textStyle: { color: textColor, fontSize: 12 } },
				grid: { left: 60, right: 90, top: 64, bottom: 56 },
				graphic: [
					quadrantLabel(cfg.quadrants[0], '13%', '18%'),
					quadrantLabel(cfg.quadrants[1], '72%', '18%'),
					quadrantLabel(cfg.quadrants[2], '13%', '86%'),
					quadrantLabel(cfg.quadrants[3], '74%', '86%')
				],
				xAxis: {
					name: cfg.xLabel,
					nameLocation: 'center' as const,
					nameGap: 34,
					nameTextStyle: { fontSize: 12, color: mutedColor },
					type: 'value' as const,
					splitLine: { lineStyle: { color: lineColor } },
					axisLabel: { color: mutedColor },
					axisLine: { lineStyle: { color: dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)' } }
				},
				yAxis: {
					name: '↑ Compliance risk score',
					nameLocation: 'center' as const,
					nameGap: 42,
					nameTextStyle: { fontSize: 12, color: mutedColor },
					type: 'value' as const,
					splitLine: { lineStyle: { color: lineColor } },
					axisLabel: { color: mutedColor },
					axisLine: { lineStyle: { color: dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)' } }
				},
				series
			},
			{ notMerge: true }
		);
	}

	async function initChart() {
		const echarts = await import('echarts/core');
		const { CanvasRenderer } = await import('echarts/renderers');
		const { TooltipComponent, LegendComponent, GridComponent, MarkLineComponent, GraphicComponent } =
			await import('echarts/components');
		const { ScatterChart } = await import('echarts/charts');

		echarts.use([
			CanvasRenderer,
			TooltipComponent,
			LegendComponent,
			GridComponent,
			MarkLineComponent,
			GraphicComponent,
			ScatterChart
		]);

		chart = echarts.init(container, get(isDark) ? 'dark' : undefined);
		chart.on('click', (params) => {
			const value = params.value as Datum | undefined;
			if (value && onSelect) onSelect(value[4]);
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
		void data;
		void mode;
		void $isDark;
		if (chart) updateChart();
	});
</script>

<div bind:this={container} class="quadrant-container" style:height></div>

<style>
	.quadrant-container {
		width: 100%;
	}
</style>
