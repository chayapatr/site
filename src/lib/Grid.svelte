<!-- Grid.svelte -->
<script>
	import { onMount, onDestroy } from 'svelte';
	import { Frame } from '$lib/store.ts';

	// Canvas reference for DOM manipulation
	let canvas;
	let containerRef;

	// Grid properties
	const gridSpacing = 30;
	const dotRadius = 1;

	// Used to keep track of animation
	let animationFrameId = null;
	let resizeObserver = null;

	// Draw the grid based on current position
	function drawGrid() {
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		const rect = canvas.getBoundingClientRect();
		const width = rect.width;
		const height = rect.height;

		// Clear canvas - use display dimensions
		ctx.clearRect(0, 0, width, height);

		// Set dot style based on the theme from Frame store
		ctx.fillStyle = $Frame.dark ? '#333' : '#ccc';

		// Get current position from the store
		const currentPos = $Frame;

		// Calculate starting positions with offset
		const startX = currentPos.x % gridSpacing;
		const startY = currentPos.y % gridSpacing;

		// Draw dots
		for (let x = startX; x < width; x += gridSpacing) {
			for (let y = startY; y < height; y += gridSpacing) {
				// Draw precise dots with crisp edges
				ctx.beginPath();
				ctx.arc(Math.round(x), Math.round(y), dotRadius, 0, 2 * Math.PI);
				ctx.fill();
			}
		}
	}

	// Set up high-DPI canvas on mount
	function setupCanvas() {
		if (!canvas) return;

		const dpr = window.devicePixelRatio || 1;
		const rect = canvas.getBoundingClientRect();

		// Only update if dimensions are actually valid
		if (rect.width === 0 || rect.height === 0) {
			// Try again in a moment if canvas has no size yet
			setTimeout(setupCanvas, 100);
			return;
		}

		// Set display size (css pixels)
		canvas.style.width = `${rect.width}px`;
		canvas.style.height = `${rect.height}px`;

		// Set actual size in memory (scaled for device pixel ratio)
		canvas.width = Math.floor(rect.width * dpr);
		canvas.height = Math.floor(rect.height * dpr);

		// Scale context to match DPR
		const ctx = canvas.getContext('2d');
		ctx.scale(dpr, dpr);

		// Draw the grid after setup
		drawGrid();
	}

	// Animation loop to keep the grid updated with store changes
	function animate() {
		drawGrid();
		animationFrameId = requestAnimationFrame(animate);
	}

	onMount(() => {
		if (typeof window !== 'undefined') {
			// Use ResizeObserver for better resize handling
			resizeObserver = new ResizeObserver(() => {
				setupCanvas();
			});

			if (containerRef) {
				resizeObserver.observe(containerRef);
			}

			// Initial setup
			setTimeout(() => {
				setupCanvas();

				// Start animation loop
				animate();
			}, 100);
		}
	});

	onDestroy(() => {
		// Check if we're in a browser environment
		if (typeof window !== 'undefined') {
			// Only cancel animation if it exists
			if (animationFrameId !== null) {
				cancelAnimationFrame(animationFrameId);
			}

			// Disconnect resize observer if it exists
			if (resizeObserver !== null) {
				resizeObserver.disconnect();
			}
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
		pointer-events: none; /* Make non-interactive */
	}

	.dot-grid {
		width: 100%;
		height: 100%;
	}
</style>
