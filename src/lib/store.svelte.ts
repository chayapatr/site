import { onMount } from 'svelte';
import type { ProjectType } from '$lib/projects';
import { projects } from '$lib/projects';

// --- view mode ---
export const view = $state({
	splitView: true,
	isMobile: false,
	showGallery: false,
	showOS: false,
});

// --- gallery filter ---
export const gallery = $state({
	activeFilter: null as ProjectType | null,
	listView: false,
});

export const allTypes: ProjectType[] = ['Art & Design', 'Media', 'Community', 'Research', 'Engineering'];

export function visibleGroups() {
	return projects
		.map((g) => ({
			year: g.year,
			projects: gallery.activeFilter
				? g.projects.filter((p) => p.types.includes(gallery.activeFilter!))
				: g.projects,
		}))
		.filter((g) => g.projects.length > 0);
}
