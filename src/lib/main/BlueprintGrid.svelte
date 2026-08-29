<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	type Props = {
		contentEl: HTMLElement | null;
		panelEl: HTMLElement | null;
		isMobile: boolean;
	};

	let { contentEl, panelEl, isMobile }: Props = $props();

	// LineNumbers and Ruler are boxed in fixed 32px columns flush to the
	// viewport edges — the hatch gutter fills whatever's left between those
	// boxes and the real content/panel edges
	const CHROME_WIDTH = 32;

	let vw = $state(0);

	type Edge = { left: number; right: number; width: number };

	let contentRect = $state<Edge | null>(null);
	let panelRect = $state<Edge | null>(null);
	let vh = $state(0);
	let hoveredEdge = $state<'panel-left' | null>(null);

	function measure() {
		vh = window.innerHeight;
		vw = window.innerWidth;
		if (contentEl) {
			const r = contentEl.getBoundingClientRect();
			contentRect = { left: r.left, right: r.right, width: r.width };
		} else {
			contentRect = null;
		}
		if (panelEl) {
			const r = panelEl.getBoundingClientRect();
			panelRect = { left: r.left, right: r.right, width: r.width };
		} else {
			panelRect = null;
		}
	}

	onMount(() => {
		measure();
		// tracks scroll, resize, and content/layout changes (panel open/close,
		// content loading in) so the lines always match the real rendered edges
		window.addEventListener('resize', measure);
		window.addEventListener('scroll', measure, { passive: true });

		// the content column and side panel animate width via CSS transition
		// (panel open/close) — track those transitions frame-by-frame so the
		// lines slide with the panel instead of snapping at the end
		let rafId: number | null = null;
		const tick = () => {
			measure();
			rafId = requestAnimationFrame(tick);
		};
		const startTracking = () => {
			if (rafId !== null) return;
			rafId = requestAnimationFrame(tick);
		};
		const stopTracking = () => {
			if (rafId !== null) cancelAnimationFrame(rafId);
			rafId = null;
			measure();
		};
		document.addEventListener('transitionrun', startTracking);
		document.addEventListener('transitionend', stopTracking);
		document.addEventListener('transitioncancel', stopTracking);

		return () => {
			window.removeEventListener('resize', measure);
			window.removeEventListener('scroll', measure);
			document.removeEventListener('transitionrun', startTracking);
			document.removeEventListener('transitionend', stopTracking);
			document.removeEventListener('transitioncancel', stopTracking);
			if (rafId !== null) cancelAnimationFrame(rafId);
		};
	});

	// re-subscribes whenever contentEl/panelEl change — panelEl starts null
	// and is only assigned later once a panel opens, so an observer set up
	// once at mount would never see the real panel element at all
	$effect(() => {
		measure();
		const ro = new ResizeObserver(measure);
		if (contentEl) ro.observe(contentEl);
		if (panelEl) ro.observe(panelEl);
		ro.observe(document.body);
		return () => ro.disconnect();
	});

	// right hatch gutter: panel's own right edge to the ruler box, when a
	// panel is open — otherwise the content column's right edge, matching
	// the left gutter's numbers-[hatch]-content pattern
	let rightGutterStart = $derived(panelRect ? panelRect.right : (contentRect?.right ?? null));
</script>

{#if !isMobile}
	<div class="pointer-events-none fixed inset-0 z-0" transition:fade={{ duration: 250 }}>
		{#if contentRect}
			<!-- content column left edge -->
			<div
				class="pointer-events-none absolute top-0 w-px bg-neutral-200 dark:bg-neutral-800"
				style="left: {contentRect.left}px; height: {vh}px"
			></div>
			<!-- content column right edge — only drawn when no panel is open,
			     since an open panel's own left edge (below) already marks the
			     real right boundary of the visible layout at that point -->
			{#if !panelRect}
				<div
					class="pointer-events-none absolute top-0 w-px bg-neutral-200 dark:bg-neutral-800"
					style="left: {contentRect.right}px; height: {vh}px"
				></div>
			{/if}
		{/if}

		{#if panelRect}
			<div
				class="pointer-events-auto absolute top-0 w-3 -translate-x-1/2"
				style="left: {panelRect.left}px; height: {vh}px"
				onmouseenter={() => (hoveredEdge = 'panel-left')}
				onmouseleave={() => (hoveredEdge = null)}
				role="presentation"
			></div>
			{#if hoveredEdge === 'panel-left'}
				<div
					class="absolute top-12 flex -translate-x-1/2 items-center gap-1 rounded-sm bg-white px-1.5 py-0.5 font-mono text-[10px] text-purple-500 shadow-sm dark:bg-neutral-900"
					style="left: {panelRect.left}px"
				>
					{Math.round(panelRect.width)}px
				</div>
			{/if}
		{/if}

		<!-- diagonal hatch gutters — fill the gap between the boxed
		     line-number/ruler columns (flush to the viewport edge) and the
		     real content/panel edge. --pattern-fg flips from a dark line (on
		     the light background) to a light line (on the dark background) —
		     a dark-on-dark pattern would be invisible otherwise. -->
		{#if contentRect && contentRect.left > CHROME_WIDTH}
			<div
				class="absolute top-0 bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] bg-fixed [--pattern-fg:var(--color-neutral-900)]/5 dark:[--pattern-fg:var(--color-neutral-100)]/10"
				style="left: {CHROME_WIDTH}px; width: {contentRect.left - CHROME_WIDTH}px; height: {vh}px"
			></div>
		{/if}
		{#if rightGutterStart !== null && vw - CHROME_WIDTH > rightGutterStart}
			<div
				class="absolute top-0 bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] bg-fixed [--pattern-fg:var(--color-neutral-900)]/5 dark:[--pattern-fg:var(--color-neutral-100)]/10"
				style="left: {rightGutterStart}px; width: {vw - CHROME_WIDTH - rightGutterStart}px; height: {vh}px"
			></div>
		{/if}
	</div>
{/if}
