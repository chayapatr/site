<script lang="ts">
	import { getContent } from '$lib/content';
	import { tick, onMount } from 'svelte';

	type Block = { slug: string; content: string; lineCount: number };

	type Props = {
		blocks: Block[];
		splitView?: boolean;
		mobile?: boolean;
		visible?: boolean;
		scrollFraction?: number;
		isScrolling?: boolean;
		labelTops?: number[];
		blockEls?: HTMLElement[];
		contentEl?: HTMLElement | null;
	};

	let {
		blocks = $bindable(),
		splitView = false,
		mobile = false,
		visible = true,
		scrollFraction = $bindable(0),
		isScrolling = $bindable(false),
		labelTops = $bindable([]),
		blockEls = $bindable([]),
		contentEl = $bindable(null),
	}: Props = $props();

	let el = $state<HTMLElement | null>(null);
	$effect(() => {
		contentEl = el;
	});
	let dividers = $state<HTMLElement[]>([]);
	let scrollEndTimer: ReturnType<typeof setTimeout>;

	// link hover tooltip — shows the real destination (external URL, or the
	// original path for internal links, which content.ts otherwise rewrites
	// to href="#") near the cursor
	let hoveredLinkHref = $state<string | null>(null);
	let hoveredLinkIsInternal = $state(false);
	let tooltipX = $state(0);
	let tooltipY = $state(0);

	function handlePointerMove(e: MouseEvent) {
		const target = (e.target as HTMLElement).closest('a[data-href]') as HTMLElement | null;
		hoveredLinkHref = target?.dataset.href ?? null;
		hoveredLinkIsInternal = target?.dataset.internalSlug !== undefined;
		tooltipX = e.clientX;
		tooltipY = e.clientY;
	}

	function handlePointerLeave() {
		hoveredLinkHref = null;
	}

	// content is raw {@html} markdown output — <img> is a replaced element,
	// so ::before/::after pseudo-elements never render on it directly (spec
	// behavior, not a browser bug). Wrap each image in a real <span> once so
	// the border CSS has something it can actually paint on.
	function wrapImages(root: HTMLElement) {
		const imgs = root.querySelectorAll('img');
		imgs.forEach((img) => {
			if (img.parentElement?.classList.contains('img-frame')) return;
			const wrapper = document.createElement('span');
			wrapper.className = 'img-frame';
			img.replaceWith(wrapper);
			wrapper.appendChild(img);
		});
	}

	// desktop uses a 48px top offset (pt-10 + a little), mobile uses 40px
	// (matches each branch's own top padding in the template below)
	const SCROLL_OFFSET = $derived(mobile ? 40 : 48);

	$effect(() => {
		if (!el) return;
		const handler = () => {
			const fraction = el!.scrollTop / (el!.scrollHeight - el!.clientHeight || 1);
			scrollFraction = fraction;
			isScrolling = true;
			clearTimeout(scrollEndTimer);
			scrollEndTimer = setTimeout(() => { isScrolling = false; }, 600);
			// scrolling moves content under a stationary cursor without firing
			// mousemove/mouseleave, so the link tooltip would otherwise stay
			// stuck pointing at whatever was under the cursor before the scroll
			hoveredLinkHref = null;
		};
		el.addEventListener('scroll', handler);
		return () => el!.removeEventListener('scroll', handler);
	});

	$effect(() => {
		if (!el) return;
		wrapImages(el);
		const mo = new MutationObserver(() => wrapImages(el!));
		mo.observe(el, { childList: true, subtree: true });
		return () => mo.disconnect();
	});

	$effect(() => {
		if (blockEls.length === 0) return;
		const totalHeight = blockEls.reduce((sum, e) => sum + (e?.offsetHeight ?? 0), 0);
		if (totalHeight === 0) { labelTops = blockEls.map(() => 0); return; }
		const sidebarHeight = typeof window !== 'undefined' ? window.innerHeight - 36 - 16 : 0;
		let cumulative = 0;
		labelTops = blockEls.map((e) => {
			const top = (cumulative / totalHeight) * sidebarHeight;
			cumulative += e?.offsetHeight ?? 0;
			return top;
		});
	});

	async function openSlug(slug: string, afterIndex: number, linkEl: HTMLElement | null) {
		linkEl?.classList.add('link-loading');
		try {
			const { content, lineCount } = await getContent(slug);
			blocks.splice(afterIndex + 1, 0, { slug, content, lineCount });
			await tick();
			await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
			const target = blockEls[afterIndex + 1];
			if (!target || !el) return;
			el.scrollTo({ top: target.offsetTop - SCROLL_OFFSET, behavior: 'smooth' });
		} finally {
			linkEl?.classList.remove('link-loading');
		}
	}

	function handleClick(e: MouseEvent) {
		const target = (e.target as HTMLElement).closest('[data-internal-slug]');
		if (!target) return;
		e.preventDefault();
		const slug = (target as HTMLElement).dataset.internalSlug;
		if (!slug) return;
		const existing = blocks.findIndex((b) => b.slug === slug);
		if (existing !== -1) {
			const blockEl = blockEls[existing];
			if (blockEl && el) {
				el.scrollTo({ top: blockEl.offsetTop - SCROLL_OFFSET, behavior: 'smooth' });
			}
			return;
		}
		const blockEl = (e.target as HTMLElement).closest('[data-block-index]');
		const afterIndex = blockEl ? Number((blockEl as HTMLElement).dataset.blockIndex) : blocks.length - 1;
		openSlug(slug, afterIndex, target as HTMLElement);
	}

	export function scrollToBlock(index: number) {
		const blockEl = blockEls[index];
		if (!blockEl || !el) return;
		el.scrollTo({ top: blockEl.offsetTop - SCROLL_OFFSET, behavior: 'smooth' });
	}

	function closeBlock(index: number) {
		// blockEls re-binds itself via the {#each} block's keyed bind:this —
		// no need to splice it manually here
		blocks.splice(index, 1);
	}
