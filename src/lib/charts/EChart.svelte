<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { EChartsOption } from 'echarts';
	import { isDark } from '$lib/stores/theme';
	import { get } from 'svelte/store';

	interface Props {
		options: EChartsOption;
		height?: string;
		class?: string;
	}

	let { options, height = '400px', class: className = '' }: Props = $props();

	let container: HTMLDivElement;
	let chart: any = null;

	async function initChart() {
		const echarts = await import('echarts/core');
		const { CanvasRenderer } = await import('echarts/renderers');
		const { TooltipComponent, LegendComponent, GridComponent } = await import('echarts/components');

		echarts.use([CanvasRenderer, TooltipComponent, LegendComponent, GridComponent]);

		chart = echarts.init(container, get(isDark) ? 'dark' : undefined, {
			renderer: 'canvas'
		});

		chart.setOption(options);
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
		if (typeof window !== 'undefined') {
			window.removeEventListener('resize', handleResize);
		}
	});

	$effect(() => {
		if (chart && options) {
			chart.setOption(options, { notMerge: true });
		}
	});
</script>

<div
	bind:this={container}
	class="echart-container {className}"
	style:height
></div>

<style>
	.echart-container {
		width: 100%;
	}
</style>
