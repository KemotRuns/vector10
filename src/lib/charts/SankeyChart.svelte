<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { ECharts } from 'echarts';
	import { isDark } from '$lib/stores/theme';
	import { get } from 'svelte/store';
	import type { TradeFlow } from '$lib/types/trade';
	import { HS_CHAPTER_LABELS, type HSChapter } from '$lib/types/trade';
	import { formatTradeValue } from '$lib/data/transforms';
	import { getCountry } from '$lib/data/countries';

	interface Props {
		flows: TradeFlow[];
		height?: string;
		maxNodes?: number;
	}

	let { flows, height = '500px', maxNodes = 12 }: Props = $props();

	let container: HTMLDivElement;
	let chart: ECharts | null = null;

	function buildSankeyData(flows: TradeFlow[]) {
		// Aggregate: Exporter → HS Chapter → Importer
		const exporterTotals = new Map<string, number>();
		const importerTotals = new Map<string, number>();
		const chapterTotals = new Map<HSChapter, number>();

		for (const f of flows) {
			if (f.direction !== 'export') continue;
			exporterTotals.set(f.reporter, (exporterTotals.get(f.reporter) ?? 0) + f.tradeValue);
			importerTotals.set(f.partner, (importerTotals.get(f.partner) ?? 0) + f.tradeValue);
			chapterTotals.set(f.hsChapter, (chapterTotals.get(f.hsChapter) ?? 0) + f.tradeValue);
		}

		// Top exporters and importers
		const topExporters = [...exporterTotals.entries()]
			.sort((a, b) => b[1] - a[1])
			.slice(0, maxNodes)
			.map(([iso3]) => iso3);

		const topImporters = [...importerTotals.entries()]
			.sort((a, b) => b[1] - a[1])
			.slice(0, maxNodes)
			.map(([iso3]) => iso3);

		const topChapters = [...chapterTotals.entries()]
			.sort((a, b) => b[1] - a[1])
			.slice(0, 8)
			.map(([ch]) => ch);

		const exporterSet = new Set(topExporters);
		const importerSet = new Set(topImporters);
		const chapterSet = new Set(topChapters);

		// Build nodes
		const nodes: Array<{ name: string }> = [];
		for (const iso3 of topExporters) {
			nodes.push({ name: `${getCountry(iso3)?.name ?? iso3} (exp)` });
		}
		for (const ch of topChapters) {
			nodes.push({ name: HS_CHAPTER_LABELS[ch] });
		}
		for (const iso3 of topImporters) {
			nodes.push({ name: `${getCountry(iso3)?.name ?? iso3} (imp)` });
		}

		// Build links: Exporter → Chapter
		const expToChapter = new Map<string, number>();
		const chapterToImp = new Map<string, number>();

		for (const f of flows) {
			if (f.direction !== 'export') continue;
			if (exporterSet.has(f.reporter) && chapterSet.has(f.hsChapter)) {
				const key = `${f.reporter}-${f.hsChapter}`;
				expToChapter.set(key, (expToChapter.get(key) ?? 0) + f.tradeValue);
			}
			if (chapterSet.has(f.hsChapter) && importerSet.has(f.partner)) {
				const key = `${f.hsChapter}-${f.partner}`;
				chapterToImp.set(key, (chapterToImp.get(key) ?? 0) + f.tradeValue);
			}
		}

		const links: Array<{ source: string; target: string; value: number }> = [];

		for (const [key, value] of expToChapter) {
			const [iso3, ch] = key.split('-');
			links.push({
				source: `${getCountry(iso3)?.name ?? iso3} (exp)`,
				target: HS_CHAPTER_LABELS[ch as HSChapter],
				value
			});
		}

		for (const [key, value] of chapterToImp) {
			const [ch, iso3] = key.split('-');
			links.push({
				source: HS_CHAPTER_LABELS[ch as HSChapter],
				target: `${getCountry(iso3)?.name ?? iso3} (imp)`,
				value
			});
		}

		return { nodes, links };
	}

	async function initChart() {
		const echarts = await import('echarts/core');
		const { CanvasRenderer } = await import('echarts/renderers');
		const { TooltipComponent } = await import('echarts/components');
		const { SankeyChart } = await import('echarts/charts');

		echarts.use([CanvasRenderer, TooltipComponent, SankeyChart]);

		chart = echarts.init(container, get(isDark) ? 'dark' : undefined);
		updateChart();
	}

	function updateChart() {
		if (!chart) return;
		const { nodes, links } = buildSankeyData(flows);

		chart.setOption({
			tooltip: {
				trigger: 'item',
				formatter: (params: any) => {
					if (params.dataType === 'edge') {
						return `${params.data.source} → ${params.data.target}<br/>${formatTradeValue(params.data.value)}`;
					}
					return params.name;
				}
			},
			series: [{
				type: 'sankey',
				layout: 'none',
				emphasis: { focus: 'adjacency' },
				nodeAlign: 'justify',
				nodeGap: 12,
				nodeWidth: 20,
				lineStyle: { color: 'gradient', curveness: 0.5, opacity: 0.4 },
				itemStyle: { borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
				label: { fontSize: 11, color: get(isDark) ? '#e8ecf0' : '#16121d' },
				data: nodes,
				links
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

<div bind:this={container} class="sankey-container" style:height></div>

<style>
	.sankey-container { width: 100%; }
</style>