</script>

<div
	bind:this={el}
	class={mobile
		? `fixed inset-0 overflow-y-auto overscroll-none pt-10 pr-10 pb-3 pl-3.5 transition-opacity duration-300 ${visible ? 'opacity-100' : 'pointer-events-none opacity-0'}`
		: 'flex h-full min-w-0 flex-1 flex-col overflow-y-auto overscroll-none pt-10 pb-3'}
	role="presentation"
	onclick={handleClick}
	onkeydown={() => {}}
	onmousemove={handlePointerMove}
	onmouseleave={handlePointerLeave}
>
	{#each blocks as block, i (block.slug)}
		{#if i > 0}
			<div class="my-6 flex items-center gap-1.5 text-xs text-neutral-400" bind:this={dividers[i - 1]}>
				<div class="h-px flex-1 bg-neutral-200"></div>
				<span>{block.slug}</span>
				<button
					class="cursor-pointer text-xs text-neutral-400 hover:text-red-400"
					onclick={(e) => {
						e.stopPropagation();
						closeBlock(i);
					}}
					aria-label="Close section"
				>
					[x]
				</button>
				<div class="h-px flex-1 bg-neutral-200"></div>
			</div>
		{/if}
		<div bind:this={blockEls[i]} data-block-index={i} class="flex justify-center">
			<div class="{splitView ? 'pl-5' : 'pl-0'} prose w-full max-w-3xl overflow-visible py-4 text-base text-[15px] leading-relaxed transition-[padding] duration-500 lg:text-base xl:text-[17px]">
				{@html block.content}
			</div>
		</div>
	{/each}
</div>

{#if hoveredLinkHref}
	<div
		class="pointer-events-none fixed z-50 flex items-center gap-1.5 rounded-sm border border-black px-2 py-1 font-mono text-xs text-black shadow-sm"
		style="left: {tooltipX + 12}px; top: {tooltipY + 16}px; background-color: #FFF8A7"
	>
		{#if hoveredLinkIsInternal}
			<img src="/imgs/pub.svg" alt="" class="h-3.5 w-3.5" />
		{:else}
			<span>🌐</span>
		{/if}
		{hoveredLinkHref}
	</div>
{/if}
