<script lang="ts">
	import type { Window as WinType } from '$lib/os/kernel/types';
	import type { Snippet } from 'svelte';
	import { isDragging } from './drag';

	let {
		win,
		onFocus,
		onClose,
		onMinimize,
		onMove,
		onResize,
		children
	}: {
		win: WinType;
		onFocus: () => void;
		onClose: () => void;
		onMinimize: () => void;
		onMove: (x: number, y: number) => void;
		onResize: (w: number, h: number) => void;
		children: Snippet;
	} = $props();

	const iconPath = $derived((win.appState.icon as string) || '')

	type Edge = 'n'|'s'|'e'|'w'|'ne'|'nw'|'se'|'sw'

	let dragging = $state(false);
	let resizeEdge = $state<Edge | null>(null);
	let dragStart = $state({ x: 0, y: 0, wx: 0, wy: 0 });
	let resizeStart = $state({ x: 0, y: 0, w: 0, h: 0, wx: 0, wy: 0 });

	let localX = $state(win.position.x);
	let localY = $state(win.position.y);
	let localW = $state(win.size.width);
	let localH = $state(win.size.height);
	let fullscreen = $state(false);
	let preFullscreen = { x: 0, y: 0, w: 0, h: 0 };

	function toggleFullscreen() {
		if (!fullscreen) {
			preFullscreen = { x: localX, y: localY, w: localW, h: localH };
			localX = 0; localY = 32;
			localW = window.innerWidth;
			localH = window.innerHeight - 32;
			fullscreen = true;
		} else {
			localX = preFullscreen.x; localY = preFullscreen.y;
			localW = preFullscreen.w; localH = preFullscreen.h;
			fullscreen = false;
		}
	}

	function startDrag(e: MouseEvent | TouchEvent) {
		if (fullscreen) return;
		if ((e.target as HTMLElement).closest('.no-drag')) return;
		const pt = 'touches' in e ? e.touches[0] : e;
		dragging = true;
		isDragging.set(true);
		dragStart = { x: pt.clientX, y: pt.clientY, wx: localX, wy: localY };
		onFocus();
	}

	function startResize(e: MouseEvent | TouchEvent, edge: Edge) {
		e.stopPropagation();
		const pt = 'touches' in e ? e.touches[0] : e;
		resizeEdge = edge;
		isDragging.set(true);
		resizeStart = { x: pt.clientX, y: pt.clientY, w: localW, h: localH, wx: localX, wy: localY };
	}

	$effect(() => {
		document.body.style.userSelect = (dragging || resizeEdge) ? 'none' : ''
	})

	function move(clientX: number, clientY: number) {
		if (dragging) {
			localX = dragStart.wx + (clientX - dragStart.x);
			localY = dragStart.wy + (clientY - dragStart.y);
		}
		if (resizeEdge) {
			const dx = clientX - resizeStart.x;
			const dy = clientY - resizeStart.y;
			if (resizeEdge.includes('e')) localW = Math.max(320, resizeStart.w + dx);
			if (resizeEdge.includes('s')) localH = Math.max(200, resizeStart.h + dy);
			if (resizeEdge.includes('w')) {
				const nw = Math.max(320, resizeStart.w - dx);
				localX = resizeStart.wx + (resizeStart.w - nw);
				localW = nw;
			}
			if (resizeEdge.includes('n')) {
				const nh = Math.max(200, resizeStart.h - dy);
				localY = resizeStart.wy + (resizeStart.h - nh);
				localH = nh;
			}
		}
	}

	function onMouseMove(e: MouseEvent) { move(e.clientX, e.clientY) }
	function onTouchMove(e: TouchEvent) { if (dragging || resizeEdge) { e.preventDefault(); move(e.touches[0].clientX, e.touches[0].clientY) } }

	function onMouseUp() {
		if (dragging) onMove(localX, localY);
		if (resizeEdge) onResize(localW, localH);
		dragging = false;
		resizeEdge = null;
		isDragging.set(false);
	}

	const onTouchEnd = onMouseUp;
</script>

<svelte:window onmousemove={onMouseMove} onmouseup={onMouseUp} ontouchmove={onTouchMove} ontouchend={onTouchEnd} />

<div
	class="absolute rounded-md border text-xs shadow-sm"
	class:border-neutral-600={win.focused}
	class:border-neutral-800={!win.focused}
	style="left:{localX}px; top:{localY}px; width:{localW}px; height:{localH}px; z-index:{win.zIndex}; background: var(--os-glass); backdrop-filter: var(--os-glass-blur); -webkit-backdrop-filter: var(--os-glass-blur);"
	onmousedown={onFocus}
	role="none"
