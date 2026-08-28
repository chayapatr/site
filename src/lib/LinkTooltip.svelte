<script lang="ts">
	// link hover tooltip — shows the real destination (external URL, or the
	// original path for internal links, which content.ts otherwise rewrites
	// to href="#") near the cursor. Self-contained: pass the container
	// element to watch and it handles its own hover/scroll tracking.
	type Props = { containerEl: HTMLElement | null };
	let { containerEl }: Props = $props();

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

	$effect(() => {
		if (!containerEl) return;
		containerEl.addEventListener('mousemove', handlePointerMove);
		containerEl.addEventListener('mouseleave', handlePointerLeave);
		// scrolling moves content under a stationary cursor without firing
		// mousemove/mouseleave — clear so the tooltip doesn't stay stuck
		containerEl.addEventListener('scroll', handlePointerLeave);
		return () => {
			containerEl!.removeEventListener('mousemove', handlePointerMove);
			containerEl!.removeEventListener('mouseleave', handlePointerLeave);
			containerEl!.removeEventListener('scroll', handlePointerLeave);
		};
	});
</script>

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
