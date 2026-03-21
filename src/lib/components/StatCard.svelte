<script lang="ts">
	interface Props {
		label: string;
		value: string;
		subtitle?: string;
		trend?: { direction: 'up' | 'down'; value: string };
	}

	let { label, value, subtitle, trend }: Props = $props();
</script>

<div class="stat-card card">
	<div class="stat-label">{label}</div>
	<div class="stat-value">{value}</div>
	{#if subtitle}
		<div class="stat-subtitle">{subtitle}</div>
	{/if}
	{#if trend}
		<div class="stat-trend" class:up={trend.direction === 'up'} class:down={trend.direction === 'down'}>
			<span class="trend-arrow">{trend.direction === 'up' ? '↑' : '↓'}</span>
			{trend.value}
		</div>
	{/if}
</div>

<style>
	.stat-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		padding: var(--space-4) var(--space-5);
		min-width: 160px;
	}

	.stat-label {
		font-size: var(--text-xs);
		font-weight: 600;
		color: var(--text-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.stat-value {
		font-size: var(--text-2xl);
		font-weight: 700;
		color: var(--text-primary);
		letter-spacing: -0.02em;
		font-family: var(--font-mono);
	}

	.stat-subtitle {
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}

	.stat-trend {
		font-size: var(--text-sm);
		font-weight: 500;
		display: flex;
		align-items: center;
		gap: var(--space-1);
	}

	.stat-trend.up {
		color: var(--accent-success);
	}

	.stat-trend.down {
		color: var(--accent-danger);
	}

	.trend-arrow {
		font-size: var(--text-base);
	}
</style>
