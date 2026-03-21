import { browser } from '$app/environment';

function createThemeStore() {
	let theme = $state<'light' | 'dark'>(getInitialTheme());

	function getInitialTheme(): 'light' | 'dark' {
		if (!browser) return 'dark';
		const stored = localStorage.getItem('vector10-theme');
		if (stored === 'light' || stored === 'dark') return stored;
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}

	function toggle() {
		theme = theme === 'light' ? 'dark' : 'light';
		if (browser) {
			localStorage.setItem('vector10-theme', theme);
			document.documentElement.dataset.theme = theme;
		}
	}

	function apply() {
		if (browser) {
			document.documentElement.dataset.theme = theme;
		}
	}

	return {
		get current() { return theme; },
		get isDark() { return theme === 'dark'; },
		toggle,
		apply
	};
}

export const themeStore = createThemeStore();
