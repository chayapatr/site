<script lang="ts">
	import { getContent } from '$lib/content/content';
	import { tick, onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { SvelteSet } from 'svelte/reactivity';
	import { openFloatingPanel } from '$lib/floating/store.svelte';
	import { view } from '$lib/store.svelte';
	import LinkTooltip from '$lib/main/LinkTooltip.svelte';

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
		contentEl = $bindable(null)
	}: Props = $props();

	let el = $state<HTMLElement | null>(null);
	$effect(() => {
		contentEl = el;
	});
	let dividers = $state<HTMLElement[]>([]);
	let scrollEndTimer: ReturnType<typeof setTimeout>;

	// purely a display concern (not persisted content data), so it's kept
	// local here rather than added to the shared Block type — a set of
	// collapsed slugs rather than per-block state, since blocks are keyed
	// by slug in the {#each} anyway
	let collapsedSlugs = new SvelteSet<string>();
	function toggleCollapsed(slug: string) {
		if (collapsedSlugs.has(slug)) {
			collapsedSlugs.delete(slug);
		} else {
			collapsedSlugs.add(slug);
		}
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
			scrollEndTimer = setTimeout(() => {
				isScrolling = false;
			}, 600);
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
		// tracked explicitly so collapsing/expanding a block (which doesn't
		// change blockEls itself, just a class on an existing element)
		// re-triggers this recalculation too
		void collapsedSlugs.size;
		const totalHeight = blockEls.reduce((sum, e) => sum + (e?.offsetHeight ?? 0), 0);
		if (totalHeight === 0) {
			labelTops = blockEls.map(() => 0);
			return;
		}
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

	async function handleClick(e: MouseEvent) {
		const target = (e.target as HTMLElement).closest('[data-internal-slug]');
		if (!target) return;
		e.preventDefault();
		const slug = (target as HTMLElement).dataset.internalSlug;
		if (!slug) return;
		// "works" toggles the existing Projects gallery panel instead of being
		// fetched/rendered as a markdown block like any other internal link
		if (slug === 'works') {
			view.rightPanel = view.rightPanel === 'projects' ? null : 'projects';
			return;
		}
		const existing = blocks.findIndex((b) => b.slug === slug);
		if (existing !== -1) {
			// removing `hidden` doesn't reflow synchronously — wait for the DOM
			// to actually update before reading offsetTop, or the scroll target
			// is computed against the block's still-collapsed (zero) height
			const wasCollapsed = collapsedSlugs.has(slug);
			collapsedSlugs.delete(slug);
			if (wasCollapsed) {
				await tick();
				await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
			}
			const blockEl = blockEls[existing];
			if (blockEl && el) {
				el.scrollTo({ top: blockEl.offsetTop - SCROLL_OFFSET, behavior: 'smooth' });
			}
			return;
		}
		const blockEl = (e.target as HTMLElement).closest('[data-block-index]');
		const afterIndex = blockEl
			? Number((blockEl as HTMLElement).dataset.blockIndex)
			: blocks.length - 1;
		openSlug(slug, afterIndex, target as HTMLElement);
	}

	export async function scrollToBlock(index: number) {
		const blockEl = blockEls[index];
		if (!blockEl || !el) return;
		const slug = blocks[index]?.slug;
		const wasCollapsed = slug !== undefined && collapsedSlugs.has(slug);
		if (slug !== undefined) collapsedSlugs.delete(slug);
		if (wasCollapsed) {
			await tick();
			await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
		}
		el.scrollTo({ top: blockEl.offsetTop - SCROLL_OFFSET, behavior: 'smooth' });
	}

	function closeBlock(index: number) {
		// blockEls re-binds itself via the {#each} block's keyed bind:this —
		// no need to splice it manually here
		blocks.splice(index, 1);
	}

	function popOutBlock(index: number) {
		openFloatingPanel(blocks[index].slug);
	}

	// prepends the home note as a new block above whatever's currently
	// showing, instead of navigating away — same "stack of opened sections"
	// model as clicking an internal link, just inserted at the very top
	async function openHomeAtTop() {
		const slug = '!@$';
		if (blocks[0]?.slug === slug) {
			scrollToBlock(0);
			return;
		}
		const { content, lineCount } = await getContent(slug);
		blocks.unshift({ slug, content, lineCount });
		await tick();
		await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
		scrollToBlock(0);
	}
</script>

<div
	bind:this={el}
	class={mobile
		? `fixed inset-0 overflow-y-auto overscroll-none pt-10 pr-9 pb-3 pl-3.5 transition-opacity duration-300 ${visible ? 'opacity-100' : 'pointer-events-none opacity-0'}`
		: 'flex h-full min-w-0 flex-1 flex-col overflow-y-auto overscroll-none pt-10 pb-3'}
	role="presentation"
	onclick={handleClick}
	onkeydown={() => {}}
	transition:fade={{ duration: 250 }}
>
	{#if blocks[0]?.slug !== '!@$'}
		<button
			class="text-md -mt-1 mb-6 flex h-9 w-full cursor-pointer items-center justify-center border-b border-neutral-200 bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] bg-fixed text-neutral-500 [--pattern-fg:var(--color-neutral-900)]/5 hover:[--pattern-fg:var(--color-neutral-900)]/10 dark:border-neutral-800 dark:text-neutral-400 dark:[--pattern-fg:var(--color-neutral-100)]/5 dark:hover:[--pattern-fg:var(--color-neutral-100)]/10"
			onclick={openHomeAtTop}
		>
			Home
		</button>
	{/if}
	{#each blocks as block, i (block.slug)}
		{#if i > 0}
			<div
				class="my-6 flex items-center gap-1.5 text-xs text-neutral-400"
				bind:this={dividers[i - 1]}
			>
				<div class="h-px flex-1 bg-neutral-200 dark:bg-neutral-800"></div>
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
				<button
					class="cursor-pointer text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
					onclick={(e) => {
						e.stopPropagation();
						toggleCollapsed(block.slug);
					}}
					aria-label={collapsedSlugs.has(block.slug) ? 'Expand section' : 'Collapse section'}
				>
					{collapsedSlugs.has(block.slug) ? '[+]' : '[-]'}
				</button>
				<button
					class="cursor-pointer text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
					onclick={(e) => {
						e.stopPropagation();
						popOutBlock(i);
					}}
					aria-label="Open as floating panel"
				>
					[o]
				</button>
				<div class="h-px flex-1 bg-neutral-200 dark:bg-neutral-800"></div>
			</div>
		{/if}
		<div
			bind:this={blockEls[i]}
			data-block-index={i}
			class="flex justify-center {collapsedSlugs.has(block.slug) ? 'hidden' : ''}"
		>
			<div
				class="{splitView
					? 'pl-5'
					: 'pl-0'} prose w-full max-w-3xl overflow-visible py-4 text-base text-[15px] leading-relaxed transition-[padding] duration-500 lg:text-base xl:text-[17px] dark:prose-invert"
			>
				{@html block.content}
			</div>
		</div>
	{/each}
</div>

<LinkTooltip containerEl={el} />
