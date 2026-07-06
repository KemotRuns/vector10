<script lang="ts">
	import { REG_TIMELINE } from '$lib/data/regTimeline';

	const STATUS_LABELS = { live: 'In force', imminent: 'Imminent', ahead: 'Ahead' } as const;
</script>

<div class="timeline card">
	<h3 class="section-title">The regulatory clock is running</h3>
	<p class="section-subtitle">EU textile regulation milestones that reshape sourcing decisions</p>
	<ol class="milestones">
		{#each REG_TIMELINE as m (m.year)}
			<li class="milestone" data-status={m.status}>
				<div class="marker"></div>
				<div class="content">
					<div class="milestone-head">
						<span class="year">{m.year}</span>
						<span class="status status-{m.status}">{STATUS_LABELS[m.status]}</span>
					</div>
					<h4 class="milestone-title">{m.title}</h4>
					<p class="milestone-detail">{m.detail}</p>
				</div>
			</li>
		{/each}
	</ol>
</div>

<style>
	.timeline {
		padding: var(--space-5);
		border-radius: var(--radius-xl);
		background: var(--eco-bg-tint);
	}

	.section-title {
		font-size: var(--text-base);
		font-weight: 600;
		color: var(--eco-primary);
		margin-bottom: var(--space-1);
	}

	:global([data-theme='dark']) .section-title {
		color: var(--eco-secondary);
	}

	.section-subtitle {
		font-size: var(--text-xs);
		color: var(--text-tertiary);
		margin-bottom: var(--space-5);
		font-family: var(--font-mono);
	}

	.milestones {
		list-style: none;
		position: relative;
		padding-left: var(--space-5);
	}

	.milestones::before {
		content: '';
		position: absolute;
		left: 5px;
		top: 6px;
		bottom: 6px;
		width: 2px;
		background: var(--border-default);
	}

	.milestone {
		position: relative;
		padding-bottom: var(--space-5);
	}

	.milestone:last-child {
		padding-bottom: 0;
	}

	.marker {
		position: absolute;
		left: calc(-1 * var(--space-5) + 1px);
		top: 4px;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--eco-secondary);
		border: 2px solid var(--eco-bg-tint);
	}

	.milestone[data-status='live'] .marker {
		background: var(--eco-risk);
	}

	.milestone[data-status='imminent'] .marker {
		background: var(--eco-warm);
	}

	.milestone-head {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.year {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 700;
		color: var(--text-primary);
	}

	.status {
		font-size: 10px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: 1px 8px;
		border-radius: var(--radius-full);
	}

	.status-live {
		background: color-mix(in srgb, var(--eco-risk) 15%, transparent);
		color: var(--eco-risk);
	}

	.status-imminent {
		background: color-mix(in srgb, var(--eco-warm) 20%, transparent);
		color: var(--eco-warm);
	}

	.status-ahead {
		background: var(--bg-tertiary);
		color: var(--text-tertiary);
	}

	.milestone-title {
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--text-primary);
		margin-top: var(--space-1);
	}

	.milestone-detail {
		font-size: var(--text-xs);
		color: var(--text-secondary);
		line-height: 1.6;
		margin-top: var(--space-1);
		max-width: 640px;
	}
</style>
