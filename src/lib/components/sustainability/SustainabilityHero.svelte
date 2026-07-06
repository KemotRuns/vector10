<script lang="ts">
	import { buildLetsTalkHref } from '$lib/utils/mailto';

	interface Props {
		countryCount: number;
	}

	let { countryCount }: Props = $props();

	const ctaHref = buildLetsTalkHref('Sourcing compliance & footprint — introduction');
</script>

<header class="hero">
	<div class="hero-text">
		<h1>
			<svg
				class="leaf-icon"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.8 10-10 10Z" />
				<path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
			</svg>
			Sourcing Compliance &amp; Footprint
		</h1>
		<p class="standfirst">
			Where you source determines your compliance risk. CSRD reporting is live, textile EPR is
			spreading across the EU, and Digital Product Passports are coming — here is how that maps
			across {countryCount} sourcing countries.
		</p>
	</div>
	<a class="cta-btn" href={ctaHref}>Let's Talk</a>
</header>

<style>
	.hero {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-4);
	}

	h1 {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		font-size: var(--text-3xl);
		font-weight: 700;
		letter-spacing: -0.03em;
		color: var(--eco-primary);
	}

	:global([data-theme='dark']) h1 {
		color: var(--eco-secondary);
	}

	.leaf-icon {
		width: 32px;
		height: 32px;
		color: var(--eco-secondary);
		flex-shrink: 0;
	}

	.standfirst {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		margin-top: var(--space-2);
		max-width: 640px;
		line-height: 1.6;
	}

	.cta-btn {
		flex-shrink: 0;
		padding: var(--space-2) var(--space-4);
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
		.hero {
			flex-direction: column;
		}

		h1 {
			font-size: var(--text-2xl);
		}

		.leaf-icon {
			width: 24px;
			height: 24px;
		}
	}
</style>
