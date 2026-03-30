<script lang="ts">
	import { page } from '$app/state';
	import { isDark, toggleTheme } from '$lib/stores/theme';
	import v10Logo from '$lib/assets/v10-logo.svg';

	const navItems = [
		{ href: '/', label: 'Overview' },
		{ href: '/trade-flows', label: 'Trade Flows' },
		{ href: '/consumer-spending', label: 'Consumer Spending' },
		{ href: '/sustainability', label: 'Sustainability' }
	];

	let mobileOpen = $state(false);

	function closeMenu() {
		mobileOpen = false;
	}
</script>

<nav class="nav">
	<div class="nav-inner">
		<a href="/" class="logo" onclick={closeMenu}>
			<img src={v10Logo} alt="V10" class="logo-img" />
		</a>

		<div class="nav-links" class:open={mobileOpen}>
			{#each navItems as item}
				<a
					href={item.href}
					class="nav-link"
					class:active={page.url.pathname === item.href}
					onclick={closeMenu}
				>
					{item.label}
				</a>
			{/each}
		</div>

		<div class="nav-actions">
			<button class="theme-toggle" onclick={toggleTheme} aria-label="Toggle theme">
				{#if $isDark}
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="5"/>
						<line x1="12" y1="1" x2="12" y2="3"/>
						<line x1="12" y1="21" x2="12" y2="23"/>
						<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
						<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
						<line x1="1" y1="12" x2="3" y2="12"/>
						<line x1="21" y1="12" x2="23" y2="12"/>
						<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
						<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
					</svg>
				{:else}
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
					</svg>
				{/if}
			</button>

			<button
				class="hamburger"
				onclick={() => mobileOpen = !mobileOpen}
				aria-label="Toggle menu"
				aria-expanded={mobileOpen}
			>
				{#if mobileOpen}
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
					</svg>
				{:else}
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
					</svg>
				{/if}
			</button>
		</div>
	</div>
</nav>

<style>
	.nav {
		position: sticky;
		top: 0;
		z-index: 100;
		height: var(--nav-height);
		background: var(--bg-primary);
		border-bottom: 1px solid var(--border-default);
		backdrop-filter: blur(12px);
		background: color-mix(in srgb, var(--bg-primary) 85%, transparent);
	}

	.nav-inner {
		max-width: var(--content-max-width);
		margin: 0 auto;
		padding: 0 var(--space-6);
		height: 100%;
		display: flex;
		align-items: center;
		gap: var(--space-8);
	}

	.logo {
		display: flex;
		align-items: center;
		text-decoration: none;
		flex-shrink: 0;
	}

	.logo-img {
		height: 20px;
		width: auto;
		filter: var(--logo-filter, none);
	}

	.nav-links {
		display: flex;
		gap: var(--space-1);
		flex: 1;
	}

	.nav-link {
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--text-secondary);
		transition: all var(--transition-fast);
		white-space: nowrap;
	}

	.nav-link:hover {
		color: var(--text-primary);
		background: var(--bg-tertiary);
	}

	.nav-link.active {
		color: var(--accent-primary);
		background: color-mix(in srgb, var(--accent-primary) 10%, transparent);
	}

	.nav-actions {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		flex-shrink: 0;
	}

	.theme-toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border: 1px solid var(--border-default);
		border-radius: var(--radius-md);
		background: var(--bg-secondary);
		color: var(--text-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.theme-toggle:hover {
		color: var(--text-primary);
		border-color: var(--border-strong);
		background: var(--bg-tertiary);
	}

	.hamburger {
		display: none;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border: 1px solid var(--border-default);
		border-radius: var(--radius-md);
		background: var(--bg-secondary);
		color: var(--text-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.hamburger:hover {
		color: var(--text-primary);
		border-color: var(--border-strong);
		background: var(--bg-tertiary);
	}

	@media (max-width: 768px) {
		.nav {
			height: auto;
			min-height: var(--nav-height);
		}

		.nav-inner {
			flex-wrap: wrap;
			padding: 0 var(--space-4);
			min-height: var(--nav-height);
		}

		.hamburger {
			display: flex;
		}

		.nav-links {
			display: none;
			flex-direction: column;
			width: 100%;
			gap: 0;
			padding-bottom: var(--space-3);
			border-top: 1px solid var(--border-subtle);
			order: 3;
		}

		.nav-links.open {
			display: flex;
		}

		.nav-link {
			padding: var(--space-3) var(--space-3);
			border-radius: var(--radius-md);
			font-size: var(--text-base);
		}

		.nav-actions {
			margin-left: auto;
		}
	}
</style>
