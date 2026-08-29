<script lang="ts">
	import { onMount } from 'svelte';
	import { floatingPanels, focusState, focusPanel, canvasState, panCanvasBy } from './store.svelte';

	const HEIGHT = 110;
	// width tracks the real viewport aspect ratio (height stays fixed) so the
	// minimap's shape actually resembles the window it's representing instead
	// of always being a fixed 160x110 box
	let WIDTH = $state(160);

	let canvas = $state<HTMLCanvasElement | null>(null);
	let ctx: CanvasRenderingContext2D | null = null;
	let pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

	function sizeCanvas() {
		if (!canvas || typeof window === 'undefined') return;
		WIDTH = Math.round(HEIGHT * (window.innerWidth / window.innerHeight));
		canvas.width = WIDTH * pixelRatio;
		canvas.height = HEIGHT * pixelRatio;
		canvas.style.width = `${WIDTH}px`;
		canvas.style.height = `${HEIGHT}px`;
		ctx!.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
	}

	// the "world" is now unbounded (panels can sit anywhere once the canvas
	// has been panned), so the minimap has to fit a bounding box around
	// every panel's world position *and* the current viewport window —
	// padded a bit so panels/the viewport edge aren't drawn flush against
	// the minimap's own edge. Shared by draw(), click-to-pan, and
	// drag-to-pan so the map-to-world conversion is always in sync.
	function mapTransform() {
		const vw = typeof window !== 'undefined' ? window.innerWidth : 0;
		const vh = typeof window !== 'undefined' ? window.innerHeight : 0;
		let minX = canvasState.x;
		let minY = canvasState.y;
		let maxX = canvasState.x + vw;
		let maxY = canvasState.y + vh;
		for (const p of floatingPanels) {
			minX = Math.min(minX, p.x);
			minY = Math.min(minY, p.y);
			maxX = Math.max(maxX, p.x + p.width);
			maxY = Math.max(maxY, p.y + p.height);
		}
		const pad = Math.max(vw, vh) * 0.15;
		minX -= pad;
		minY -= pad;
		maxX += pad;
		maxY += pad;
		const worldW = Math.max(1, maxX - minX);
		const worldH = Math.max(1, maxY - minY);
		// uniform scale (not stretched independently per axis) so panel/
		// viewport proportions stay accurate — fit whichever axis is tighter
		const scale = Math.min(WIDTH / worldW, HEIGHT / worldH);
		const offsetX = (WIDTH - worldW * scale) / 2;
		const offsetY = (HEIGHT - worldH * scale) / 2;
		return {
			vw,
			vh,
			scale,
			toMapX: (wx: number) => offsetX + (wx - minX) * scale,
			toMapY: (wy: number) => offsetY + (wy - minY) * scale,
			toWorldX: (mx: number) => minX + (mx - offsetX) / scale,
			toWorldY: (my: number) => minY + (my - offsetY) / scale,
		};
	}

	function draw() {
		if (!ctx || !canvas || typeof window === 'undefined') return;
		const t = mapTransform();

		ctx.clearRect(0, 0, WIDTH, HEIGHT);
		ctx.fillStyle = '#171717';
		ctx.fillRect(0, 0, WIDTH, HEIGHT);

		const sorted = [...floatingPanels].sort((a, b) => a.z - b.z);
		for (const panel of sorted) {
			const x = t.toMapX(panel.x);
			const y = t.toMapY(panel.y);
			const w = Math.max(2, panel.width * t.scale);
			const h = Math.max(2, panel.height * t.scale);
			const isFocused = focusState.id === panel.id;

			ctx.fillStyle = isFocused ? '#fbbf24' : '#404040';
			ctx.fillRect(x, y, w, h);
			ctx.strokeStyle = 'rgba(255,255,255,0.3)';
			ctx.lineWidth = 0.5;
			ctx.strokeRect(x, y, w, h);
		}

		// current viewport window, draggable to pan (see startViewportDrag) —
		// filled lightly so it reads as a distinct draggable handle, not just
		// an outline
		const vx = t.toMapX(canvasState.x);
		const vy = t.toMapY(canvasState.y);
		const vw = t.vw * t.scale;
		const vh = t.vh * t.scale;
		ctx.fillStyle = 'rgba(163, 163, 163, 0.25)';
		ctx.fillRect(vx, vy, vw, vh);
	}

	function viewportMapRect() {
		const t = mapTransform();
		return {
			x: t.toMapX(canvasState.x),
			y: t.toMapY(canvasState.y),
			w: t.vw * t.scale,
			h: t.vh * t.scale,
		};
	}

	let draggingViewport = $state(false);
	let lastPointer = { x: 0, y: 0 };

	function handlePointerDown(e: PointerEvent) {
		if (!canvas) return;
		const rect = canvas.getBoundingClientRect();
		const mapX = e.clientX - rect.left;
		const mapY = e.clientY - rect.top;
		const vp = viewportMapRect();
		if (mapX >= vp.x && mapX <= vp.x + vp.w && mapY >= vp.y && mapY <= vp.y + vp.h) {
			draggingViewport = true;
			lastPointer = { x: e.clientX, y: e.clientY };
			return;
		}

		// clicking outside the viewport box: focus a panel under the click,
		// or pan so that point becomes the new viewport center
		const t = mapTransform();
		const worldX = t.toWorldX(mapX);
		const worldY = t.toWorldY(mapY);
		const hit = [...floatingPanels]
			.sort((a, b) => b.z - a.z)
			.find(
				(p) =>
					worldX >= p.x && worldX <= p.x + p.width && worldY >= p.y && worldY <= p.y + p.height
			);
		if (hit) {
			focusPanel(hit.id);
			return;
		}
		panCanvasBy(worldX - t.vw / 2 - canvasState.x, worldY - t.vh / 2 - canvasState.y);
	}

	function handlePointerMove(e: PointerEvent) {
		if (!draggingViewport) return;
		const t = mapTransform();
		const dx = (e.clientX - lastPointer.x) / t.scale;
		const dy = (e.clientY - lastPointer.y) / t.scale;
		lastPointer = { x: e.clientX, y: e.clientY };
		panCanvasBy(dx, dy);
	}

	function handlePointerUp() {
		draggingViewport = false;
	}

	onMount(() => {
		ctx = canvas!.getContext('2d');
		sizeCanvas();
		draw();

		const onResize = () => {
			sizeCanvas();
			draw();
		};
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	});

	// redraw on every panel position/focus/pan change — draw() itself reads
	// floatingPanels/focusState/canvasState, so calling it here (inside
	// $effect, not just onMount) is enough for Svelte to track those as
	// dependencies and re-run whenever any of them change
	$effect(() => {
		draw();
	});
</script>

<svelte:window onpointermove={handlePointerMove} onpointerup={handlePointerUp} />

<div class="overflow-hidden rounded-md border border-neutral-800 shadow-md">
	<canvas
		bind:this={canvas}
		class={draggingViewport ? 'cursor-grabbing' : 'cursor-pointer'}
		onpointerdown={handlePointerDown}
		role="presentation"
	></canvas>
</div>
