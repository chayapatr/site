<script lang="ts">
	import { fade } from 'svelte/transition';

	type Block = { slug: string };

	type Props = {
		contentFraction: number;
		galleryFraction: number;
		isScrolling: boolean;
		isGalleryScrolling: boolean;
		labelTops: number[];
		blocks: Block[];
		blockEls: HTMLElement[];
		splitView: boolean;
		isMobile: boolean;
		showGallery: boolean;
		onLabelClick?: (index: number) => void;
	};

	let {
		contentFraction,
		galleryFraction,
		isScrolling,
		isGalleryScrolling,
		labelTops,
		blocks,
		blockEls,
		splitView,
		isMobile,
		showGallery,
		onLabelClick
	}: Props = $props();

	let activeTick = $derived.by(() => {
		if (typeof window === 'undefined') return 0;
		// 36 = navbar height (top-9), 16 = the tick column's own py-2 top+bottom
		const sidebarHeight = window.innerHeight - 36 - 16;
		const dotTop = contentFraction * sidebarHeight;
		return Math.round((dotTop / sidebarHeight) * 40);
	});

	let galleryActiveTick = $derived(Math.round(galleryFraction * 40));
</script>

<div
	class="pointer-events-none fixed right-0 z-50 {isMobile && showGallery
		? 'hidden'
		: isMobile
			? 'top-9.5 h-[calc(100svh-2.5rem)]'
			: 'top-9 h-[calc(100svh-2.25rem)]'}"
	transition:fade={{ duration: 250 }}
>
	{#each blocks as b, i (b.slug)}
		<button
			class="pointer-events-auto absolute cursor-pointer rounded-sm border border-neutral-900/20 bg-white px-1 py-px text-right text-xs text-neutral-900/50 transition-all duration-300 hover:border-black hover:bg-[#FFF8A7] hover:text-black {isMobile &&
			!isScrolling
				? 'opacity-0'
				: ''}"
			style="top: {Math.max(labelTops[i] ?? 0, 10)}px; right: 1.5rem; transform: translateY(-50%)"
			onclick={() => onLabelClick?.(i)}
		>
			{b.slug}
		</button>
	{/each}

	<!-- boxed ruler column, flush to the viewport edge -->
	<div class="h-full w-8 bg-white {isMobile ? '' : 'border-l border-neutral-200'}">
		<div class="flex h-full flex-col items-end justify-between px-1.5 py-2">
			{#each Array.from({ length: 41 }, (_, i) => i) as i (i)}
				<div class="relative flex items-center justify-end">
					{#if i === activeTick}
						{#if isScrolling}
							<span class="text-[10px] leading-none font-medium text-blue-500 tabular-nums">
								{Math.round(contentFraction * 100)}
							</span>
						{:else}
							<div class="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
						{/if}
					{:else if splitView && !isMobile && i === galleryActiveTick}
						{#if isGalleryScrolling}
							<span class="text-[10px] leading-none font-medium text-purple-500 tabular-nums">
								{Math.round(galleryFraction * 100)}
							</span>
						{:else}
							<div class="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
						{/if}
					{:else}
						<div
							class={i % 10 === 0 ? 'h-px w-2.5 bg-neutral-600' : 'h-px w-1 bg-neutral-400'}
						></div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>
