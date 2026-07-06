<script lang="ts">
	import { HS_CHAPTER_LABELS } from '$lib/types/trade';
</script>

<svelte:head>
	<title>Vector10 — Textile Intelligence Dashboards</title>
</svelte:head>

<div class="landing">
	<section class="hero">
		<div class="hero-badge">Textile Intelligence</div>
		<h1>Data-driven insights for the global textile industry</h1>
		<p class="hero-subtitle">
			Interactive dashboards tracking trade flows, market dynamics, and industry trends
			across HS codes 50–63.
		</p>
		<a href="/trade-flows" class="cta-btn">
			Explore Trade Flows
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<line x1="5" y1="12" x2="19" y2="12"/>
				<polyline points="12 5 19 12 12 19"/>
			</svg>
		</a>
	</section>

	<section class="dashboards">
		<h2 class="section-title">Dashboards</h2>
		<div class="dashboard-grid">
			<a href="/trade-flows" class="dashboard-card card">
				<div class="card-icon">
					<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<circle cx="12" cy="12" r="10"/>
						<line x1="2" y1="12" x2="22" y2="12"/>
						<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
					</svg>
				</div>
				<div class="card-content">
					<h3>Global Trade Flows</h3>
					<p>Visualize bilateral textile trade between countries using UN Comtrade data. Interactive globe, Sankey diagrams, and market share treemaps.</p>
					<span class="card-tag">Live</span>
				</div>
			</a>

			<a href="/consumer-spending" class="dashboard-card card">
				<div class="card-icon">
					<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<circle cx="8" cy="14" r="3"/><circle cx="16" cy="8" r="5"/>
						<circle cx="12" cy="18" r="2"/><circle cx="18" cy="16" r="2.5"/>
					</svg>
				</div>
				<div class="card-content">
					<h3>Consumer Spending</h3>
					<p>Compare annual apparel spend per person vs. items purchased across 30 global markets. Identify premium vs. volume positioning.</p>
					<span class="card-tag">Live</span>
				</div>
			</a>

			<a href="/taiwan" class="dashboard-card card">
				<div class="card-icon">
					<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<circle cx="12" cy="12" r="10"/>
						<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
						<line x1="12" y1="8" x2="18" y2="12"/><line x1="12" y1="8" x2="6" y2="12"/>
					</svg>
				</div>
				<div class="card-content">
					<h3>Taiwan Trade Lens</h3>
					<p>Taiwan textile trade flows by country and HS chapter. Taiwan is excluded from UN Comtrade — this dashboard uses customs data directly.</p>
					<span class="card-tag">Live</span>
				</div>
			</a>

			<a href="/sustainability" class="dashboard-card card">
				<div class="card-icon">
					<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.8 10-10 10Z"/>
						<path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
					</svg>
				</div>
				<div class="card-content">
					<h3>Sustainability & Compliance</h3>
					<p>Footprint and 2026 regulatory exposure — CSRD, CBAM, EPR and Digital Product Passports — across 43 sourcing countries, with an interactive footprint check.</p>
					<span class="card-tag">Live</span>
				</div>
			</a>
		</div>
	</section>

	<section class="hs-codes">
		<h2 class="section-title">Textile HS Classifications</h2>
		<p class="section-subtitle">Harmonized System codes 50–63 covering the full textile value chain</p>
		<div class="hs-grid">
			{#each Object.entries(HS_CHAPTER_LABELS) as [code, label]}
				<div class="hs-chip">
					<span class="hs-code">{code}</span>
					<span class="hs-label">{label}</span>
				</div>
			{/each}
		</div>
	</section>
</div>

<style>
	.landing {
		display: flex;
		flex-direction: column;
		gap: var(--space-16);
		padding-top: var(--space-8);
		padding-bottom: var(--space-16);
	}

	.hero {
		text-align: center;
		max-width: 700px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-4);
	}

	.hero-badge {
		font-size: var(--text-xs);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--accent-primary);
		background: color-mix(in srgb, var(--accent-primary) 10%, transparent);
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-full);
		border: 1px solid color-mix(in srgb, var(--accent-primary) 20%, transparent);
	}

	.hero h1 {
		font-size: var(--text-4xl);
		font-weight: 700;
		letter-spacing: -0.03em;
		line-height: 1.15;
		color: var(--text-primary);
	}

	.hero-subtitle {
		font-size: var(--text-lg);
		color: var(--text-secondary);
		line-height: 1.7;
	}

	.cta-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-6);
		background: var(--accent-primary);
		color: white;
		border-radius: var(--radius-md);
		font-weight: 600;
		font-size: var(--text-sm);
		transition: all var(--transition-fast);
		margin-top: var(--space-2);
	}

	.cta-btn:hover {
		background: var(--accent-primary-hover);
		color: white;
		transform: translateY(-1px);
		box-shadow: var(--shadow-md);
	}

	.section-title {
		font-size: var(--text-xl);
		font-weight: 600;
		color: var(--text-primary);
		margin-bottom: var(--space-2);
	}

	.section-subtitle {
		font-size: var(--text-sm);
		color: var(--text-tertiary);
		margin-bottom: var(--space-6);
	}

	.dashboard-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: var(--space-4);
		margin-top: var(--space-4);
	}

	.dashboard-card {
		display: flex;
		gap: var(--space-4);
		text-decoration: none;
		color: inherit;
		transition: all var(--transition-fast);
	}

	a.dashboard-card:hover {
		border-color: var(--accent-primary);
		box-shadow: var(--shadow-lg);
		transform: translateY(-2px);
	}

	.card-icon {
		flex-shrink: 0;
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg-secondary);
		border-radius: var(--radius-md);
		color: var(--accent-primary);
	}

	.card-content h3 {
		font-size: var(--text-base);
		font-weight: 600;
		margin-bottom: var(--space-1);
	}

	.card-content p {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: 1.6;
		margin-bottom: var(--space-2);
	}

	.card-tag {
		font-size: var(--text-xs);
		font-weight: 600;
		padding: 2px 8px;
		border-radius: var(--radius-full);
		background: color-mix(in srgb, var(--accent-success) 15%, transparent);
		color: var(--accent-success);
	}

	.card-tag.muted {
		background: var(--bg-tertiary);
		color: var(--text-tertiary);
	}

	.hs-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		gap: var(--space-2);
	}

	.hs-chip {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		background: var(--bg-card);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
		transition: border-color var(--transition-fast);
	}

	.hs-chip:hover {
		border-color: var(--border-strong);
	}

	.hs-code {
		font-family: var(--font-mono);
		font-weight: 600;
		font-size: var(--text-sm);
		color: var(--accent-primary);
		min-width: 24px;
	}

	.hs-label {
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}

	@media (max-width: 768px) {
		.hero h1 { font-size: var(--text-2xl); }
		.dashboard-grid { grid-template-columns: 1fr; }
		.hs-grid { grid-template-columns: 1fr 1fr; }
	}
</style>
