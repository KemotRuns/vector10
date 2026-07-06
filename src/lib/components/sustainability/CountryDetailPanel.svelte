<script lang="ts">
	import type { CountrySustainability, SourceCitation, RegulationKey, ExposureTier } from '$lib/types/sustainability';
	import { TIER_COLORS, TIER_LABELS, REGULATION_LABELS, REGULATION_NAMES } from '$lib/types/sustainability';
	import { buildLetsTalkHref } from '$lib/utils/mailto';

	interface Props {
		country: CountrySustainability;
		all: CountrySustainability[];
		sources: Record<string, SourceCitation>;
		onClose: () => void;
	}

	let { country, all, sources, onClose }: Props = $props();

	const median = (values: number[]): number => {
		const sorted = [...values].sort((a, b) => a - b);
		const mid = Math.floor(sorted.length / 2);
		return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
	};

	interface BarMetric {
		label: string;
		value: number;
		medianValue: number;
		unit: string;
		lowerIsBetter: boolean;
	}

	let metrics = $derived<BarMetric[]>([
		{
			label: 'Carbon footprint',
			value: country.carbonPerTon,
			medianValue: median(all.map((c) => c.carbonPerTon)),
			unit: 'kg CO₂e/ton',
			lowerIsBetter: true
		},
		{
			label: 'Water usage',
			value: country.waterPerKg,
			medianValue: median(all.map((c) => c.waterPerKg)),
			unit: 'L/kg',
			lowerIsBetter: true
		},
		{
			label: 'Grid intensity',
			value: country.gridCarbonIntensity,
			medianValue: median(all.map((c) => c.gridCarbonIntensity)),
			unit: 'gCO₂/kWh',
			lowerIsBetter: true
		},
		{
			label: 'Low-carbon electricity',
			value: country.lowCarbonShare,
			medianValue: median(all.map((c) => c.lowCarbonShare)),
			unit: '%',
			lowerIsBetter: false
		}
	]);

	let regulations = $derived<{ key: RegulationKey; tier: ExposureTier; detail: string }[]>([
		{ key: 'cbam', tier: country.cbamExposure, detail: 'exposure if extended to textiles' },
		{ key: 'csrd', tier: country.csrdExposure, detail: 'value-chain reporting pull-in' },
		{ key: 'epr', tier: country.eprExposure, detail: 'textile EPR fee exposure' },
		{
			key: 'dpp',
			tier: country.dppReadiness >= 60 ? 'low' : country.dppReadiness >= 35 ? 'medium' : 'high',
			detail: `readiness ${country.dppReadiness}/100`
		}
	]);

	let citations = $derived(country.sourceIds.map((id) => sources[id]).filter(Boolean));

	let ctaHref = $derived(
		buildLetsTalkHref(
			`Sourcing exposure: ${country.country}`,
			`Hi Vector10,\n\nWe source from ${country.country} and would like to understand our compliance exposure and options.\n`
		)
	);

	const barWidth = (m: BarMetric): number =>
		Math.min(100, (m.value / Math.max(m.value, m.medianValue * 2)) * 100);
	const medianPos = (m: BarMetric): number =>
		Math.min(100, (m.medianValue / Math.max(m.value, m.medianValue * 2)) * 100);
	const isWorse = (m: BarMetric): boolean =>
		m.lowerIsBetter ? m.value > m.medianValue : m.value < m.medianValue;
</script>

