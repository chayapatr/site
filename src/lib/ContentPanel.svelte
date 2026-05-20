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
	}: Props = $props();

	let el = $state<HTMLElement | null>(null);
	let dividers = $state<HTMLElement[]>([]);
	let scrollEndTimer: ReturnType<typeof setTimeout>;

	$effect(() => {
		if (!mobile || !el) return;
		const handler = () => {
			const fraction = el!.scrollTop / (el!.scrollHeight - el!.clientHeight || 1);
			scrollFraction = fraction;
			isScrolling = true;
			clearTimeout(scrollEndTimer);
			scrollEndTimer = setTimeout(() => { isScrolling = false; }, 600);
		};
		el.addEventListener('scroll', handler);
		return () => el!.removeEventListener('scroll', handler);
	});

	$effect(() => {
		if (blockEls.length === 0) return;
		const totalHeight = blockEls.reduce((sum, e) => sum + (e?.offsetHeight ?? 0), 0);
		if (totalHeight === 0) { labelTops = blockEls.map(() => 0); return; }
		const sidebarHeight = typeof window !== 'undefined' ? window.innerHeight - 48 - 16 : 0;
		let cumulative = 0;
		labelTops = blockEls.map((e) => {
			const top = (cumulative / totalHeight) * sidebarHeight;
			cumulative += e?.offsetHeight ?? 0;
			return top;
		});
	});

	async function openSlug(slug: string, afterIndex: number) {
		const { content, lineCount } = await getContent(slug);
		blocks.splice(afterIndex + 1, 0, { slug, content, lineCount });
		await tick();
		await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
		const target = blockEls[afterIndex + 1];
		if (!target) return;
		if (mobile && el) {
			el.scrollTo({ top: target.offsetTop - 40, behavior: 'smooth' });
		} else {
			window.scrollTo({ top: target.offsetTop - 48, behavior: 'smooth' });
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
			if (blockEl) {
				if (mobile && el) {
					el.scrollTo({ top: blockEl.offsetTop - 40, behavior: 'smooth' });
				} else {
					window.scrollTo({ top: blockEl.offsetTop - 48, behavior: 'smooth' });
				}
			}
			return;
		}
		const blockEl = (e.target as HTMLElement).closest('[data-block-index]');
		const afterIndex = blockEl ? Number((blockEl as HTMLElement).dataset.blockIndex) : blocks.length - 1;
		openSlug(slug, afterIndex);
	}

	export function scrollToBlock(index: number) {
		const blockEl = blockEls[index];
		if (!blockEl) return;
		if (mobile && el) {
			el.scrollTo({ top: blockEl.offsetTop - 40, behavior: 'smooth' });
		} else {
			window.scrollTo({ top: blockEl.offsetTop - 48, behavior: 'smooth' });
		}
	}
</script>

<div
	bind:this={el}
	class={mobile
		? `fixed inset-0 overflow-y-auto pt-10 pr-10 pb-3 pl-3.5 transition-opacity duration-300 ${visible ? 'opacity-100' : 'pointer-events-none opacity-0'}`
		: 'flex min-w-0 flex-1 flex-col pt-12'}
	role="presentation"
	onclick={handleClick}
	onkeydown={() => {}}
>
	{#each blocks as block, i (block.slug)}
		{#if i > 0}
			<div class="my-6 flex items-center gap-3 text-xs text-neutral-400" bind:this={dividers[i - 1]}>
				<div class="h-px flex-1 bg-neutral-200"></div>
				<span>{block.slug}</span>
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
