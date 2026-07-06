<script lang="ts">
	import type { SourceCitation } from '$lib/types/sustainability';
	import { PROVENANCE_LABELS } from '$lib/types/sustainability';

	interface Props {
		sources: Record<string, SourceCitation>;
		generatedAt: string;
	}

	let { sources, generatedAt }: Props = $props();

	let publicSources = $derived(Object.values(sources).filter((s) => s.kind === 'public'));
	let v10Sources = $derived(Object.values(sources).filter((s) => s.kind === 'vector10-assessment'));
</script>

<div class="methodology">
	<h4 class="methodology-title">Methodology &amp; provenance</h4>

	<div class="legend">
		<span class="legend-item"><span class="dot public"></span>{PROVENANCE_LABELS.public} — cited as-is</span>
		<span class="legend-item"><span class="dot modeled"></span>{PROVENANCE_LABELS.modeled} — computed from public data with a disclosed formula</span>
		<span class="legend-item"><span class="dot v10"></span>{PROVENANCE_LABELS['vector10-assessment']} — expert judgment by Vector10 consultants</span>
	</div>

	<p><strong>Public data</strong> — Grid carbon intensity and low-carbon electricity share (Ember), baseline water stress (WRI Aqueduct 4.0), workers' rights ratings (ITUC Global Rights Index), EU export shares (UN Comtrade, HS 50–63), garment-sector labour costs (ILO), and tariff preference status into the EU and US (FTAs, customs union, GSP/EBA; the 2025 AGOA lapse is reflected).</p>
	<p><strong>Modeled</strong> — <strong>Carbon footprint</strong>: grid intensity × ~5 MWh electricity per ton of textile, plus a process-heat adder by dominant fiber base (cotton 1,200 / mixed 1,050 / synthetic 950 kg CO₂e). <strong>Water usage</strong>: Water Footprint Network assessments weighted by national fiber mix. <strong>Transparency</strong>: Fashion Transparency Index results supplemented by national disclosure legislation.</p>
	<p><strong>Vector10 assessments</strong> — CBAM, CSRD and EPR exposure tiers, Digital Product Passport readiness, and UFLPA (US forced-labor import ban) exposure reflect our consultants' judgment of forward-looking regulatory exposure, anchored on each country's export dependence, energy base, input supply chains and traceability infrastructure. CBAM does not yet cover textiles; the tier expresses exposure if scope extends as debated.</p>
	<p><strong>Composite scores</strong> — <strong>Footprint score</strong> (higher = cleaner): carbon 40%, water usage 20%, water stress 20%, low-carbon share 20%, min-max normalized. <strong>Compliance risk is market-conditional</strong>: for EU &amp; UK selling markets it weighs CSRD 25%, EPR 20%, CBAM 20%, DPP gap 20%, labor risk 15%; for North America it weighs UFLPA 45%, labor risk 25%, traceability gap 20%, transparency gap 10%; Japan &amp; Korea and Rest-of-world carry damped labor/transparency formulas reflecting today's lighter textile regulation. Selecting several markets averages their scores.</p>
	<p><strong>Cost index</strong> (higher = costlier, directional) — labour cost 60% (log-scaled across the dataset), tariff treatment into your selling market 25% (duty-free / reduced / full MFN / penalty), shipping lead-time tier 15%. It is an index for comparing countries, not a landed-cost calculation — that requires product-level modeling, which is consulting work, not a web page.</p>
	<p><strong>Limits</strong> — All figures are country-level and directional; they are not a substitute for a product LCA or supplier audit. Data assembled {generatedAt}.</p>

	<div class="sources">
		<span class="sources-heading">Sources:</span>
		{#each publicSources as s (s.label)}
			<a class="source-link" href={s.url} target="_blank" rel="noopener noreferrer">{s.publisher} — {s.label} ({s.year})</a>
		{/each}
		{#each v10Sources as s (s.label)}
			<span class="source-link v10-source">{s.publisher} — {s.label} ({s.year})</span>
		{/each}
	</div>
</div>

<style>
	.methodology {
		padding: var(--space-4);
		font-size: var(--text-xs);
		color: var(--text-tertiary);
		line-height: 1.6;
		border-top: 1px solid var(--border-subtle);
	}

	.methodology-title {
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--eco-primary);
		margin-bottom: var(--space-2);
	}

	:global([data-theme='dark']) .methodology-title {
		color: var(--eco-secondary);
	}

	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-4);
		margin-bottom: var(--space-3);
		padding: var(--space-2) var(--space-3);
		background: var(--eco-bg-tint);
		border-radius: var(--radius-md);
	}

	.legend-item {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.dot.public {
		background: var(--eco-accent);
	}

	.dot.modeled {
		background: var(--eco-warm);
	}

	.dot.v10 {
		background: var(--eco-primary);
	}

	.methodology p {
		margin-bottom: var(--space-2);
	}

	.sources {
		display: flex;
		flex-direction: column;
		gap: 2px;
		margin-top: var(--space-3);
	}

	.sources-heading {
		font-weight: 600;
	}

	.source-link {
		color: var(--text-tertiary);
	}

	a.source-link:hover {
		color: var(--eco-primary);
	}
</style>