<div class="detail card">
	<div class="detail-header">
		<div>
			<h3 class="detail-title">{country.country}</h3>
			<p class="detail-sub">
				{country.region} · {country.euExportShare}% of textile exports go to the EU
				{#if country.notes}· {country.notes}{/if}
			</p>
		</div>
		<button class="close-btn" onclick={onClose} aria-label="Close country detail">✕</button>
	</div>

	<div class="detail-grid">
		<div class="metrics">
			<h4 class="block-title">Footprint vs. 43-country median</h4>
			{#each metrics as m (m.label)}
				<div class="metric-row">
					<span class="metric-label">{m.label}</span>
					<div class="bar-track">
						<div class="bar" class:worse={isWorse(m)} style:width="{barWidth(m)}%"></div>
						<div class="median-tick" style:left="{medianPos(m)}%" title="Dataset median"></div>
					</div>
					<span class="metric-value">{m.value.toLocaleString()} {m.unit}</span>
				</div>
			{/each}
		</div>

		<div class="regs">
			<h4 class="block-title">
				Regulatory exposure <span class="v10-badge">Vector10 assessment</span>
			</h4>
			<div class="chips">
				{#each regulations as reg (reg.key)}
					<div class="chip" style:border-color={TIER_COLORS[reg.tier]} title={REGULATION_NAMES[reg.key]}>
						<span class="chip-name">{REGULATION_LABELS[reg.key]}</span>
						<span class="chip-tier" style:color={TIER_COLORS[reg.tier]}>{TIER_LABELS[reg.tier]}</span>
						<span class="chip-detail">{reg.detail}</span>
					</div>
				{/each}
			</div>
			<div class="scores">
				<span>Footprint score <strong>{country.footprintScore}</strong>/100</span>
				<span>Compliance risk <strong>{country.complianceRiskScore}</strong>/100</span>
			</div>
		</div>
	</div>

	<div class="detail-footer">
		<p class="sources-line">
			Sources: {#each citations as c, i (c.label)}{c.publisher} ({c.year}){i < citations.length - 1 ? ' · ' : ''}{/each}
		</p>
		<a class="micro-cta" href={ctaHref}>Sourcing from {country.country}? Ask us about your exposure →</a>
	</div>
</div>

<style>
	.detail {
		padding: var(--space-5);
		border-radius: var(--radius-xl);
		background: var(--eco-bg-tint);
	}

	.detail-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: var(--space-4);
	}

	.detail-title {
		font-size: var(--text-xl);
		font-weight: 700;
		color: var(--eco-primary);
	}

	:global([data-theme='dark']) .detail-title {
		color: var(--eco-secondary);
	}

	.detail-sub {
		font-size: var(--text-xs);
		color: var(--text-tertiary);
		font-family: var(--font-mono);
		margin-top: var(--space-1);
	}

	.close-btn {
		border: none;
		background: none;
		color: var(--text-tertiary);
		font-size: var(--text-base);
		cursor: pointer;
		padding: var(--space-1);
	}

	.close-btn:hover {
		color: var(--text-primary);
	}

	.detail-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-6);
	}

	.block-title {
		font-size: var(--text-xs);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-tertiary);
		margin-bottom: var(--space-3);
	}

	.v10-badge {
		display: inline-block;
		font-size: 10px;
		text-transform: none;
		letter-spacing: 0;
		font-weight: 600;
		padding: 1px 8px;
		border-radius: var(--radius-full);
		background: var(--eco-primary);
		color: white;
		margin-left: var(--space-2);
	}

	.metric-row {
		display: grid;
		grid-template-columns: 130px 1fr auto;
		align-items: center;
		gap: var(--space-3);
		margin-bottom: var(--space-2);
	}

	.metric-label {
		font-size: var(--text-xs);
		color: var(--text-secondary);
	}

	.bar-track {
		position: relative;
		height: 8px;
		background: var(--bg-tertiary);
		border-radius: var(--radius-full);
	}

	.bar {
		height: 100%;
		border-radius: var(--radius-full);
		background: var(--eco-secondary);
	}

	.bar.worse {
		background: var(--eco-risk);
	}

	.median-tick {
		position: absolute;
		top: -3px;
		width: 2px;
		height: 14px;
		background: var(--text-tertiary);
	}

	.metric-value {
		font-size: var(--text-xs);
		font-family: var(--font-mono);
		color: var(--text-primary);
		white-space: nowrap;
	}

	.chips {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-2);
	}

	.chip {
		border: 1px solid;
		border-radius: var(--radius-md);
		padding: var(--space-2) var(--space-3);
		background: var(--bg-primary);
	}

	.chip-name {
		font-size: var(--text-xs);
		font-weight: 700;
		color: var(--text-primary);
		margin-right: var(--space-2);
	}

	.chip-tier {
		font-size: var(--text-xs);
		font-weight: 700;
	}

	.chip-detail {
		display: block;
		font-size: 10px;
		color: var(--text-tertiary);
		margin-top: 2px;
	}

	.scores {
		display: flex;
		gap: var(--space-4);
		margin-top: var(--space-3);
		font-size: var(--text-xs);
		color: var(--text-secondary);
	}

	.scores strong {
		color: var(--eco-primary);
	}

	:global([data-theme='dark']) .scores strong {
		color: var(--eco-secondary);
	}

	.detail-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-4);
		margin-top: var(--space-4);
		padding-top: var(--space-3);
		border-top: 1px solid var(--border-subtle);
	}

	.sources-line {
		font-size: 10px;
		color: var(--text-tertiary);
	}

	.micro-cta {
		font-size: var(--text-xs);
		font-weight: 600;
		color: var(--eco-primary);
		text-decoration: none;
		white-space: nowrap;
	}

	:global([data-theme='dark']) .micro-cta {
		color: var(--eco-secondary);
	}

	.micro-cta:hover {
		text-decoration: underline;
	}

	@media (max-width: 768px) {
		.detail-grid {
			grid-template-columns: 1fr;
		}

		.detail-footer {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
