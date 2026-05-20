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

	function startDrag(e: MouseEvent) {
		if (fullscreen) return;
		if ((e.target as HTMLElement).closest('.no-drag')) return;
		dragging = true;
		isDragging.set(true);
		dragStart = { x: e.clientX, y: e.clientY, wx: localX, wy: localY };
		onFocus();
	}

	function startResize(e: MouseEvent, edge: Edge) {
		e.stopPropagation();
		resizeEdge = edge;
		isDragging.set(true);
		resizeStart = { x: e.clientX, y: e.clientY, w: localW, h: localH, wx: localX, wy: localY };
	}

	$effect(() => {
		document.body.style.userSelect = (dragging || resizeEdge) ? 'none' : ''
	})

	function onMouseMove(e: MouseEvent) {
		if (dragging) {
			localX = dragStart.wx + (e.clientX - dragStart.x);
			localY = dragStart.wy + (e.clientY - dragStart.y);
		}
		if (resizeEdge) {
			const dx = e.clientX - resizeStart.x;
			const dy = e.clientY - resizeStart.y;
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

	function onMouseUp() {
		if (dragging) onMove(localX, localY);
		if (resizeEdge) onResize(localW, localH);
		dragging = false;
		resizeEdge = null;
		isDragging.set(false);
	}
</script>

<svelte:window onmousemove={onMouseMove} onmouseup={onMouseUp} />

<div
	class="absolute rounded-md border text-xs shadow-sm"
	class:border-neutral-600={win.focused}
	class:border-neutral-800={!win.focused}
	style="left:{localX}px; top:{localY}px; width:{localW}px; height:{localH}px; z-index:{win.zIndex}; background: rgba(20,20,20,0.75); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);"
	onmousedown={onFocus}
	role="none"
>
	<!-- inner clip for rounded corners without breaking backdrop-filter -->
	<div class="flex h-full flex-col overflow-hidden rounded-md">
		<!-- Title bar -->
		<div
			class="no-drag-wrapper noselect flex w-full shrink-0 cursor-default items-center justify-between border-b border-neutral-800 bg-neutral-950/80 p-2 text-neutral-500 select-none"
			style="backdrop-filter: blur(2px); -webkit-backdrop-filter: blur(2px);"
			onmousedown={startDrag}
			role="none"
		>
			<div class="no-drag flex gap-2">
				<button class="text-neutral-500 hover:text-red-400" aria-label="Close" onclick={onClose}>[x]</button>
				<button class="text-neutral-500 hover:text-yellow-400" aria-label="Minimize" onclick={onMinimize}>[-]</button>
				<button class="text-neutral-500 hover:text-green-400" aria-label="Fullscreen" onclick={toggleFullscreen}>{fullscreen ? '[↙]' : '[↗]'}</button>
			</div>
			<span class="absolute left-1/2 -translate-x-1/2 font-mono text-xs text-neutral-500">{win.title}</span>
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

	<!-- Resize handles (outside overflow-hidden) -->
	<div class="absolute top-0 left-0 h-2 w-2 cursor-nw-resize" onmousedown={(e) => startResize(e, 'nw')} role="none"></div>
	<div class="absolute top-0 right-0 h-2 w-2 cursor-ne-resize" onmousedown={(e) => startResize(e, 'ne')} role="none"></div>
	<div class="absolute bottom-0 left-0 h-2 w-2 cursor-sw-resize" onmousedown={(e) => startResize(e, 'sw')} role="none"></div>
	<div class="absolute bottom-0 right-0 h-2 w-2 cursor-se-resize" onmousedown={(e) => startResize(e, 'se')} role="none"></div>
	<div class="absolute top-0 left-2 right-2 h-1 cursor-n-resize" onmousedown={(e) => startResize(e, 'n')} role="none"></div>
	<div class="absolute bottom-0 left-2 right-2 h-1 cursor-s-resize" onmousedown={(e) => startResize(e, 's')} role="none"></div>
	<div class="absolute top-2 bottom-2 left-0 w-1 cursor-w-resize" onmousedown={(e) => startResize(e, 'w')} role="none"></div>
	<div class="absolute top-2 bottom-2 right-0 w-1 cursor-e-resize" onmousedown={(e) => startResize(e, 'e')} role="none"></div>
</div>
