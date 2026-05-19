<script lang="ts">
	import { getContent } from '$lib/content';
	import { tick, onMount } from 'svelte';

	let bostonTime = $state('');
	onMount(() => {
		const update = () => {
			bostonTime = new Date()
				.toLocaleTimeString('en-US', {
					timeZone: 'America/New_York',
					hour: 'numeric',
					minute: '2-digit',
					hour12: true
				})
				.toLowerCase();
		};
		update();
		const interval = setInterval(update, 1000);
		return () => clearInterval(interval);
	});

	let { data } = $props();

	type Block = { slug: string; content: string; lineCount: number };

	let blocks = $state<Block[]>([{ slug: '!@$', content: '', lineCount: 0 }]);
	$effect(() => {
		blocks[0].content = data.content;
		blocks[0].lineCount = data.lineCount;
	});
	let dividers = $state<HTMLElement[]>([]);
	let blockEls = $state<HTMLElement[]>([]);

	let scrollY = $state(0);
	let prevScrollY = $state(0);
	let isScrolling = $state(false);
	let scrollEndTimer: ReturnType<typeof setTimeout>;
	$effect(() => {
		if (scrollY !== prevScrollY) {
			prevScrollY = scrollY;
			isScrolling = true;
			clearTimeout(scrollEndTimer);
			scrollEndTimer = setTimeout(() => {
				isScrolling = false;
			}, 600);
			updateLines();
		}
	});

	type LineEntry = { key: string; num: number; top: number };
	let lineEntries = $state<LineEntry[]>([]);

	function updateLines() {
		const els = document.querySelectorAll<HTMLElement>('[data-line]');
		lineEntries = Array.from(els).map((el, i) => ({
			key: String(i),
			num: Number(el.dataset.line),
			top: el.getBoundingClientRect().top + window.scrollY
		}));
	}

	onMount(() => {
		const mo = new MutationObserver(() => requestAnimationFrame(updateLines));
		mo.observe(document.body, { childList: true, subtree: true });
		updateLines();
		return () => mo.disconnect();
	});

	let labelTops = $derived.by(() => {
		if (blockEls.length === 0) return [];
		const totalHeight = blockEls.reduce((sum, el) => sum + (el?.offsetHeight ?? 0), 0);
		if (totalHeight === 0) return blockEls.map(() => 0);
		const sidebarHeight = window?.innerHeight ? window.innerHeight - 48 - 16 : 0;
		let cumulative = 0;
		return blockEls.map((el) => {
			const top = (cumulative / totalHeight) * sidebarHeight;
			cumulative += el?.offsetHeight ?? 0;
			return top;
		});
	});

	let dotTop = $derived.by(() => {
		if (typeof window === 'undefined') return 0;
		const sidebarHeight = window.innerHeight - 48 - 16;
		const scrollFraction = scrollY / (document.body.scrollHeight - window.innerHeight || 1);
		return scrollFraction * sidebarHeight;
	});

	async function openSlug(slug: string, afterIndex: number) {
		const { content, lineCount } = await getContent(slug);
		blocks.splice(afterIndex + 1, 0, { slug, content, lineCount });
		await tick();
		await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
		updateLines();
		const el = blockEls[afterIndex + 1];
		if (el) {
			window.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
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
			const el = blockEls[existing];
			if (el) window.scrollTo({ top: el.offsetTop - 48, behavior: 'smooth' });
			return;

		}
		const blockEl = (e.target as HTMLElement).closest('[data-block-index]');
		const afterIndex = blockEl ? Number((blockEl as HTMLElement).dataset.blockIndex) : blocks.length - 1;
		openSlug(slug, afterIndex);
	}
</script>

<svelte:window bind:scrollY />

<div class="pointer-events-none fixed top-12 left-0 z-40 h-screen overflow-hidden px-5">
	{#each lineEntries as entry (entry.key)}
		<div class="absolute left-5 text-xs text-neutral-400" style="top: {entry.top - scrollY - 48}px">
			{entry.num}
		</div>
	{/each}
</div>

<div class="text-md fixed top-0 right-0 left-0 z-50 bg-white px-5 pt-2 leading-none">
	<div class="flex w-full justify-between gap-1.5 border-b border-neutral-200 pb-2">
		<div>Pub</div>
		<div>Projects</div>
		<div>Fun</div>
		<div>Blog</div>
		<div>{bostonTime} (Boston)</div>
	</div>
</div>

<div class="pointer-events-none fixed top-12 right-0 h-[calc(100svh-3rem-16px)] px-5 py-2">
	<!-- ruler: rightmost within padding -->
	<div
		class="absolute top-0 right-5 flex h-full flex-col items-end justify-between transition-opacity duration-300 {isScrolling
			? 'opacity-100'
			: 'opacity-0'}"
	>
		{#each Array.from({ length: 41 }, (_, i) => i) as i (i)}
			<div class={i % 10 === 0 ? 'h-px w-2.5 bg-neutral-600' : 'h-px w-1 bg-neutral-300'}></div>
		{/each}
	</div>

	<!-- dot (idle) or number (scrolling) -->
	<div class="absolute right-5 text-center" style="top: {dotTop}px; transform: translateY(-50%)">
		{#if isScrolling}
			<span class="text-xs leading-none text-neutral-400"
				>{Math.round(
					(scrollY / (document.body.scrollHeight - window.innerHeight || 1)) * 100
				)}</span
			>
		{:else}
			<div class="mx-auto h-1.5 w-1.5 rounded-full bg-neutral-400"></div>
		{/if}
	</div>

	{#each blocks as b, i (b.slug)}
		<button
			class="pointer-events-auto absolute text-right text-xs text-neutral-400 transition-all duration-300 hover:text-neutral-600"
			style="top: {labelTops[i] ?? 0}px; right: {isScrolling
				? '2.5rem'
				: '1.25rem'}; transform: translateY(-50%)"
			onclick={() => {
				const el = blockEls[i];
				if (el) window.scrollTo({ top: el.offsetTop - 48, behavior: 'smooth' });
			}}
		>
			{b.slug}
		</button>
	{/each}
</div>

<div
	role="presentation"
	class="mx-auto flex min-h-svh w-full max-w-[1600px] flex-col p-3 pt-12"
	onclick={handleClick}
	onkeydown={() => {}}
>
	{#each blocks as block, i (block.slug)}
		{#if i > 0}
			<div
				bind:this={dividers[i - 1]}
				class="my-6 flex items-center gap-3 text-xs text-neutral-400"
			>
				<div class="h-px flex-1 bg-neutral-200"></div>
				<span>{block.slug}</span>
				<div class="h-px flex-1 bg-neutral-200"></div>
			</div>
		{/if}
		<div bind:this={blockEls[i]} data-block-index={i} class="flex justify-center">
			<div class="prose w-full max-w-3xl overflow-visible py-4 text-lg leading-relaxed">
				{@html block.content}
			</div>
		</div>
	{/each}
</div>
