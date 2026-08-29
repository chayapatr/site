<script lang="ts">
	import { view } from '$lib/store.svelte';
	import { kernel } from '$lib/os/kernel/store';
	import { fly } from 'svelte/transition';

	type Props = {
		isMobile: boolean;
		showGallery: boolean;
		bostonTime: string;
		onToggleGallery?: () => void;
	};

	let { isMobile, showGallery, bostonTime, onToggleGallery }: Props = $props();

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
	class="text-md fixed top-0 right-0 left-0 z-50 overflow-hidden border-b leading-none backdrop-blur-md transition-colors duration-500"
	class:border-neutral-800={view.showOS}
	class:bg-neutral-900={view.showOS}
	class:border-neutral-200={!view.showOS}
	class:dark:border-neutral-800={!view.showOS}
	class:bg-white={!view.showOS}
	class:dark:bg-neutral-900={!view.showOS}
	style="height: 2.25rem; padding: {isMobile ? '0 0.5rem 0 1rem' : '0'};"
>
	{#if view.showOS}
		<div
			class="flex items-center gap-2 {isMobile ? 'h-full w-full' : 'absolute inset-0 px-5'}"
			transition:fly={{ y: -8, duration: 250 }}
		>
			<button
				onclick={() => (view.showOS = false)}
				class="text-md flex shrink-0 cursor-pointer items-center gap-1.5 text-neutral-400 hover:text-neutral-200"
				><img src="/imgs/pub.svg" alt="Pub" class="h-4 w-4" />PubOS</button
			>

			<div
				class="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto {isMobile
					? ''
					: 'ml-2 divide-x divide-neutral-500'}"
			>
				{#each [...$kernel.processes.values()] as proc}
					{#if proc.windowId}
						{@const focused = $kernel.windows.get(proc.windowId)?.focused}
						<button
							class="shrink-0 cursor-pointer transition-colors {isMobile
								? 'border px-2 py-0.5 font-mono text-xs'
								: 'px-4 text-sm'}"
							style={focused
								? isMobile
									? 'border-color: var(--os-text); color: var(--os-text);'
									: 'color: var(--os-text);'
								: isMobile
									? 'border-color: var(--os-border); color: var(--os-text-dim);'
									: 'color: var(--os-text-dim);'}
							onclick={() => focusWindow(proc.windowId)}>{proc.name}</button
						>
					{/if}
				{/each}
			</div>

			{#if !isMobile}
				<div class="text-md ml-auto shrink-0 text-neutral-600">{bostonTime} (Boston)</div>
			{/if}
		</div>
	{:else if isMobile}
		<div
			class="flex h-full w-full items-center justify-between text-black dark:text-neutral-100"
			transition:fly={{ y: -8, duration: 250 }}
		>
			<div class="flex items-center gap-3">
				{#if showGallery}
					<button
						class="cursor-pointer {view.rightPanel === 'projects' ? '' : 'text-neutral-400'}"
						onclick={() => {
							view.rightPanel = view.rightPanel === 'projects' ? null : 'projects';
						}}>{view.rightPanel === 'projects' ? '🌱 Projects' : 'Projects'}</button
					>
					<button
						class="cursor-pointer {view.rightPanel === 'writings' ? '' : 'text-neutral-400'}"
						onclick={() => {
							view.rightPanel = view.rightPanel === 'writings' ? null : 'writings';
						}}>{view.rightPanel === 'writings' ? '🖋️ Writings' : 'Writings'}</button
					>
				{:else}
					<button onclick={() => (view.showOS = !view.showOS)} class="flex cursor-pointer items-center gap-1.5"
						><img src="/imgs/pub.svg" alt="Pub" class="h-4 w-4" />Pub</button
					>
				{/if}
			</div>
			<button
				class="flex cursor-pointer items-center gap-1 text-[11px] text-neutral-500"
				aria-label="Toggle gallery"
				onclick={onToggleGallery}
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
		<div
			class="absolute inset-0 flex items-center justify-between gap-1.5 px-5 text-black dark:text-neutral-100"
			transition:fly={{ y: -8, duration: 250 }}
		>
			<button
				onclick={() => (view.showOS = !view.showOS)}
				class="flex cursor-pointer items-center gap-1.5"
			>
				<img src="/imgs/pub.svg" alt="Pub" class="h-4 w-4" />Pub</button
			>
			<button
				class="cursor-pointer"
				onclick={() => (view.rightPanel = view.rightPanel === 'projects' ? null : 'projects')}
				>{view.rightPanel === 'projects' ? '🌱 Projects' : 'Projects'}</button
			>
			<button
				class="cursor-pointer"
				onclick={() => (view.rightPanel = view.rightPanel === 'writings' ? null : 'writings')}
				>{view.rightPanel === 'writings' ? '🖋️ Writings' : 'Writings'}</button
			>
			<div>{bostonTime} (Boston)</div>
		</div>
	{/if}
</div>
