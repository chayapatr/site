export type SidebarDisplayMode = 'number' | 'ruler';
export type FontChoice = 'sans' | 'serif' | 'mono';
export type Theme = 'light' | 'dark' | 'auto';

type SidebarPrefs = {
	displayMode: SidebarDisplayMode;
	headerFont: FontChoice;
	bodyFont: FontChoice;
	theme: Theme;
};

const STORAGE_KEY = 'pub-sidebar-prefs';

const defaults: SidebarPrefs = {
	displayMode: 'number',
	headerFont: 'sans',
	bodyFont: 'serif',
	theme: 'auto',
};

function loadPrefs(): SidebarPrefs {
	if (typeof localStorage === 'undefined') return { ...defaults };
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return { ...defaults };
		return { ...defaults, ...JSON.parse(raw) };
	} catch {
		return { ...defaults };
	}
}

export const sidebar = $state({
	open: false,
	...loadPrefs(),
});

// tracks the OS-level preference live, so "Auto" updates immediately if the
// system theme changes while the page is open (not just on reload)
export const systemTheme = $state<{ current: 'light' | 'dark' }>({
	current:
		typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches
			? 'dark'
			: 'light',
});

if (typeof matchMedia !== 'undefined') {
	matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
		systemTheme.current = e.matches ? 'dark' : 'light';
	});
}

// what actually gets applied to the page — resolves "auto" against the live
// system preference, otherwise the explicit user choice
export function resolvedTheme(): 'light' | 'dark' {
	return sidebar.theme === 'auto' ? systemTheme.current : sidebar.theme;
}

// persists only the actual preferences (not the open/closed drawer state,
// which shouldn't survive a reload) whenever one of them changes
export function persistSidebarPrefs() {
	if (typeof localStorage === 'undefined') return;
	const { displayMode, headerFont, bodyFont, theme } = sidebar;
	localStorage.setItem(STORAGE_KEY, JSON.stringify({ displayMode, headerFont, bodyFont, theme }));
}

export function resetSidebarPrefs() {
	sidebar.displayMode = defaults.displayMode;
	sidebar.headerFont = defaults.headerFont;
	sidebar.bodyFont = defaults.bodyFont;
	sidebar.theme = defaults.theme;
	persistSidebarPrefs();
}
