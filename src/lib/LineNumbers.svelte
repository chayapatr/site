<script lang="ts">
	import { onMount } from 'svelte';

	type Props = { scrollY: number; isMobile: boolean };
	let { scrollY, isMobile }: Props = $props();

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

	$effect(() => {
		scrollY; // reactive dependency
		updateLines();
	});
</script>

{#if !isMobile}
	<div class="pointer-events-none fixed top-12 left-0 z-40 h-screen overflow-hidden px-5">
		{#each lineEntries as entry (entry.key)}
			<div class="absolute left-5 text-xs text-neutral-400" style="top: {entry.top - scrollY - 48}px">
				{entry.num}
			</div>
		{/each}
	</div>
{/if}
