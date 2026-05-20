<script lang="ts">
	import { view } from '$lib/store.svelte';
	import { kernel } from '$lib/os/kernel/store';
	import { fly } from 'svelte/transition';

	type Props = {
		isMobile: boolean;
		showGallery: boolean;
		splitView: boolean;
		bostonTime: string;
		onToggleGallery?: () => void;
		onToggleSplit?: () => void;
	};

	let { isMobile, showGallery, splitView, bostonTime, onToggleGallery, onToggleSplit }: Props = $props();

	function focusWindow(windowId: string | null) {
		if (!windowId) return;
		kernel.update((s) => {
			for (const [id, win] of s.windows) {
				win.focused = id === windowId;
				if (id === windowId) win.minimized = false;
			}
			return s;
		});
	}
</script>

<div
	class="text-md fixed top-0 right-0 left-0 z-50 overflow-hidden border-b leading-none backdrop-blur-md transition-colors duration-500 {view.showOS
		? 'border-neutral-800 bg-neutral-900/80'
		: 'border-neutral-200 bg-white/70'} {isMobile ? 'pt-2.5 pr-2 pl-4' : 'h-8'}"
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
				onclick={onToggleGallery}
			>
				<div class="relative h-3.5 w-6 rounded-full transition-colors {showGallery ? 'bg-neutral-800' : 'bg-neutral-200'}">
					<div class="absolute top-0.5 h-2.5 w-2.5 rounded-full bg-white transition-all {showGallery ? 'left-3' : 'left-0.5'}"></div>
				</div>
			</button>
		</div>
	{:else if view.showOS}
		<div class="absolute inset-0 flex items-center px-5" transition:fly={{ y: -8, duration: 250 }}>
			<button
				onclick={() => (view.showOS = false)}
				class="text-md text-neutral-400 hover:text-neutral-200"
			>
				PubOS
			</button>
			<div class="ml-4 flex items-center divide-x divide-neutral-500">
				{#each [...$kernel.processes.values()] as proc}
					{#if proc.windowId}
						{@const focused = $kernel.windows.get(proc.windowId)?.focused}
						<button
							class="px-4 text-sm transition-colors"
							class:text-neutral-300={focused}
							class:text-neutral-500={!focused}
							onclick={() => focusWindow(proc.windowId)}
						>
							{proc.name}
						</button>
					{/if}
				{/each}
			</div>
			<div class="text-md ml-auto text-neutral-600">{bostonTime} (Boston)</div>
		</div>
	{:else}
		<div class="absolute inset-0 flex items-center justify-between gap-1.5 px-5" transition:fly={{ y: -8, duration: 250 }}>
			<button onclick={() => (view.showOS = !view.showOS)} class:text-neutral-400={!view.showOS}>Pub</button>
			<button onclick={onToggleSplit}>{splitView ? '🌱 Projects' : 'Projects'}</button>
			<div>Writings</div>
			<div>Settings</div>
			<div>{bostonTime} (Boston)</div>
		</div>
	{/if}
</div>
