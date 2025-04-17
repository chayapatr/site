<!-- Grid.svelte -->
<script>
	import { onMount, onDestroy } from 'svelte';
	import { Frame } from '$lib/store.ts';

	// Canvas reference for DOM manipulation
	let canvas;
	let containerRef;

	// Grid properties
	const baseGridSpacing = 40;
	const dotRadius = 1.1;

	// Scale thresholds for dot density adjustment
	const scaleThresholds = {
		low: 0.6, // Below this, show very sparse dots
		medium: 0.85, // Below this, show fewer dots
		high: 1.0 // Normal density
	};

	// Used to keep track of animation
	let animationFrameId = null;
	let resizeObserver = null;

	// Draw the grid based on current position and scale
	function drawGrid() {
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		const rect = canvas.getBoundingClientRect();
		const width = rect.width;
		const height = rect.height;

		// Clear canvas - use display dimensions
		ctx.clearRect(0, 0, width, height);

		// Set dot style based on the theme from Frame store
		ctx.fillStyle = $Frame.dark ? '#333333' : '#cccccc';

		// Get current position and scale from the store
		const currentPos = $Frame;
		const scale = currentPos.scale;

		// Determine which dots to show based on scale
		let skipFactor = 1; // Default: show every dot
		if (scale < scaleThresholds.low) {
			skipFactor = 4; // Show every 4th dot when scale is very small
		} else if (scale < scaleThresholds.medium) {
			skipFactor = 2; // Show every 2nd dot when scale is medium
		}

		// Adjust grid spacing based on scale
		const scaledSpacing = baseGridSpacing * scale * skipFactor;

		// Calculate center offset for transform-origin
		const centerOffsetX = (width / 2) * (1 - scale);
		const centerOffsetY = (height / 2) * (1 - scale);

		const adjustedX = currentPos.x + centerOffsetX;
		const adjustedY = currentPos.y + centerOffsetY;

		// Calculate starting positions for the grid
		// We use modulo to create the repeating pattern
		const startX = ((adjustedX % scaledSpacing) + scaledSpacing) % scaledSpacing;
		const startY = ((adjustedY % scaledSpacing) + scaledSpacing) % scaledSpacing;

		// Maintain consistent dot size regardless of scale
		// But with a slight adjustment for very low scales for better visibility
		const sizeFactor =
			scale < scaleThresholds.low ? 1.2 : scale < scaleThresholds.medium ? 1.1 : 1.0;
		const displayDotRadius = dotRadius * sizeFactor;

		// Draw dots
		for (let x = startX; x < width; x += scaledSpacing) {
			for (let y = startY; y < height; y += scaledSpacing) {
				// Draw precise dots with crisp edges
				ctx.beginPath();
				ctx.arc(Math.round(x), Math.round(y), displayDotRadius, 0, 2 * Math.PI);
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
