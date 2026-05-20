<script lang="ts">
	import { getContent } from '$lib/content';
	import { projects } from '$lib/projects';
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
	let splitView = $state(true);
	let isMobile = $state(false);
	let showGallery = $state(false);

	onMount(() => {
		const check = () => {
			isMobile = window.innerWidth < 768;
		};
		check();
		window.addEventListener('resize', check);
		return () => window.removeEventListener('resize', check);
	});

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
		const fraction =
			isMobile && mobileContentEl
				? mobileScrollY / (mobileContentEl.scrollHeight - mobileContentEl.clientHeight || 1)
				: scrollY / (document.body.scrollHeight - window.innerHeight || 1);
		return fraction * sidebarHeight;
	});

	let activeTick = $derived.by(() => {
		if (typeof window === 'undefined') return 0;
		const sidebarHeight = window.innerHeight - 48 - 16;
		return Math.round((dotTop / sidebarHeight) * 40);
	});

	async function openSlug(slug: string, afterIndex: number) {
		const { content, lineCount } = await getContent(slug);
		blocks.splice(afterIndex + 1, 0, { slug, content, lineCount });
		await tick();
		await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
		updateLines();
		const el = blockEls[afterIndex + 1];
		if (el) {
			if (isMobile && mobileContentEl) {
				mobileContentEl.scrollTo({ top: el.offsetTop - 40, behavior: 'smooth' });
			} else {
				window.scrollTo({ top: el.offsetTop - 48, behavior: 'smooth' });
			}
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
			if (el) {
				if (isMobile && mobileContentEl) {
					mobileContentEl.scrollTo({ top: el.offsetTop - 40, behavior: 'smooth' });
				} else {
					window.scrollTo({ top: el.offsetTop - 48, behavior: 'smooth' });
				}
			}
			return;
		}
		const blockEl = (e.target as HTMLElement).closest('[data-block-index]');
		const afterIndex = blockEl
			? Number((blockEl as HTMLElement).dataset.blockIndex)
			: blocks.length - 1;
		openSlug(slug, afterIndex);
	}

	import { fade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import type { ProjectType } from '$lib/projects';

	const allTypes: ProjectType[] = ['Art & Design', 'Media', 'Community', 'Research', 'Engineering'];
	let activeFilter = $state<ProjectType | null>(null);
	let listView = $state(false);

	let visibleGroups = $derived.by(() => {
		return projects
			.map((g) => ({
				year: g.year,
				projects: activeFilter
					? g.projects.filter((p) => p.types.includes(activeFilter!))
					: g.projects
			}))
			.filter((g) => g.projects.length > 0);
	});

	let projectsGrid = $state<HTMLElement | null>(null);
	let rowSize = $state(0);

	let mobileContentEl = $state<HTMLElement | null>(null);
	let mobileScrollY = $state(0);
	$effect(() => {
		if (!mobileContentEl) return;
		const handler = () => {
			mobileScrollY = mobileContentEl!.scrollTop;
			isScrolling = true;
			clearTimeout(scrollEndTimer);
			scrollEndTimer = setTimeout(() => {
				isScrolling = false;
			}, 600);
		};
		mobileContentEl.addEventListener('scroll', handler);
		return () => mobileContentEl!.removeEventListener('scroll', handler);
	});

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
		return () => galleryEl!.removeEventListener('scroll', handler);
	});
	let galleryActiveTick = $derived.by(() => {
		if (!galleryEl) return 0;
		const fraction = galleryScrollY / (galleryEl.scrollHeight - galleryEl.clientHeight || 1);
		return Math.round(fraction * 40);
	});

	$effect(() => {
		if (!projectsGrid) return;
		const ro = new ResizeObserver(() => {
			rowSize = (projectsGrid!.offsetWidth - 2 * 8) / 3;
		});
		ro.observe(projectsGrid);
		return () => ro.disconnect();
	});
</script>

<svelte:window bind:scrollY />

<div
	class="pointer-events-none fixed top-12 left-0 z-40 h-screen overflow-hidden px-5 {isMobile
		? 'hidden'
		: ''}"
