<script lang="ts">
	import { fade } from 'svelte/transition';
	import {
		focusPanel,
		closeFloatingPanel,
		openFloatingPanel,
		focusState,
		type FloatingPanel,
	} from './store.svelte';
	import LinkTooltip from '$lib/main/LinkTooltip.svelte';

	type Props = { panel: FloatingPanel };
	let { panel }: Props = $props();

	let contentEl = $state<HTMLElement | null>(null);
	let dragging = $state(false);
	let resizing = $state(false);
	let isFocused = $derived(focusState.id === panel.id);

	// only the focused panel gets an amber accent — bright while just
	// focused/idle, darker while actively being dragged/resized; every
	// other panel stays neutral
	let borderClass = $derived(
		isFocused ? (dragging || resizing ? 'border-amber-700' : 'border-amber-400') : 'border-neutral-700'
	);

	const MIN_WIDTH = 280;
	const MIN_HEIGHT = 200;
	const MAX_WIDTH = 900;

	function startDrag(e: MouseEvent) {
		if (resizing) return;
		focusPanel(panel.id);
		dragging = true;
		e.preventDefault();
	}

	function startResize(e: MouseEvent) {
		focusPanel(panel.id);
		resizing = true;
		e.preventDefault();
		e.stopPropagation();
	}

	function handlePointerMove(e: MouseEvent) {
		if (dragging) {
			panel.x += e.movementX;
			panel.y += e.movementY;
		} else if (resizing) {
			panel.width = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, panel.width + e.movementX));
			panel.height = Math.max(MIN_HEIGHT, panel.height + e.movementY);
		}
	}

	function stopInteraction() {
		dragging = false;
		resizing = false;
	}

	function handleContentClick(e: MouseEvent) {
		const target = (e.target as HTMLElement).closest('[data-internal-slug]') as HTMLElement | null;
		if (!target) return;
		e.preventDefault();
		const slug = target.dataset.internalSlug;
		if (!slug) return;
		openFloatingPanel(slug, panel.id);
	}
</script>

<svelte:window onmousemove={handlePointerMove} onmouseup={stopInteraction} />

<div
	class="fixed rounded-md border shadow-lg {borderClass}"
	style="left: {panel.x}px; top: {panel.y}px; width: {panel.width}px; height: {panel.height}px; z-index: {panel.z}; background: rgba(20, 20, 20, 0.8); backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px);"
	onmousedown={() => focusPanel(panel.id)}
	role="presentation"
	transition:fade={{ duration: 120 }}
>
	<div
		class="flex cursor-grab items-center justify-between gap-2 rounded-t-md border-b border-neutral-700 bg-black/30 px-2 py-1 select-none active:cursor-grabbing"
		onmousedown={startDrag}
		role="presentation"
	>
		<span class="min-w-0 truncate font-mono text-xs text-neutral-400">{panel.title}</span>
		<button
			class="shrink-0 cursor-pointer text-xs text-neutral-400 hover:text-red-400"
			onclick={() => closeFloatingPanel(panel.id)}
			aria-label="Close panel"
		>
			[x]
		</button>
	</div>

	<div
		bind:this={contentEl}
		class="h-[calc(100%-2rem)] overflow-y-auto overscroll-none px-3 pt-3 pb-4"
		onclick={handleContentClick}
		onkeydown={() => {}}
		role="presentation"
	>
		{#if panel.loading}
			<div class="animate-pulse font-mono text-xs text-neutral-500">loading…</div>
		{:else}
			<div class="panel-prose prose prose-invert max-w-none text-[15px] leading-relaxed">
				{@html panel.content}
			</div>
		{/if}
	</div>

	<button
		onmousedown={startResize}
		class="absolute right-0 bottom-0 aspect-square w-3 cursor-se-resize rounded-br-md border-r-2 border-b-2 border-neutral-600"
		aria-label="Resize panel"
	></button>
</div>

<LinkTooltip containerEl={contentEl} />

<style>
	/* matches the v10 reference's accent colors for markdown content: pink
	   emphasis, yellow-green external links. :global() is required since
	   this content is injected via {@html}, not authored in this component. */
	.panel-prose :global(em) {
		color: #ff82b2;
	}

	.panel-prose :global(.external-link) {
		color: #e0f66f;
	}

	.panel-prose :global(.external-link:hover) {
		color: #e5fa74;
	}

	/* the global underline color (rgb(58,58,230), a dark blue) is invisible
	   on this panel's dark background — use the same yellow as the link
	   hover tooltip (LinkTooltip.svelte's #FFF8A7 background) instead */
	.panel-prose :global([data-internal-slug]:hover) {
		text-decoration: underline wavy 1.5px #fff8a7;
	}
</style>
