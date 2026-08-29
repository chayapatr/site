<script lang="ts">
	import { onMount } from 'svelte';
	import { view, gallery, allTypes, visibleGroups } from '$lib/store.svelte';
	import GalleryPanel from '$lib/content/GalleryPanel.svelte';
	import WritingsPanel from '$lib/content/WritingsPanel.svelte';
	import ContentPanel from '$lib/main/ContentPanel.svelte';
	import Ruler from '$lib/main/Ruler.svelte';
	import Sidebar from '$lib/main/Sidebar.svelte';
	import BlueprintGrid from '$lib/main/BlueprintGrid.svelte';
	import FloatingLayer from '$lib/floating/FloatingLayer.svelte';
	import { writings } from '$lib/content/writings';
	import { fade } from 'svelte/transition';

	let writingsActiveSource = $state<import('$lib/content/writings').WritingSource | null>(null);

	// track last active panel so closing doesn't flash back to default
	let displayPanel = $state<'projects' | 'writings'>('projects');
	let panelContentVisible = $state(true);
	let panelSwitchTimer: ReturnType<typeof setTimeout>;
	let prevRightPanel: null | 'projects' | 'writings' = null;
	$effect(() => {
		const curr = view.rightPanel;
		if (curr && curr !== prevRightPanel && prevRightPanel !== null) {
			// switching between open panels: fade out, swap, fade in
			panelContentVisible = false;
			clearTimeout(panelSwitchTimer);
			panelSwitchTimer = setTimeout(() => {
				displayPanel = curr;
				panelContentVisible = true;
			}, 150);
		} else if (curr) {
			displayPanel = curr;
		}
		prevRightPanel = curr;
	});

	type Block = { slug: string; content: string; lineCount: number };
	type Props = { data: { slug: string; content: string; lineCount: number } };
	let { data }: Props = $props();

	// --- mobile detection ---
	onMount(() => {
		const check = () => {
			view.isMobile = window.innerWidth < 768;
		};
		check();
		window.addEventListener('resize', check);
		return () => window.removeEventListener('resize', check);
	});

	// --- blocks ---
	// seeded directly from the initial load — the effect below only handles
	// *later* navigation (when data.slug actually changes), never the first
	// render, so content isn't left empty waiting for an effect that already
	// considers itself "up to date"
	let blocks = $state<Block[]>([
		{ slug: data.slug, content: data.content, lineCount: data.lineCount },
	]);
	// only re-seeds blocks[0] when the route's loaded slug actually changes
	// (real navigation) — not on every re-run of this effect, since the user
	// can locally unshift/splice blocks (e.g. the in-page Home button), and
	// re-stamping blocks[0] unconditionally would silently revert that
	let lastLoadedSlug = data.slug;
	$effect(() => {
		if (data.slug === lastLoadedSlug) return;
		lastLoadedSlug = data.slug;
		blocks = [{ slug: data.slug, content: data.content, lineCount: data.lineCount }];
	});
	let blockEls = $state<HTMLElement[]>([]);

	// --- content scroll ---
	// ContentPanel now owns its own scroll container (both mobile and
	// desktop) and reports position back via these bindable props, the same
	// way galleryEl's scroll is tracked below — nothing scrolls the page/body
	// itself anymore, so a stray scroll over the margins does nothing
	let isScrolling = $state(false);
	let labelTops = $state<number[]>([]);
	let contentFraction = $state(0);

	// --- gallery scroll ---
	let galleryEl = $state<HTMLElement | null>(null);
	let galleryScrollY = $state(0);
	let isGalleryScrolling = $state(false);
	let galleryScrollEndTimer: ReturnType<typeof setTimeout>;
	$effect(() => {
		if (!galleryEl) return;
		const handler = () => {
			galleryScrollY = galleryEl!.scrollTop;
			isGalleryScrolling = true;
			clearTimeout(galleryScrollEndTimer);
			galleryScrollEndTimer = setTimeout(() => {
				isGalleryScrolling = false;
			}, 600);
		};
		galleryEl.addEventListener('scroll', handler);
		const el = galleryEl;
		return () => el.removeEventListener('scroll', handler);
	});
	let galleryFraction = $derived(
		galleryEl ? galleryScrollY / (galleryEl.scrollHeight - galleryEl.clientHeight || 1) : 0
	);

	// --- content panel ref ---
	let contentPanel = $state<{ scrollToBlock: (i: number) => void } | null>(null);
	let contentColumnEl = $state<HTMLElement | null>(null);
	let panelContentEl = $state<HTMLElement | null>(null);
