<script lang="ts">
	import { onMount } from 'svelte';

	type Props = { contentEl: HTMLElement | null; isScrolling: boolean; isMobile: boolean };
	let { contentEl, isScrolling, isMobile }: Props = $props();

	type LineEntry = { key: string; num: number; top: number };
	let lineEntries = $state<LineEntry[]>([]);
	let scrollTop = $state(0);

	// positions are relative to contentEl's own scrollable content (not the
	// page/document), since content now scrolls in its own container rather
	// than the body — a line's offset within that content is its viewport
	// position plus however far contentEl has already scrolled
	function updateLines() {
		if (!contentEl) {
			lineEntries = [];
			return;
		}
		const containerTop = contentEl.getBoundingClientRect().top;
		const els = contentEl.querySelectorAll<HTMLElement>('[data-line]');
		lineEntries = Array.from(els).map((el, i) => ({
			key: String(i),
			num: Number(el.dataset.line),
			top: el.getBoundingClientRect().top - containerTop + contentEl!.scrollTop
		}));
	}

	onMount(() => {
		const mo = new MutationObserver(() => requestAnimationFrame(updateLines));
		mo.observe(document.body, { childList: true, subtree: true });
		updateLines();
		return () => mo.disconnect();
	});

	$effect(() => {
		if (!contentEl) return;
		const handler = () => {
			scrollTop = contentEl!.scrollTop;
		};
		handler();
		contentEl.addEventListener('scroll', handler);
		return () => contentEl!.removeEventListener('scroll', handler);
	});

	$effect(() => {
		void isScrolling;
		updateLines();
	});
</script>

{#if !isMobile}
	<div
		class="pointer-events-none fixed top-0 left-0 z-40 h-svh w-8 overflow-hidden border-r border-neutral-200 bg-white"
	>
		{#each lineEntries as entry (entry.key)}
			<div
				class="absolute left-1/2 flex h-5 w-5 items-center justify-center rounded-full border border-neutral-900/20 font-mono text-[10px] text-neutral-900/50 tabular-nums"
				style="top: {entry.top - scrollTop}px; transform: translate(-50%, -50%)"
			>
				{entry.num}
			</div>
		{/each}
	</div>
{/if}
