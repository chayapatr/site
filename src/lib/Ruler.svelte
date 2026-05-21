<script lang="ts">
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
		onLabelClick,
	}: Props = $props();

	let activeTick = $derived.by(() => {
		if (typeof window === 'undefined') return 0;
		const sidebarHeight = window.innerHeight - 48 - 16;
		const dotTop = contentFraction * sidebarHeight;
		return Math.round((dotTop / sidebarHeight) * 40);
	});

	let galleryActiveTick = $derived(Math.round(galleryFraction * 40));
</script>

<div
	class="pointer-events-none fixed right-0 z-50 px-2 py-2 {isMobile && showGallery
		? 'hidden'
		: isMobile
			? 'top-14 h-[calc(100svh-3.5rem-16px)]'
			: 'top-12 h-[calc(100svh-3rem-16px)]'}"
>
	<div class="absolute top-0 right-2 flex h-full flex-col items-end justify-between">
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
					<div class={i % 10 === 0 ? 'h-px w-2.5 bg-neutral-600' : 'h-px w-1 bg-neutral-300'}></div>
				{/if}
			</div>
		{/each}
	</div>

	{#each blocks as b, i (b.slug)}
		<button
			class="pointer-events-auto absolute text-right text-xs text-neutral-400 transition-all duration-300 hover:text-neutral-600 {isMobile && !isScrolling ? 'opacity-0' : ''}"
			style="top: {labelTops[i] ?? 0}px; right: 1.5rem; transform: translateY(-50%)"
			onclick={() => onLabelClick?.(i)}
		>
			{b.slug}
		</button>
	{/each}
</div>