</script>

{#if !view.showOS}

	<Sidebar contentEl={contentColumnEl} {isScrolling} isMobile={view.isMobile} />

	{#if view.isMobile}
		<ContentPanel
			bind:this={contentPanel}
			bind:blocks
			bind:blockEls
			bind:scrollFraction={contentFraction}
			bind:isScrolling
			bind:labelTops
			mobile={true}
			visible={!view.rightPanel}
		/>
		<div
			class="fixed inset-0 overflow-y-auto bg-white px-4 pt-14 pb-3 transition-opacity duration-300 {view.rightPanel
				? 'opacity-100'
				: 'pointer-events-none opacity-0'}"
		>
			<div
				class="transition-opacity duration-150 {panelContentVisible ? 'opacity-100' : 'opacity-0'}"
			>
				{#if displayPanel === 'writings'}
					<WritingsPanel
						writingYears={writings}
						bind:activeSource={writingsActiveSource}
						mobile={true}
					/>
				{:else}
					<GalleryPanel
						visibleGroups={visibleGroups()}
						{allTypes}
						bind:activeFilter={gallery.activeFilter}
						bind:listView={gallery.listView}
						mobile={true}
					/>
				{/if}
			</div>
		</div>
	{:else}
		<div
			class="mx-auto flex h-svh w-full gap-8 px-10 transition-[max-width] duration-500 xl:px-16 {view.rightPanel
				? 'max-w-[1600px]'
				: 'max-w-5xl'}"
		>
			<ContentPanel
				bind:this={contentPanel}
				bind:blocks
				bind:blockEls
				bind:labelTops
				bind:isScrolling
				bind:scrollFraction={contentFraction}
				bind:contentEl={contentColumnEl}
				splitView={!!view.rightPanel}
			/>
			<div
				bind:this={galleryEl}
				class="sticky top-0 h-svh shrink-0 overflow-y-auto pt-10 transition-all duration-500 {view.rightPanel
					? 'w-1/2 opacity-100'
					: 'pointer-events-none w-0 overflow-hidden opacity-0'}"
			>
				<div
					bind:this={panelContentEl}
					class="w-full max-w-2xl border-r border-neutral-200 pr-5 transition-opacity duration-150 dark:border-neutral-800 {panelContentVisible
						? 'opacity-100'
						: 'opacity-0'}"
				>
					{#if displayPanel === 'writings'}
						<WritingsPanel writingYears={writings} bind:activeSource={writingsActiveSource} />
					{:else}
						<GalleryPanel
							visibleGroups={visibleGroups()}
							{allTypes}
							bind:activeFilter={gallery.activeFilter}
							bind:listView={gallery.listView}
						/>
					{/if}
				</div>
			</div>
		</div>
	{/if}

	<BlueprintGrid
		contentEl={contentColumnEl}
		panelEl={view.rightPanel ? panelContentEl : null}
		isMobile={view.isMobile}
	/>

	<Ruler
		{contentFraction}
		{galleryFraction}
		{isScrolling}
		{isGalleryScrolling}
		{labelTops}
		{blocks}
		{blockEls}
		splitView={!!view.rightPanel}
		isMobile={view.isMobile}
		showGallery={view.showGallery}
		onLabelClick={(i) => contentPanel?.scrollToBlock(i)}
	/>

	<FloatingLayer />
{/if}