>
	{#each lineEntries as entry (entry.key)}
		<div class="absolute left-5 text-xs text-neutral-400" style="top: {entry.top - scrollY - 48}px">
			{entry.num}
		</div>
	{/each}
</div>

<div
	class="text-md fixed top-0 right-0 left-0 z-50 border-b border-neutral-200 bg-white/70 leading-none backdrop-blur-md {isMobile
		? 'pt-2.5 pr-2 pl-4'
		: 'px-5 pt-2'}"
>
	{#if isMobile}
		<div class="flex w-full items-center justify-between pb-2.5">
			{#if showGallery}
				<div class="flex gap-3">
					<div>Gallery</div>
					<div class="text-neutral-400">Writings</div>
					<div class="text-neutral-400">Settings</div>
				</div>
			{:else}
				<div>Pub</div>
			{/if}
			<button
				class="flex items-center gap-1 text-[11px] text-neutral-500"
				aria-label="Toggle gallery"
				onclick={() => (showGallery = !showGallery)}
			>
				<div
					class="relative h-3.5 w-6 rounded-full transition-colors {showGallery
						? 'bg-neutral-800'
						: 'bg-neutral-200'}"
				>
					<div
						class="absolute top-0.5 h-2.5 w-2.5 rounded-full bg-white transition-all {showGallery
							? 'left-3'
							: 'left-0.5'}"
					></div>
				</div>
			</button>
		</div>
	{:else}
		<div class="flex w-full justify-between gap-1.5 pb-2">
			<div>Pub</div>
			<button onclick={() => (splitView = !splitView)}
				>{splitView ? '🌱 Projects' : 'Projects'}</button
			>
			<div>Writings</div>
			<div>Settings</div>
			<div>{bostonTime} (Boston)</div>
		</div>
	{/if}
</div>

