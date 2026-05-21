<script lang="ts">
	import { onMount } from 'svelte';
	import { view, gallery, allTypes, visibleGroups } from '$lib/store.svelte';
	import GalleryPanel from '$lib/GalleryPanel.svelte';
	import ContentPanel from '$lib/ContentPanel.svelte';
	import Ruler from '$lib/Ruler.svelte';
	import LineNumbers from '$lib/LineNumbers.svelte';

	type Block = { slug: string; content: string; lineCount: number };
	type Props = { data: { content: string; lineCount: number } };
	let { data }: Props = $props();

	// --- mobile detection ---
	onMount(() => {
		const check = () => { view.isMobile = window.innerWidth < 768; };
		check();
		window.addEventListener('resize', check);
		return () => window.removeEventListener('resize', check);
	});

	// --- blocks ---
	let blocks = $state<Block[]>([{ slug: '!@$', content: '', lineCount: 0 }]);
	$effect(() => {
		blocks[0].content = data.content;
		blocks[0].lineCount = data.lineCount;
	});
	let blockEls = $state<HTMLElement[]>([]);

	// --- content scroll ---
	let scrollY = $state(0);
	let contentFraction = $state(0);
	let isScrolling = $state(false);
	let labelTops = $state<number[]>([]);
	let scrollEndTimer: ReturnType<typeof setTimeout>;

	$effect(() => {
		if (view.isMobile) return;
		contentFraction = scrollY / (document.body.scrollHeight - window.innerHeight || 1);
		isScrolling = true;
		clearTimeout(scrollEndTimer);
		scrollEndTimer = setTimeout(() => { isScrolling = false; }, 600);
	});

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
			galleryScrollEndTimer = setTimeout(() => { isGalleryScrolling = false; }, 600);
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
</script>

<svelte:window bind:scrollY />

{#if !view.showOS}

<LineNumbers {scrollY} isMobile={view.isMobile} />

{#if view.isMobile}
	<ContentPanel
		bind:this={contentPanel}
		bind:blocks
		bind:blockEls
		bind:scrollFraction={contentFraction}
		bind:isScrolling
		bind:labelTops
		mobile={true}
		visible={!view.showGallery}
	/>
	<div
		class="fixed inset-0 overflow-y-auto px-4 pt-14 pb-3 transition-opacity duration-300 {view.showGallery
			? 'opacity-100'
			: 'pointer-events-none opacity-0'}"
	>
		<GalleryPanel
			visibleGroups={visibleGroups()}
			{allTypes}
			bind:activeFilter={gallery.activeFilter}
			bind:listView={gallery.listView}
			mobile={true}
		/>
	</div>
{:else}
	<div
		class="mx-auto flex min-h-svh w-full gap-8 px-10 pb-3 transition-[max-width] duration-500 xl:px-16 {view.splitView
			? 'max-w-[1600px]'
			: 'max-w-5xl'}"
	>
		<ContentPanel
			bind:this={contentPanel}
			bind:blocks
			bind:blockEls
			bind:labelTops
			bind:isScrolling
			splitView={view.splitView}
		/>
		<div
			bind:this={galleryEl}
			class="sticky top-0 h-svh shrink-0 overflow-y-auto pt-12 transition-all duration-500 {view.splitView
				? 'w-1/2 opacity-100'
				: 'pointer-events-none w-0 overflow-hidden opacity-0'}"
		>
			<div class="w-full max-w-2xl">
				<GalleryPanel
					visibleGroups={visibleGroups()}
					{allTypes}
					bind:activeFilter={gallery.activeFilter}
					bind:listView={gallery.listView}
				/>
			</div>
		</div>
	</div>
{/if}

<Ruler
	{contentFraction}
	{galleryFraction}
	{isScrolling}
	{isGalleryScrolling}
	{labelTops}
	{blocks}
	{blockEls}
	splitView={view.splitView}
	isMobile={view.isMobile}
	showGallery={view.showGallery}
	onLabelClick={(i) => contentPanel?.scrollToBlock(i)}
/>

{/if}
