<script lang="ts">
	import { floatingPanels, visibilityState, openFloatingPanel } from './store.svelte';

	type Props = { showMiniMap: boolean };
	let { showMiniMap = $bindable() }: Props = $props();
</script>

<div
	class="noselect pointer-events-none fixed bottom-0 left-0 z-80 flex w-screen flex-col items-center justify-center gap-2 p-3"
>
	<div
		class="pill pointer-events-auto flex items-center rounded-full border p-1 text-sm shadow-sm transition-[gap] duration-200 {visibilityState.hidden
			? 'is-light gap-0'
			: 'gap-16'}"
	>
		<div class="collapsible flex items-center pl-2 {visibilityState.hidden ? 'is-collapsed' : ''}">
			<span class="font-mono text-xs whitespace-nowrap text-neutral-400">
				{floatingPanels.length} panel{floatingPanels.length === 1 ? '' : 's'}
			</span>
		</div>
		<div class="flex items-center {visibilityState.hidden ? '' : 'gap-1.5'}">
			<div
				class="collapsible flex items-center gap-1.5 {visibilityState.hidden ? 'is-collapsed' : ''}"
			>
				<button
					class="dot cursor-pointer"
					title="Add root"
					onclick={() => openFloatingPanel('!@$')}
				>
					🌱
				</button>
				<button
					class="dot cursor-pointer"
					title="Toggle minimap"
					onclick={() => (showMiniMap = !showMiniMap)}
				>
					🗺️
				</button>
			</div>
			<button
				title={visibilityState.hidden ? 'Show panels' : 'Hide panels'}
				class="dot cursor-pointer"
				onclick={() => (visibilityState.hidden = !visibilityState.hidden)}
			>
				👁️
			</button>
		</div>
	</div>
</div>

<style>
	/* dark glass by default (matches the v10 reference's .glass-dark),
	   switches to light glass while collapsed via .is-light — both the pill
	   and the dot buttons cross-fade between the two using CSS variables so
	   everything transitions together instead of snapping */
	.pill {
		--pill-bg: rgba(20, 20, 20, 0.8);
		--pill-border: #262626;
		--dot-bg: #262626;
		--dot-hover-bg: #333;
		--dot-border: #404040;
		color: white;
		background: var(--pill-bg);
		border-color: var(--pill-border);
		backdrop-filter: blur(3px);
		-webkit-backdrop-filter: blur(3px);
		transition:
			background 200ms ease,
			border-color 200ms ease,
			color 200ms ease;
	}

	.pill.is-light {
		--pill-bg: rgba(255, 255, 255, 0.8);
		--pill-border: #e5e5e5;
		--dot-bg: #f5f5f5;
		--dot-hover-bg: #e5e5e5;
		--dot-border: #d4d4d4;
		color: #404040;
	}

	.dot {
		display: flex;
		aspect-ratio: 1;
		width: 1.75rem;
		height: 1.75rem;
		align-items: center;
		justify-content: center;
		border-radius: 9999px;
		border: 1px solid var(--dot-border);
		background: var(--dot-bg);
		transition:
			background 200ms ease,
			border-color 200ms ease;
	}

	.dot:hover {
		background: var(--dot-hover-bg);
	}

	/* collapse/expand animation for the toolbar's non-essential buttons —
	   max-width + opacity (not display:none, which can't transition) so the
	   pill visibly shrinks down to just the eye button and back */
	.collapsible {
		max-width: 200px;
		opacity: 1;
		overflow: hidden;
		transition:
			max-width 200ms ease,
			opacity 150ms ease,
			padding-left 200ms ease;
	}

	.collapsible.is-collapsed {
		max-width: 0;
		opacity: 0;
		padding-left: 0;
	}
</style>
