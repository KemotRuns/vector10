<script lang="ts">
	import '$lib/styles/theme.css';
	import Nav from '$lib/components/Nav.svelte';
	import { themeStore } from '$lib/stores/theme';
	import { onMount } from 'svelte';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	onMount(() => {
		themeStore.apply();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Vector10 — Textile Intelligence</title>
	<meta name="description" content="Interactive dashboards for global textile trade data and industry intelligence." />
</svelte:head>

<div class="app">
	<Nav />
	<main class="main">
		{@render children()}
	</main>
</div>

<style>
	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.main {
		flex: 1;
		max-width: var(--content-max-width);
		width: 100%;
		margin: 0 auto;
		padding: var(--space-6);
	}
</style>
