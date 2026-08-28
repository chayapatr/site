<script lang="ts">
	import { fade } from 'svelte/transition';
	import { floatingPanels, visibilityState } from './store.svelte';
	import FloatingPanel from './FloatingPanel.svelte';
	import FloatingToolbar from './FloatingToolbar.svelte';
	import FloatingMiniMap from './FloatingMiniMap.svelte';

	let showMiniMap = $state(true);
	// single derived flag instead of two nested {#if}s — a panel exists AND
	// the layer isn't toggled off. Two separate {#if} boundaries that happen
	// to flip true in the same tick (e.g. the very first panel opening, when
	// "hidden" was already false) don't reliably fire the inner block's own
	// transition:fade, since Svelte treats the inner block as part of the
	// outer block's initial mount rather than as its own toggle.
	let layerVisible = $derived(floatingPanels.length > 0 && !visibilityState.hidden);

	// panel-center-to-panel-center connector for any panel opened from a
	// link inside another panel (parentId set) — panels opened from the
	// main article (parentId null) get no line
	function connector(panel: (typeof floatingPanels)[number]) {
		if (panel.parentId === null) return null;
		const parent = floatingPanels.find((p) => p.id === panel.parentId);
		if (!parent) return null;
		return {
			x1: parent.x + parent.width / 2,
			y1: parent.y + parent.height / 2,
			x2: panel.x + panel.width / 2,
			y2: panel.y + panel.height / 2,
		};
	}
</script>

{#if layerVisible}
	<div
		class="pointer-events-none fixed inset-0 z-60 bg-black/80"
		transition:fade={{ duration: 120 }}
	></div>

	<svg
		class="pointer-events-none fixed inset-0 z-65 h-full w-full"
		transition:fade={{ duration: 120 }}
	>
		{#each floatingPanels as panel (panel.id)}
			{@const line = connector(panel)}
			{#if line}
				<line
					x1={line.x1}
					y1={line.y1}
					x2={line.x2}
					y2={line.y2}
					stroke="#fbbf24"
					stroke-width="2"
					opacity="0.5"
				/>
			{/if}
		{/each}
	</svg>

	<div class="fixed inset-0 z-70" transition:fade={{ duration: 120 }}>
		{#each floatingPanels as panel (panel.id)}
			<FloatingPanel {panel} />
		{/each}
	</div>

	{#if showMiniMap}
		<div
			class="pointer-events-auto fixed right-4 bottom-4 z-80"
			transition:fade={{ duration: 120 }}
		>
			<FloatingMiniMap />
		</div>
	{/if}
{/if}

<!-- toolbar has its own top-level {#if}: it must stay mounted even while
     the layer above is hidden (floatingPanels.length > 0 but hidden === true),
     so [👁️] remains clickable to bring the layer back -->
{#if floatingPanels.length > 0}
	<FloatingToolbar bind:showMiniMap />
{/if}
