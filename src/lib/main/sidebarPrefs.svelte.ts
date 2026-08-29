export type SidebarDisplayMode = 'number' | 'ruler';
export type FontChoice = 'sans' | 'serif' | 'mono';
export type Theme = 'light' | 'dark';

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
	theme: 'light',
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
