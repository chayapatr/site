import { getContent } from '$lib/content/content';

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

// panel x/y are stored in world coordinates; canvasOffset is how far the
// viewport has been panned. A panel's actual screen position is always
// panel.x - canvasOffset.x (see FloatingPanel.svelte). Dragging empty canvas
// space pans by moving this offset instead of moving every panel.
export const canvasState = $state<{ x: number; y: number }>({ x: 0, y: 0 });

export function panCanvasBy(dx: number, dy: number) {
	canvasState.x += dx;
	canvasState.y += dy;
}

export function resetCanvasPan() {
	canvasState.x = 0;
	canvasState.y = 0;
}

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
	// same breakpoint MainView uses for its own mobile layout
	const isNarrow = viewportWidth < 768;

	// mobile windows stay small and draggable (matching the v10 reference:
	// a fixed 320px width, height capped at 400px) rather than going
	// near-fullscreen — the point of a floating panel is that it floats
	// over the content, which a fullscreen sheet defeats
	const width = isNarrow ? Math.min(320, viewportWidth - 24) : 560;
	const height = isNarrow ? Math.min(400, viewportHeight / 2) : 440;

	// cascade new panels slightly so they don't stack exactly on top of
	// each other when opened in quick succession
	const offset = (floatingPanels.length % 6) * 24;

	// new panels open centered in the current *viewport*, not the world
	// origin — world coords are screen coords plus however far the canvas
	// has been panned
	const panel: FloatingPanel = {
		id,
		parentId,
		slug,
		title: slug,
		content: '',
		loading: true,
		x: viewportWidth / 2 - width / 2 + offset + canvasState.x,
		y: viewportHeight / 2 - height / 2 + offset + canvasState.y,
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