>
	<!-- inner clip for rounded corners without breaking backdrop-filter -->
	<div class="flex h-full flex-col overflow-hidden rounded-md">
		<!-- Title bar -->
		<div
			class="no-drag-wrapper noselect flex w-full shrink-0 cursor-default items-center justify-between border-b p-2 select-none"
			style="border-color: var(--os-border); background: var(--os-glass); backdrop-filter: blur(2px); -webkit-backdrop-filter: blur(2px); color: var(--os-text-dim); touch-action: none;"
			onmousedown={startDrag}
			ontouchstart={startDrag}
			role="none"
		>
			<div class="no-drag flex gap-2">
				<button class="hover:text-red-400 transition-colors" style="color: var(--os-text-dim);" aria-label="Close" onclick={onClose}>[x]</button>
				<button class="hover:text-yellow-400 transition-colors" style="color: var(--os-text-dim);" aria-label="Minimize" onclick={onMinimize}>[-]</button>
				<button class="hover:text-green-400 transition-colors" style="color: var(--os-text-dim);" aria-label="Fullscreen" onclick={toggleFullscreen}>{fullscreen ? '[↙]' : '[↗]'}</button>
			</div>
			<span class="absolute left-1/2 -translate-x-1/2 font-mono text-xs" style="color: var(--os-text-dim);">{win.title}</span>
			<div class="flex items-center">
				{#if iconPath}
					<img src={iconPath} alt={win.appType} class="h-4 w-4 opacity-50" />
				{/if}
			</div>
		</div>

		<div class="relative flex-1 overflow-hidden">
			{@render children()}
			{#if !win.focused}
				<div
					class="absolute inset-0 z-10"
					role="none"
					onmousedown={() => onFocus()}
				></div>
			{/if}
		</div>
	</div>

	<!-- Resize handles — desktop (mouse only) -->
	<div class="absolute top-0 left-0 h-2 w-2 cursor-nw-resize max-md:hidden" onmousedown={(e) => startResize(e, 'nw')} role="none"></div>
	<div class="absolute top-0 right-0 h-2 w-2 cursor-ne-resize max-md:hidden" onmousedown={(e) => startResize(e, 'ne')} role="none"></div>
	<div class="absolute bottom-0 left-0 h-2 w-2 cursor-sw-resize max-md:hidden" onmousedown={(e) => startResize(e, 'sw')} role="none"></div>
	<div class="absolute bottom-0 right-0 h-2 w-2 cursor-se-resize max-md:hidden" onmousedown={(e) => startResize(e, 'se')} role="none"></div>
	<div class="absolute top-0 left-2 right-2 h-1 cursor-n-resize max-md:hidden" onmousedown={(e) => startResize(e, 'n')} role="none"></div>
	<div class="absolute bottom-0 left-2 right-2 h-1 cursor-s-resize max-md:hidden" onmousedown={(e) => startResize(e, 's')} role="none"></div>
	<div class="absolute top-2 bottom-2 left-0 w-1 cursor-w-resize max-md:hidden" onmousedown={(e) => startResize(e, 'w')} role="none"></div>
	<div class="absolute top-2 bottom-2 right-0 w-1 cursor-e-resize max-md:hidden" onmousedown={(e) => startResize(e, 'e')} role="none"></div>

	<!-- Resize handles — mobile (touch, bottom corners only) -->
	<div
		class="absolute bottom-0 left-0 hidden h-8 w-8 cursor-sw-resize items-end justify-start p-1 max-md:flex"
		style="touch-action: none;"
		onmousedown={(e) => startResize(e, 'sw')}
		ontouchstart={(e) => startResize(e, 'sw')}
		role="none"
	>
		<div class="h-3 w-3 border-b-2 border-l-2 rounded-bl" style="border-color: var(--os-text-dim);"></div>
	</div>
	<div
		class="absolute bottom-0 right-0 hidden h-8 w-8 cursor-se-resize items-end justify-end p-1 max-md:flex"
		style="touch-action: none;"
		onmousedown={(e) => startResize(e, 'se')}
		ontouchstart={(e) => startResize(e, 'se')}
		role="none"
	>
		<div class="h-3 w-3 border-b-2 border-r-2 rounded-br" style="border-color: var(--os-text-dim);"></div>
	</div>
</div>
