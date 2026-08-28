<script lang="ts">
	import { fade } from 'svelte/transition';
	import { floatingPanels, visibilityState } from './store.svelte';
	import FloatingPanel from './FloatingPanel.svelte';
	import FloatingToolbar from './FloatingToolbar.svelte';
	import FloatingMiniMap from './FloatingMiniMap.svelte';

	let showMiniMap = $state(true);

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

{#if floatingPanels.length > 0}
	{#if !visibilityState.hidden}
		<!-- dims the rest of the page while any panel is open, clears once the
		     last one closes. NavBar/Ruler/LineNumbers all sit at z-50, so the dim
		     needs to be above that (z-60) to actually cover them, and the panels
		     layer above the dim itself (z-70). Fades in/out quickly so the dim
		     never just pops in — no sudden jump behind the panel. -->
		<div
			class="pointer-events-none fixed inset-0 z-60 bg-black/80"
			transition:fade={{ duration: 120 }}
		></div>

		<svg class="pointer-events-none fixed inset-0 z-65 h-full w-full">
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

		<div class="fixed inset-0 z-70">
			{#each floatingPanels as panel (panel.id)}
				<FloatingPanel {panel} />
			{/each}
		</div>

		{#if showMiniMap}
			<div class="pointer-events-auto fixed right-4 bottom-4 z-80">
				<FloatingMiniMap />
			</div>
		{/if}
	{/if}

	<!-- toolbar always stays, even while panels are hidden, so [👁️] can bring
	     them back -->
	<FloatingToolbar bind:showMiniMap />
{/if}
