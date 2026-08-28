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
	// if this slug is already open somewhere, don't create a duplicate —
	// just bring it to front and make sure it's visible (undoing a global
	// hide via the toolbar's eye button, if that's why it wasn't showing)
	const existing = floatingPanels.find((p) => p.slug === slug);
	if (existing) {
		visibilityState.hidden = false;
		focusPanel(existing.id);
		return;
	}

	const id = nextId++;
	nextZ += 1;

	const width = 560;
	const height = 440;

	// cascade new panels slightly so they don't stack exactly on top of
	// each other when opened in quick succession
	const offset = (floatingPanels.length % 6) * 24;

	const panel: FloatingPanel = {
		id,
		parentId,
		slug,
		title: slug,
		content: '',
		loading: true,
		x: (typeof window !== 'undefined' ? window.innerWidth / 2 : 0) - width / 2 + offset,
		y: (typeof window !== 'undefined' ? window.innerHeight / 2 : 0) - height / 2 + offset,
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
