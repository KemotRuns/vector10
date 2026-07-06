<script lang="ts">
	import { buildLetsTalkHref } from '$lib/utils/mailto';

	const ctaHref = buildLetsTalkHref('Sourcing compliance & footprint — how can Vector10 help?');
</script>

<div class="cta-band">
	<div class="cta-text">
		<h3 class="cta-title">Your buyers' auditors will ask. Have the answers first.</h3>
		<p class="cta-sub">
			Vector10 helps manufacturers cut their footprint and helps brands turn compliance pressure
			into competitive advantage — from supplier transition plans to Digital Product Passport
			readiness.
		</p>
	</div>
	<a class="cta-btn" href={ctaHref}>Let's Talk</a>
</div>

<style>
	.cta-band {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-6);
		padding: var(--space-6);
		background: var(--eco-primary);
		border-radius: var(--radius-xl);
		color: white;
	}

	.cta-title {
		font-size: var(--text-xl);
		font-weight: 700;
		letter-spacing: -0.02em;
	}

	.cta-sub {
		font-size: var(--text-sm);
		opacity: 0.85;
		margin-top: var(--space-2);
		max-width: 560px;
		line-height: 1.6;
	}

	.cta-btn {
		flex-shrink: 0;
		padding: var(--space-3) var(--space-6);
		background: white;
		color: var(--eco-primary);
		border-radius: var(--radius-md);
		font-size: var(--text-base);
		font-weight: 700;
		text-decoration: none;
		transition: opacity var(--transition-fast);
	}

	.cta-btn:hover {
		opacity: 0.9;
	}

	@media (max-width: 768px) {
		.cta-band {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
