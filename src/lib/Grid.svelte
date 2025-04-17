<!-- Grid.svelte -->
<script>
	import { onMount, onDestroy } from 'svelte';
	import { Frame } from '$lib/store.ts';

	// DOM references and animation tracking
	let canvas, containerRef;
	let animationFrameId = null;
	let resizeObserver = null;
	let lastRender = { x: 0, y: 0, scale: 0, width: 0, height: 0, dark: false };

	// Grid properties
	const baseSpacing = 40;
	const dotRadius = 1.1;

	// Draw grid with specified configuration
	function drawGrid() {
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		const rect = canvas.getBoundingClientRect();
		const { width, height } = rect;
		if (width === 0 || height === 0) return;

		// Current state
		const { x, y, scale, dark } = $Frame;

		// Skip if no significant changes
		if (
			Math.abs(lastRender.x - x) <= 5 &&
			Math.abs(lastRender.y - y) <= 5 &&
			Math.abs(lastRender.scale - scale) <= 0.01 &&
			lastRender.width === width &&
			lastRender.height === height &&
			lastRender.dark === dark
		) {
			return;
		}

		// Update last render state
		Object.assign(lastRender, { x, y, scale, width, height, dark });

		// Clear canvas
		ctx.clearRect(0, 0, width, height);

		// Prepare grid config based on scale
		let config = {};
		if (scale < 0.6) {
			// Very zoomed out
			config = {
				primary: { spacing: baseSpacing * scale * 4, opacity: 0.8, size: dotRadius * 1.2 },
				secondary: {
					spacing: baseSpacing * scale,
					opacity: 0.3,
					size: dotRadius * 0.9,
					show: true
				}
			};
		} else if (scale < 0.85) {
			// Zoomed out
			config = {
				primary: { spacing: baseSpacing * scale * 2, opacity: 0.9, size: dotRadius * 1.1 },
				secondary: { spacing: baseSpacing * scale, opacity: 0.5, size: dotRadius * 0.9, show: true }
			};
		} else if (scale < 1.5) {
			// Slightly zoomed in
			config = {
				primary: { spacing: baseSpacing * scale, opacity: 0.9, size: dotRadius },
				secondary: {
					spacing: baseSpacing * scale * 0.5,
					opacity: 0.2,
					size: dotRadius,
					show: true
				}
			};
		} else if (scale < 2.0) {
			// Zoomed in
			config = {
				primary: { spacing: baseSpacing * scale, opacity: 1.0, size: dotRadius },
				secondary: {
					spacing: baseSpacing * scale * 0.5,
					opacity: 0.5,
					size: dotRadius * 1.2,
					show: true
				}
			};
		} else {
			// Very zoomed in
			config = {
				primary: { spacing: baseSpacing * scale, opacity: 1.0, size: dotRadius },
				secondary: {
					spacing: baseSpacing * scale * 0.5,
					opacity: 0.6,
					size: dotRadius * 1.2,
					show: true
				},
				fine: {
					spacing: baseSpacing * scale * 0.25,
					opacity: 0.35,
					size: dotRadius * 0.8,
					show: true
				}
			};
		}

		// Set base color
		const baseColor = dark ? '61, 61, 61' : '194, 194, 194';

		// Draw primary dots positions (for skipping)
		const primaryX = [];
		const startPrimaryX =
			((x % config.primary.spacing) + config.primary.spacing) % config.primary.spacing;
		for (let dotX = startPrimaryX; dotX < width; dotX += config.primary.spacing) {
			primaryX.push(dotX);
		}

		// Draw the grid levels from fine to primary (back to front)

		// Fine grid (smallest dots)
		if (config.fine?.show) {
			ctx.fillStyle = `rgba(${baseColor}, ${config.fine.opacity})`;
			const startX = ((x % config.fine.spacing) + config.fine.spacing) % config.fine.spacing;
			const startY = ((y % config.fine.spacing) + config.fine.spacing) % config.fine.spacing;

			for (let dotX = startX; dotX < width; dotX += config.fine.spacing) {
				// Skip if this is a secondary dot position
				if (config.secondary?.show && dotX % config.secondary.spacing < 1) continue;
				// Skip if this is a primary dot position
				if (primaryX.some((px) => Math.abs(dotX - px) < 1)) continue;

				for (let dotY = startY; dotY < height; dotY += config.fine.spacing) {
					if (config.secondary?.show && dotY % config.secondary.spacing < 1) continue;
					ctx.beginPath();
					ctx.arc(Math.round(dotX), Math.round(dotY), config.fine.size, 0, 2 * Math.PI);
					ctx.fill();
				}
			}
		}

		// Secondary grid (medium dots)
		if (config.secondary?.show) {
			ctx.fillStyle = `rgba(${baseColor}, ${config.secondary.opacity})`;
			const startX =
				((x % config.secondary.spacing) + config.secondary.spacing) % config.secondary.spacing;
			const startY =
				((y % config.secondary.spacing) + config.secondary.spacing) % config.secondary.spacing;

			for (let dotX = startX; dotX < width; dotX += config.secondary.spacing) {
				// Skip if this is a primary dot position
				if (primaryX.some((px) => Math.abs(dotX - px) < 1)) continue;

				for (let dotY = startY; dotY < height; dotY += config.secondary.spacing) {
					ctx.beginPath();
					ctx.arc(Math.round(dotX), Math.round(dotY), config.secondary.size, 0, 2 * Math.PI);
					ctx.fill();
				}
			}
		}

		// Primary grid (largest dots)
		ctx.fillStyle = `rgba(${baseColor}, ${config.primary.opacity})`;
		const startY = ((y % config.primary.spacing) + config.primary.spacing) % config.primary.spacing;

		for (let dotX of primaryX) {
			for (let dotY = startY; dotY < height; dotY += config.primary.spacing) {
				ctx.beginPath();
				ctx.arc(Math.round(dotX), Math.round(dotY), config.primary.size, 0, 2 * Math.PI);
				ctx.fill();
			}
		}
	}

	// Set up high-DPI canvas
	function setupCanvas() {
		if (!canvas) return;

		const dpr = window.devicePixelRatio || 1;
		const rect = canvas.getBoundingClientRect();

		if (rect.width === 0 || rect.height === 0) {
			setTimeout(setupCanvas, 100);
			return;
		}

		// Set display size (css pixels)
		canvas.style.width = `${rect.width}px`;
		canvas.style.height = `${rect.height}px`;

		// Set actual size in memory (scaled for DPR)
		canvas.width = Math.floor(rect.width * dpr);
		canvas.height = Math.floor(rect.height * dpr);

		// Scale context to match DPR
		const ctx = canvas.getContext('2d');
		ctx.scale(dpr, dpr);

		// Force redraw
		lastRender.dark = !$Frame.dark;
		drawGrid();
	}

	// Animation loop
	function animate() {
		drawGrid();
		animationFrameId = requestAnimationFrame(animate);
	}

	onMount(() => {
		if (typeof window !== 'undefined') {
			// Set up resize observer
			resizeObserver = new ResizeObserver(() => {
				lastRender.width = 0; // Force redraw
				setupCanvas();
			});

			if (containerRef) resizeObserver.observe(containerRef);

			// Initial setup
			setTimeout(() => {
				setupCanvas();
				animate();
			}, 100);
		}
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
			if (resizeObserver !== null) resizeObserver.disconnect();
		}
	});
</script>

<div bind:this={containerRef} class="grid-container">
	<canvas bind:this={canvas} class="dot-grid"></canvas>
</div>

<style>
	.grid-container {
		width: 100%;
		height: 100%;
		pointer-events: none;
	}
	.dot-grid {
		width: 100%;
		height: 100%;
	}
</style>
