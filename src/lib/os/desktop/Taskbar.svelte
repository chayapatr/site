<script lang="ts">
	import { kernel } from '$lib/os/kernel/store';

	let time = $state(new Date().toLocaleTimeString());
	setInterval(() => {
		time = new Date().toLocaleTimeString();
	}, 1000);


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
	class="fixed top-0 right-0 left-0 z-9999 flex items-center gap-2 border-b px-3"
	style="height: 32px; border-color: var(--os-border); background: var(--os-glass); backdrop-filter: var(--os-glass-blur); -webkit-backdrop-filter: var(--os-glass-blur);"
>
	<span class="mr-2 shrink-0 font-mono text-xs" style="color: var(--os-text);">pubOS</span>

	{#each [...$kernel.processes.values()] as proc}
		{#if proc.windowId}
			{@const focused = $kernel.windows.get(proc.windowId)?.focused}
			<button
				class="border px-2 py-0.5 font-mono text-xs transition-colors"
				style={focused
					? 'border-color: var(--os-text); color: var(--os-text);'
					: 'border-color: var(--os-border); color: var(--os-text-dim);'}
				onclick={() => focusWindow(proc.windowId)}
			>
				{proc.name}
			</button>
		{/if}
	{/each}

	<div class="ml-auto font-mono text-xs" style="color: var(--os-text-dim);">{time}</div>
</div>
