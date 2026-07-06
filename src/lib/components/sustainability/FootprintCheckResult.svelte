<script lang="ts">
	import type { CountrySustainability } from '$lib/types/sustainability';
	import { TIER_COLORS, TIER_LABELS, REGULATION_LABELS } from '$lib/types/sustainability';
	import type { ProductCategory } from '$lib/data/productCategories';
	import type { FootprintEstimate } from '$lib/utils/footprintCheck';
	import { buildLetsTalkHref } from '$lib/utils/mailto';

	interface Props {
		estimate: FootprintEstimate;
		selected: CountrySustainability[];
		category: ProductCategory;
	}

	let { estimate, selected, category }: Props = $props();

	const pct = (v: number): string => (v >= 0 ? `+${v}%` : `${v}%`);

	let ctaHref = $derived(
		buildLetsTalkHref(
			`Sustainability check: ${selected.map((c) => c.country).join(', ')} / ${category.label}`,
			`Hi Vector10,\n\nWe ran the sourcing footprint check with:\n` +
				`Countries: ${selected.map((c) => c.country).join(', ')}\n` +
				`Category: ${category.label}\n` +
				`Result: ~${estimate.carbonPerTon.toLocaleString()} kg CO2e/ton (${pct(estimate.carbonVsCleanPct)} vs clean benchmark), compliance risk ${estimate.riskScore}/100 (${TIER_LABELS[estimate.riskTier]}).\n\n` +
				`We'd like to discuss how to improve this.\n`
		)
	);
</script>

<div class="result">
	<div class="result-stats">
		<div class="stat">
			<span class="stat-label">Est. carbon</span>
			<span class="stat-value">{estimate.carbonPerTon.toLocaleString()}</span>
			<span class="stat-unit">kg CO₂e/ton</span>
			<span class="stat-delta" class:bad={estimate.carbonVsCleanPct > 0}>
				{pct(estimate.carbonVsCleanPct)} vs clean benchmark
			</span>
		</div>
		<div class="stat">
			<span class="stat-label">Est. water</span>
			<span class="stat-value">{estimate.waterPerKg}</span>
			<span class="stat-unit">L/kg</span>
			<span class="stat-delta" class:bad={estimate.waterVsCleanPct > 0}>
				{pct(estimate.waterVsCleanPct)} vs clean benchmark
			</span>
		</div>
		<div class="stat">
			<span class="stat-label">Compliance risk</span>
			<span class="stat-value" style:color={TIER_COLORS[estimate.riskTier]}>{estimate.riskScore}</span>
			<span class="stat-unit">/100 · {TIER_LABELS[estimate.riskTier]}</span>
			<span class="stat-delta">biggest lever: {estimate.biggestLever.country}</span>
		</div>
	</div>

	<div class="triggered">
		<span class="triggered-label">Most triggered regulations for this mix:</span>
		{#each estimate.topRegulations as reg (reg.key)}
			<p class="reg-line"><strong>{REGULATION_LABELS[reg.key]}</strong> — {reg.reason}</p>
		{/each}
	</div>

	<div class="result-footer">
		<p class="disclaimer">
			Directional estimate from country-level data — not a product LCA. Vector10 builds the real
			picture with you.
		</p>
		<a class="cta-btn" href={ctaHref}>Let's Talk about your exposure</a>
	</div>
</div>

<style>
	.result {
		border-top: 1px solid var(--border-subtle);
		padding-top: var(--space-5);
	}

	.result-stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-4);
		margin-bottom: var(--space-4);
	}

	.stat {
		display: flex;
		flex-direction: column;
		padding: var(--space-3);
		background: var(--bg-primary);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-lg);
	}

	.stat-label {
		font-size: var(--text-xs);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-tertiary);
	}

	.stat-value {
		font-size: var(--text-2xl);
		font-weight: 700;
		font-family: var(--font-mono);
		color: var(--text-primary);
		margin-top: var(--space-1);
	}

	.stat-unit {
		font-size: var(--text-xs);
		color: var(--text-tertiary);
	}

	.stat-delta {
		font-size: var(--text-xs);
		font-weight: 600;
		color: var(--eco-secondary);
		margin-top: var(--space-2);
	}

	.stat-delta.bad {
		color: var(--eco-risk);
	}

	.triggered {
		margin-bottom: var(--space-4);
	}

	.triggered-label {
		display: block;
		font-size: var(--text-xs);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-tertiary);
		margin-bottom: var(--space-2);
	}

	.reg-line {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: 1.6;
		margin-bottom: var(--space-1);
	}

	.reg-line strong {
		color: var(--text-primary);
	}

	.result-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-4);
	}

	.disclaimer {
		font-size: var(--text-xs);
		color: var(--text-tertiary);
		font-style: italic;
		max-width: 420px;
	}

	.cta-btn {
		flex-shrink: 0;
		padding: var(--space-3) var(--space-5);
		background: var(--eco-primary);
		color: white;
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		font-weight: 600;
		text-decoration: none;
		transition: opacity var(--transition-fast);
	}

	.cta-btn:hover {
		opacity: 0.85;
	}

	@media (max-width: 768px) {
		.result-stats {
			grid-template-columns: 1fr;
		}

		.result-footer {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
