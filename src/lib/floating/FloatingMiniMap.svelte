<script lang="ts">
	import { onMount } from 'svelte';
	import { floatingPanels, focusState, focusPanel } from './store.svelte';

	const WIDTH = 160;
	const HEIGHT = 110;

	let canvas = $state<HTMLCanvasElement | null>(null);
	let ctx: CanvasRenderingContext2D | null = null;
	let pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

	// our floating panels live in plain viewport coordinates (no pan/zoom
	// canvas like the v10 reference had), so the minimap world is just the
	// current window size — no bounds calculation or scale-to-fit needed
	function draw() {
		if (!ctx || !canvas || typeof window === 'undefined') return;
		const scaleX = WIDTH / window.innerWidth;
		const scaleY = HEIGHT / window.innerHeight;

		ctx.clearRect(0, 0, WIDTH, HEIGHT);
		ctx.fillStyle = '#171717';
		ctx.fillRect(0, 0, WIDTH, HEIGHT);

		const sorted = [...floatingPanels].sort((a, b) => a.z - b.z);
		for (const panel of sorted) {
			const x = Math.round(panel.x * scaleX);
			const y = Math.round(panel.y * scaleY);
			const w = Math.max(2, Math.round(panel.width * scaleX));
			const h = Math.max(2, Math.round(panel.height * scaleY));
			const isFocused = focusState.id === panel.id;

			ctx.fillStyle = isFocused ? '#fbbf24' : '#404040';
			ctx.fillRect(x, y, w, h);
			ctx.strokeStyle = 'rgba(255,255,255,0.3)';
			ctx.lineWidth = 0.5;
			ctx.strokeRect(x, y, w, h);
		}
	}

	function handleClick(e: MouseEvent) {
		if (!canvas || typeof window === 'undefined') return;
		const rect = canvas.getBoundingClientRect();
		const clickX = (e.clientX - rect.left) * (window.innerWidth / WIDTH);
		const clickY = (e.clientY - rect.top) * (window.innerHeight / HEIGHT);

		// topmost (highest z) panel under the click point
		const hit = [...floatingPanels]
			.sort((a, b) => b.z - a.z)
			.find(
				(p) => clickX >= p.x && clickX <= p.x + p.width && clickY >= p.y && clickY <= p.y + p.height
			);
		if (hit) focusPanel(hit.id);
	}

	onMount(() => {
		ctx = canvas!.getContext('2d');
		canvas!.width = WIDTH * pixelRatio;
		canvas!.height = HEIGHT * pixelRatio;
		canvas!.style.width = `${WIDTH}px`;
		canvas!.style.height = `${HEIGHT}px`;
		ctx!.scale(pixelRatio, pixelRatio);
		draw();

		const onResize = () => draw();
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	});

	// redraw on every panel position/focus change — draw() itself reads
	// floatingPanels/focusState, so calling it here (inside $effect, not just
	// onMount) is enough for Svelte to track those as dependencies and
	// re-run whenever any panel's x/y/z or the focused id changes
	$effect(() => {
		draw();
	});
</script>

<div class="overflow-hidden rounded-md border border-neutral-800 shadow-md">
	<canvas
		bind:this={canvas}
		class="cursor-pointer"
		onclick={handleClick}
		role="presentation"
	></canvas>
</div>
