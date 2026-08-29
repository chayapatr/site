<script lang="ts">
	import { fade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import type { ProjectType } from '$lib/content/projects';
	import { sidebar } from '$lib/main/sidebarPrefs.svelte';

	type ProjectGroup = { year: number; projects: { title: string; image: string; types: ProjectType[]; size?: '2x1' | '2x2' }[] };

	type Props = {
		visibleGroups: ProjectGroup[];
		allTypes: ProjectType[];
		activeFilter: ProjectType | null;
		listView: boolean;
		mobile?: boolean;
	};

	let { visibleGroups, allTypes, activeFilter = $bindable(), listView = $bindable(), mobile = false }: Props = $props();

	const lightColors: Record<string, [string, string]> = {
		'Art & Design': ['#FAE8E8', '#B83537'],
		'Research': ['#DDEAF5', '#2E5F8A'],
		'Engineering': ['#E2F2DE', '#2D7A24'],
		'Community': ['#F0E4EE', '#7D4A77'],
		'Media': ['#FDF5D5', '#8A6A00'],
	};

	// same hue identity as lightColors, values inverted: dark desaturated
	// background instead of pastel, bright tint instead of saturated ink —
	// the light pairs read as washed-out/wrong-contrast directly on a dark
	// background
	const darkColors: Record<string, [string, string]> = {
		'Art & Design': ['#3A2426', '#F5A3A5'],
		'Research': ['#22303E', '#8FC1EE'],
		'Engineering': ['#213821', '#8FDB84'],
		'Community': ['#332332', '#DBA6D6'],
		'Media': ['#3A3117', '#F0CD6B'],
	};

	const colors = $derived(sidebar.theme === 'dark' ? darkColors : lightColors);

</script>

<!-- controls -->
<div class="flex flex-wrap items-center gap-1 px-1 pt-2 pb-1">
	<button
		class="flex items-center gap-1 text-[11px] text-neutral-500"
		onclick={() => (listView = !listView)}
	>
		<div
			class="relative h-3.5 w-6 rounded-full transition-colors {listView
				? 'bg-neutral-800 dark:bg-neutral-200'
				: 'bg-neutral-200 dark:bg-neutral-700'}"
		>
			<div
				class="absolute top-0.5 h-2.5 w-2.5 rounded-full bg-white transition-all dark:bg-neutral-900 {listView
					? 'left-3'
					: 'left-0.5'}"
			></div>
		</div>
		List
	</button>
	<div class="mx-1 h-3 w-px bg-neutral-200 dark:bg-neutral-800"></div>
	{#each allTypes as type (type)}
		<button
			class="rounded-full px-2 py-0.5 text-[10px] transition-opacity {activeFilter && activeFilter !== type ? 'opacity-30' : ''}"
			style="background-color: {colors[type]?.[0]}; color: {colors[type]?.[1]}"
			onclick={() => (activeFilter = activeFilter === type ? null : type)}
		>{type}</button>
	{/each}
</div>

{#if listView}
	<div class="flex flex-col py-2" transition:fade={{ duration: 150 }}>
		{#each visibleGroups as group (group.year)}
			<div
				class="mb-1 border-b border-neutral-200 pb-1 text-xs text-neutral-400 not-first:pt-3 dark:border-neutral-800"
			>
				{group.year}
			</div>
			{#each group.projects as project (project.title)}
				<div
					transition:fade={{ duration: 150 }}
					animate:flip={{ duration: 300 }}
					class="flex items-center gap-2 border-b border-neutral-100 py-1 dark:border-neutral-800"
				>
					<div class="h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-neutral-100 dark:bg-neutral-800">
						{#if project.image}
							<img src="/img/projects/{project.image}" alt={project.title} class="h-full w-full object-cover" />
						{/if}
					</div>
					<span class="ml-1 min-w-0 flex-1 truncate text-[13px] text-neutral-700 dark:text-neutral-300">{project.title}</span>
					<div class="flex shrink-0 gap-1">
						{#each project.types as type (type)}
							<span
								class="rounded-full px-1.5 py-0.5 text-[10px] leading-none"
								style="background-color: {colors[type]?.[0]}; color: {colors[type]?.[1]}"
							>{type}</span>
						{/each}
					</div>
				</div>
			{/each}
		{/each}
	</div>
{:else}
	<div
		class="grid grid-cols-3 gap-2 py-2"
		style="grid-auto-flow: dense"
		transition:fade={{ duration: 150 }}
	>
		{#each visibleGroups.flatMap((g) => g.projects) as project (project.title)}
			<div
				transition:fade={{ duration: 150 }}
				animate:flip={{ duration: 300 }}
				class="group relative overflow-hidden rounded-sm bg-neutral-100 hover:cursor-pointer dark:bg-neutral-800 {!project.size ? 'aspect-square' : project.size === '2x2' ? 'col-span-2 row-span-2 aspect-square' : 'col-span-2 aspect-2/1'}"
			>
				<div class="absolute inset-x-0 top-0 z-10 p-2" data-label>
					<div class="flex items-start justify-between gap-1">
						<div class="text-xs leading-tight text-balance text-neutral-600 dark:text-neutral-300">{project.title}</div>
						<div class="flex shrink-0 gap-1 pt-0.5">
							{#each project.types as type (type)}
								<span
									class="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[7px] leading-none"
									style="background-color: {colors[type]?.[0]}; color: {colors[type]?.[1]}"
								>{type.charAt(0)}</span>
							{/each}
						</div>
					</div>
				</div>
				{#if project.image}
					<img
						src="/img/projects/{project.image}"
						alt={project.title}
						class="absolute inset-0 z-20 h-full w-full rounded-sm object-cover transition-transform duration-300"
						style="transform: translateY(0)"
						onmouseenter={(e) => {
							const label = (e.currentTarget as HTMLElement).closest('.group')?.querySelector('[data-label]');
							if (label) (e.currentTarget as HTMLImageElement).style.transform = `translateY(${label.getBoundingClientRect().height}px)`;
						}}
						onmouseleave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'translateY(0)'; }}
					/>
				{/if}
			</div>
		{/each}
	</div>
{/if}
