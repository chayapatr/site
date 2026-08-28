import { getContent } from '$lib/content';

export type FloatingPanel = {
	id: number;
	parentId: number | null;
	slug: string;
	title: string;
	content: string;
	loading: boolean;
	x: number;
	y: number;
	z: number;
	width: number;
	height: number;
};

let nextId = 1;
let nextZ = 1;

export const floatingPanels = $state<FloatingPanel[]>([]);
export const focusState = $state<{ id: number | null }>({ id: null });
// hides the dim overlay + panels + connectors while keeping the toolbar
// itself visible (so it can be toggled back on) — separate from actually
// closing panels, which discards them
export const visibilityState = $state<{ hidden: boolean }>({ hidden: false });

export function focusPanel(id: number) {
	const panel = floatingPanels.find((p) => p.id === id);
	if (!panel) return;
	nextZ += 1;
	panel.z = nextZ;
	focusState.id = id;
}

export async function openFloatingPanel(slug: string, parentId: number | null = null) {
	// opening a panel — whether it dedupes to an existing one or creates a
	// new one below — always means the user wants to see it
	visibilityState.hidden = false;

	// if this slug is already open somewhere, don't create a duplicate —
	// just bring it to front
	const existing = floatingPanels.find((p) => p.slug === slug);
	if (existing) {
		focusPanel(existing.id);
		return;
	}

	const id = nextId++;
	nextZ += 1;

	const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
	const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
	// a 560px draggable window doesn't fit a narrow viewport — below the
	// same breakpoint MainView uses for its own mobile layout, just open
	// panels near-fullscreen instead of cascading small windows offscreen
	const isNarrow = viewportWidth < 768;

	const width = isNarrow ? Math.max(280, viewportWidth - 24) : 560;
	const height = isNarrow ? Math.max(200, viewportHeight - 96) : 440;

	// cascade new panels slightly so they don't stack exactly on top of
	// each other when opened in quick succession (skip on mobile — panels
	// are already full-width, an offset would just push them off-screen)
	const offset = isNarrow ? 0 : (floatingPanels.length % 6) * 24;

	const panel: FloatingPanel = {
		id,
		parentId,
		slug,
		title: slug,
		content: '',
		loading: true,
		x: viewportWidth / 2 - width / 2 + offset,
		y: viewportHeight / 2 - height / 2 + offset,
		z: nextZ,
		width,
		height,
	};
	floatingPanels.push(panel);
	focusState.id = id;

	const { content } = await getContent(slug);
	const target = floatingPanels.find((p) => p.id === id);
	if (!target) return; // closed while loading
	target.content = content;
	target.loading = false;
}

export function closeFloatingPanel(id: number) {
	const index = floatingPanels.findIndex((p) => p.id === id);
	if (index !== -1) floatingPanels.splice(index, 1);
	if (focusState.id === id) focusState.id = null;
}