{#if isMobile}
	<!-- mobile: two stacked panels, toggle visibility -->
	<!-- front: content -->
	<div
		bind:this={mobileContentEl}
		class="fixed inset-0 overflow-y-auto pt-10 pr-10 pb-3 pl-3.5 transition-opacity duration-300 {showGallery
			? 'pointer-events-none opacity-0'
			: 'opacity-100'}"
		role="presentation"
		onclick={handleClick}
		onkeydown={() => {}}
	>
		{#each blocks as block, i (block.slug)}
			{#if i > 0}
				<div
					class="my-6 flex items-center gap-3 text-xs text-neutral-400"
					bind:this={dividers[i - 1]}
				>
					<div class="h-px flex-1 bg-neutral-200"></div>
					<span>{block.slug}</span>
					<div class="h-px flex-1 bg-neutral-200"></div>
				</div>
			{/if}
			<div bind:this={blockEls[i]} data-block-index={i} class="flex justify-center">
				<div class="prose w-full max-w-3xl overflow-visible py-4 text-base text-sm leading-relaxed">
					{@html block.content}
				</div>
			</div>
		{/each}
	</div>
	<!-- back: gallery -->
	<div
		class="fixed inset-0 overflow-y-auto px-4 pt-14 pb-3 transition-opacity duration-300 {showGallery
			? 'opacity-100'
			: 'pointer-events-none opacity-0'}"
	>
		<!-- controls -->
		<div class="flex flex-wrap items-center gap-1 px-1 pt-2 pb-1">
			<button
				class="flex items-center gap-1 text-[11px] text-neutral-500"
				onclick={() => (listView = !listView)}
			>
				<div
					class="relative h-3.5 w-6 rounded-full transition-colors {listView
						? 'bg-neutral-800'
						: 'bg-neutral-200'}"
				>
					<div
						class="absolute top-0.5 h-2.5 w-2.5 rounded-full bg-white transition-all {listView
							? 'left-3'
							: 'left-0.5'}"
					></div>
				</div>
				List
			</button>
			<div class="mx-1 h-3 w-px bg-neutral-200"></div>
			{#each allTypes as type (type)}
				{@const colors: Record<string, [string, string]> = {
							'Art & Design': ['#FAE8E8', '#B83537'],
							'Research': ['#DDEAF5', '#2E5F8A'],
							'Engineering': ['#E2F2DE', '#2D7A24'],
							'Community': ['#F0E4EE', '#7D4A77'],
							'Media': ['#FDF5D5', '#8A6A00'],
						}}
				<button
					class="rounded-full px-2 py-0.5 text-[10px] transition-opacity {activeFilter &&
					activeFilter !== type
						? 'opacity-30'
						: ''}"
					style="background-color: {colors[type]?.[0]}; color: {colors[type]?.[1]}"
					onclick={() => (activeFilter = activeFilter === type ? null : type)}>{type}</button
				>
			{/each}
		</div>
		{#if listView}
			<div class="flex flex-col py-2">
				{#each visibleGroups as group (group.year)}
					<div
						class="mb-1 border-b border-neutral-200 pb-1 text-xs text-neutral-400 not-first:pt-3"
					>
						{group.year}
					</div>
					{#each group.projects as project (project.title)}
						{@const colors: Record<string, [string, string]> = {
									'Art & Design': ['#FAE8E8', '#B83537'],
									'Research': ['#DDEAF5', '#2E5F8A'],
									'Engineering': ['#E2F2DE', '#2D7A24'],
									'Community': ['#F0E4EE', '#7D4A77'],
									'Media': ['#FDF5D5', '#8A6A00'],
								}}
						<div class="flex items-center gap-2 border-b border-neutral-100 py-1">
							<div class="h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-neutral-100">
								{#if project.image}
									<img
										src="/img/projects/{project.image}"
										alt={project.title}
										class="h-full w-full object-cover"
									/>
								{/if}
							</div>
							<span class="ml-1 min-w-0 flex-1 truncate text-[13px] text-neutral-700"
								>{project.title}</span
							>
							<div class="flex shrink-0 gap-1">
								{#each project.types as type (type)}
									<span
										class="rounded-full px-1.5 py-0.5 text-[10px] leading-none"
										style="background-color: {colors[type]?.[0]}; color: {colors[type]?.[1]}"
										>{type}</span
									>
								{/each}
							</div>
						</div>
					{/each}
				{/each}
			</div>
		{:else}
			<div
				class="grid grid-cols-3 gap-2 py-2"
				style="grid-auto-rows: calc((100vw - 2rem) / 3); grid-auto-flow: dense"
			>
				{#each visibleGroups.flatMap((g) => g.projects) as project (project.title)}
					{@const colors: Record<string, [string, string]> = {
								'Art & Design': ['#FAE8E8', '#B83537'],
								'Research': ['#DDEAF5', '#2E5F8A'],
								'Engineering': ['#E2F2DE', '#2D7A24'],
								'Community': ['#F0E4EE', '#7D4A77'],
								'Media': ['#FDF5D5', '#8A6A00'],
							}}
					<div
						class="group relative overflow-hidden rounded-sm bg-neutral-100 {!project.size
							? 'aspect-square'
							: project.size === '2x2'
								? 'col-span-2 row-span-2'
								: 'col-span-2'}"
					>
						<div class="absolute inset-x-0 top-0 z-10 p-2" data-label>
							<div class="flex items-start justify-between gap-1">
								<div class="text-xs leading-tight text-balance text-neutral-600">
									{project.title}
								</div>
								<div class="flex shrink-0 gap-1 pt-0.5">
									{#each project.types as type (type)}
										<span
											class="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[7px] leading-none"
											style="background-color: {colors[type]?.[0]}; color: {colors[type]?.[1]}"
											>{type.charAt(0)}</span
										>
									{/each}
								</div>
							</div>
						</div>
						{#if project.image}
							<img
								src="/img/projects/{project.image}"
								alt={project.title}
								class="absolute inset-0 z-20 h-full w-full rounded-sm object-cover"
							/>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>
{:else}
	<!-- desktop: shared flex container, both panels centered together -->
	<div
		class="mx-auto flex min-h-svh w-full gap-8 px-10 pb-3 transition-[max-width] duration-500 xl:px-16 {splitView
			? 'max-w-[1600px]'
			: 'max-w-5xl'}"
	>
		<!-- left: main content -->
		<div
			class="flex min-w-0 flex-1 flex-col pt-12"
			role="presentation"
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
					<div
						class={`${splitView ? 'pl-5' : 'pl-0'} prose w-full max-w-3xl overflow-visible py-4 text-base text-[15px] leading-relaxed transition-[padding] duration-500 lg:text-base xl:text-[17px]`}
					>
						{@html block.content}
					</div>
				</div>
			{/each}
		</div>

		<!-- right: gallery panel -->
		<div
			bind:this={galleryEl}
			class="sticky top-0 h-svh shrink-0 overflow-y-auto pt-12 transition-all duration-500 {splitView
				? 'w-1/2 opacity-100'
				: 'pointer-events-none w-0 overflow-hidden opacity-0'}"
		>
			<div class="w-full">
				<div class="w-full max-w-2xl">
					<!-- controls -->
					<div class="flex flex-wrap items-center gap-1 px-1 pt-2 pb-1">
						<!-- year switch -->
						<button
							class="flex items-center gap-1 text-[11px] text-neutral-500"
							onclick={() => (listView = !listView)}
						>
							<div
								class="relative h-3.5 w-6 rounded-full transition-colors {listView
									? 'bg-neutral-800'
									: 'bg-neutral-200'}"
							>
								<div
									class="absolute top-0.5 h-2.5 w-2.5 rounded-full bg-white transition-all {listView
										? 'left-3'
										: 'left-0.5'}"
								></div>
							</div>
							List
						</button>
						<div class="mx-1 h-3 w-px bg-neutral-200"></div>
						{#each allTypes as type (type)}
							{@const colors: Record<string, [string, string]> = {
				'Art & Design': ['#FAE8E8', '#B83537'],
				'Research': ['#DDEAF5', '#2E5F8A'],
				'Engineering': ['#E2F2DE', '#2D7A24'],
				'Community': ['#F0E4EE', '#7D4A77'],
				'Media': ['#FDF5D5', '#8A6A00'],
			}}
							<button
								class="rounded-full px-2 py-0.5 text-[10px] transition-opacity {activeFilter &&
								activeFilter !== type
									? 'opacity-30'
									: ''}"
								style="background-color: {colors[type]?.[0]}; color: {colors[type]?.[1]}"
								onclick={() => (activeFilter = activeFilter === type ? null : type)}>{type}</button
							>
						{/each}
					</div>

					{#if listView}
						<!-- list view -->
						<div class="flex flex-col py-2" transition:fade={{ duration: 150 }}>
							{#each visibleGroups as group (group.year)}
								<div
									class="mb-1 border-b border-neutral-200 pb-1 text-xs text-neutral-400 not-first:pt-3"
								>
									{group.year}
								</div>
								{#each group.projects as project (project.title)}
									{@const colors: Record<string, [string, string]> = {
						'Art & Design': ['#FAE8E8', '#B83537'],
						'Research': ['#DDEAF5', '#2E5F8A'],
						'Engineering': ['#E2F2DE', '#2D7A24'],
						'Community': ['#F0E4EE', '#7D4A77'],
						'Media': ['#FDF5D5', '#8A6A00'],
					}}
									<div
										transition:fade={{ duration: 150 }}
										animate:flip={{ duration: 300 }}
										class="flex items-center gap-2 border-b border-neutral-100 py-1"
									>
										<div class="h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-neutral-100">
											{#if project.image}
												<img
													src="/img/projects/{project.image}"
													alt={project.title}
													class="h-full w-full object-cover"
												/>
											{/if}
										</div>
										<span class="ml-1 min-w-0 flex-1 truncate text-[13px] text-neutral-700"
											>{project.title}</span
										>
										<div class="flex shrink-0 gap-1">
											{#each project.types as type (type)}
												<span
													class="rounded-full px-1.5 py-0.5 text-[10px] leading-none"
													style="background-color: {colors[type]?.[0]}; color: {colors[type]?.[1]}"
													>{type}</span
												>
											{/each}
										</div>
									</div>
								{/each}
							{/each}
						</div>
					{:else}
						<!-- grid view -->
						<div
							class="grid grid-cols-3 gap-2 py-2"
							bind:this={projectsGrid}
							style="grid-auto-rows: {rowSize}px; grid-auto-flow: dense"
							transition:fade={{ duration: 150 }}
						>
							{#each visibleGroups.flatMap((g) => g.projects) as project (project.title)}
								{@const colors: Record<string, [string, string]> = {
					'Art & Design': ['#FAE8E8', '#B83537'],
					'Research': ['#DDEAF5', '#2E5F8A'],
					'Engineering': ['#E2F2DE', '#2D7A24'],
					'Community': ['#F0E4EE', '#7D4A77'],
					'Media': ['#FDF5D5', '#8A6A00'],
				}}
								<div
									transition:fade={{ duration: 150 }}
									animate:flip={{ duration: 300 }}
									class="group relative overflow-hidden rounded-sm bg-neutral-100 hover:cursor-pointer {!project.size
										? 'aspect-square'
										: project.size === '2x2'
											? 'col-span-2 row-span-2'
											: 'col-span-2'}"
								>
									<div class="absolute inset-x-0 top-0 z-10 p-2" data-label>
										<div class="flex items-start justify-between gap-1">
											<div class="text-xs leading-tight text-balance text-neutral-600">
												{project.title}
											</div>
											<div class="flex shrink-0 gap-1 pt-0.5">
												{#each project.types as type (type)}
													<span
														class="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[7px] leading-none"
														style="background-color: {colors[type]?.[0]}; color: {colors[
															type
														]?.[1]}">{type.charAt(0)}</span
													>
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
												const label = (e.currentTarget as HTMLElement)
													.closest('.group')
													?.querySelector('[data-label]');
												if (label)
													(e.currentTarget as HTMLImageElement).style.transform =
														`translateY(${label.getBoundingClientRect().height}px)`;
											}}
											onmouseleave={(e) => {
												(e.currentTarget as HTMLImageElement).style.transform = 'translateY(0)';
											}}
										/>
									{/if}
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- ruler + dot + labels -->
<div
	class="pointer-events-none fixed right-0 z-50 px-2 py-2 {isMobile && showGallery
		? 'hidden'
		: isMobile
			? 'top-14 h-[calc(100svh-3.5rem-16px)]'
			: 'top-12 h-[calc(100svh-3rem-16px)]'}"
>
	<!-- ruler ticks -->
	<div class="absolute top-0 right-2 flex h-full flex-col items-end justify-between">
		{#each Array.from({ length: 41 }, (_, i) => i) as i (i)}
			<div class="relative flex items-center justify-end">
				{#if i === activeTick}
					{#if isScrolling}
						<span class="text-[10px] leading-none font-medium text-blue-500 tabular-nums"
							>{Math.round(
								isMobile && mobileContentEl
									? (mobileScrollY /
											(mobileContentEl.scrollHeight - mobileContentEl.clientHeight || 1)) *
											100
									: (scrollY / (document.body.scrollHeight - window.innerHeight || 1)) * 100
							)}</span
						>
					{:else}
						<div class="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
					{/if}
				{:else if splitView && !isMobile && i === galleryActiveTick}
					{#if isGalleryScrolling}
						<span class="text-[10px] leading-none font-medium text-purple-500 tabular-nums"
							>{Math.round(
								(galleryScrollY /
									((galleryEl?.scrollHeight ?? 1) - (galleryEl?.clientHeight ?? 0) || 1)) *
									100
							)}</span
						>
					{:else}
						<div class="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
					{/if}
				{:else}
					<div class={i % 10 === 0 ? 'h-px w-2.5 bg-neutral-600' : 'h-px w-1 bg-neutral-300'}></div>
				{/if}
			</div>
		{/each}
	</div>

	<!-- page labels (non-split mode: shifted left of ruler) -->
	{#each blocks as b, i (b.slug)}
		<button
			class="pointer-events-auto absolute text-right text-xs text-neutral-400 transition-all duration-300 hover:text-neutral-600 {isMobile &&
			!isScrolling
				? 'opacity-0'
				: ''}"
			style="top: {labelTops[i] ?? 0}px; right: 1.5rem; transform: translateY(-50%)"
			onclick={() => {
				const el = blockEls[i];
				if (el) window.scrollTo({ top: el.offsetTop - 48, behavior: 'smooth' });
			}}
		>
			{b.slug}
		</button>
	{/each}
</div>
