import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

function getInitialTheme(): 'light' | 'dark' {
	if (!browser) return 'dark';
	const stored = localStorage.getItem('vector10-theme');
	if (stored === 'light' || stored === 'dark') return stored;
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const theme = writable<'light' | 'dark'>(getInitialTheme());
export const isDark = derived(theme, ($theme) => $theme === 'dark');

export function toggleTheme() {
	theme.update((current) => {
		const next = current === 'light' ? 'dark' : 'light';
		if (browser) {
			localStorage.setItem('vector10-theme', next);
			document.documentElement.dataset.theme = next;
		}
		return next;
	});
}

export function applyTheme() {
	if (browser) {
		const unsub = theme.subscribe((value) => {
			document.documentElement.dataset.theme = value;
		});
		// Immediately unsubscribe — we just needed to read the value once
		unsub();
	}
}
