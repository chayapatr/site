<script lang="ts">
	import { Blocks, Frame, ActiveBlocks } from '$lib/store';
	import { onMount } from 'svelte';

	// Props
	export let position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' = 'bottom-right';
	export let width: number = 200;
	export let height: number = 150;
	export let padding: number = 40; // Padding around the content bounds

	// State
	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let isDragging = false;
	let minimapBounds = { x: 0, y: 0, width: 0, height: 0 };

	// Device pixel ratio for sharp rendering
	let pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

	// Colors
	$: blockColor = $Frame.dark ? '#262626' : '#efefef'; // Blue
	$: activeBlockColor = $Frame.dark ? '#FBBF24' : '#2563EB'; // Red
	$: viewportColor = $Frame.dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
	$: backgroundColor = $Frame.dark ? '#171717' : '#f5f5f5';

	// Function to calculate minimap scaling and boundaries
	function calculateMinimapBounds() {
		if (!$Blocks.length) return;

		// Find the bounds of all blocks
		let minX = Infinity,
			minY = Infinity;
		let maxX = -Infinity,
			maxY = -Infinity;

		$Blocks.forEach((block) => {
			const x = parseFloat(block.x);
			const y = parseFloat(block.y);
			const blockWidth = parseFloat(block.width);
			const blockHeight = parseFloat(block.height);

			minX = Math.min(minX, x);
			minY = Math.min(minY, y);
			maxX = Math.max(maxX, x + blockWidth);
			maxY = Math.max(maxY, y + blockHeight);
		});

		// Add padding
		minX -= padding;
		minY -= padding;
		maxX += padding;
		maxY += padding;

		// Calculate the content dimensions
		const contentWidth = maxX - minX;
		const contentHeight = maxY - minY;

		// Calculate the scale to fit everything in the minimap while maintaining aspect ratio
		const xScale = width / contentWidth;
		const yScale = height / contentHeight;
		const mapScale = Math.min(xScale, yScale);

		minimapBounds = {
			x: minX,
			y: minY,
			width: contentWidth,
			height: contentHeight
		};

		return mapScale;
	}

	// Function to draw blocks on the minimap
	function drawMinimap() {
		if (!ctx || !canvas) return;

		// Clear canvas with non-blurry rectangle
		ctx.save();
		ctx.fillStyle = backgroundColor;
		ctx.fillRect(0, 0, width, height);

		const mapScale = calculateMinimapBounds();
		if (!mapScale || minimapBounds.width === 0) return;

		// Calculate centering offsets to ensure the content is centered in the minimap
		// when the aspect ratio doesn't match
		const scaledContentWidth = minimapBounds.width * mapScale;
		const scaledContentHeight = minimapBounds.height * mapScale;
		const offsetX = Math.floor((width - scaledContentWidth) / 2);
		const offsetY = Math.floor((height - scaledContentHeight) / 2);

		// Create a sorted copy of blocks based on z-index (or fallback to index if no z property)
		const sortedBlocks = [...$Blocks].sort((a, b) => {
			// Use z property for ordering if it exists
			const aZ = a.z !== undefined ? parseFloat(a.z) : 0;
			const bZ = b.z !== undefined ? parseFloat(b.z) : 0;
			return aZ - bZ; // Lower z-index drawn first (bottom layer)
		});

		// Draw all blocks with crisp edges in z-index order
		sortedBlocks.forEach((block) => {
			const x = Math.round(offsetX + (parseFloat(block.x) - minimapBounds.x) * mapScale);
			const y = Math.round(offsetY + (parseFloat(block.y) - minimapBounds.y) * mapScale);
			const blockWidth = Math.max(2, Math.round(parseFloat(block.width) * mapScale));
			const blockHeight = Math.max(2, Math.round(parseFloat(block.height) * mapScale));

			// Determine if this block is the active one
			const isActive = $Frame.cur !== -1 && $Blocks[$Frame.cur]?.id === block.id;

			// Draw with crisp edges
			ctx.fillStyle = isActive ? activeBlockColor : blockColor;
			ctx.fillRect(x, y, blockWidth, blockHeight);

			// Draw block outline for better visibility
			ctx.strokeStyle = $Frame.dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';
			ctx.lineWidth = 0.5;
			ctx.strokeRect(x, y, blockWidth, blockHeight);
		});

		// Draw viewport rectangle with crisp edges
		const viewportX = Math.round(offsetX + (-$Frame.x / $Frame.scale - minimapBounds.x) * mapScale);
		const viewportY = Math.round(offsetY + (-$Frame.y / $Frame.scale - minimapBounds.y) * mapScale);
		const viewportWidth = Math.round(($Frame.width / $Frame.scale) * mapScale);
		const viewportHeight = Math.round(($Frame.height / $Frame.scale) * mapScale);

		// Draw viewport with dashed outline for better visibility
		ctx.fillStyle = viewportColor;
		ctx.fillRect(viewportX, viewportY, viewportWidth, viewportHeight);
		ctx.strokeStyle = $Frame.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
		ctx.lineWidth = 1.5;
		ctx.setLineDash([3, 3]);
		ctx.strokeRect(viewportX, viewportY, viewportWidth, viewportHeight);
		ctx.setLineDash([]);

		ctx.restore();
	}

	// Handle click/drag on minimap to navigate
	function handleMinimapInteraction(event: MouseEvent, isDown: boolean = false) {
		if (isDown) {
			isDragging = true;
		}

		if (!isDragging && !isDown) return;

		if (!isDown && event.type === 'mouseup') {
			isDragging = false;
			return;
		}

		const rect = canvas.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		const mapScale = calculateMinimapBounds();
		if (!mapScale) return;

		// Calculate centering offsets
		const scaledContentWidth = minimapBounds.width * mapScale;
		const scaledContentHeight = minimapBounds.height * mapScale;
		const offsetX = (width - scaledContentWidth) / 2;
		const offsetY = (height - scaledContentHeight) / 2;

		// Calculate the target position in world coordinates, accounting for the centering offset
		const worldX = minimapBounds.x + (x - offsetX) / mapScale;
		const worldY = minimapBounds.y + (y - offsetY) / mapScale;

		// Center the viewport on the clicked position
		const centerX = $Frame.width / (2 * $Frame.scale);
		const centerY = $Frame.height / (2 * $Frame.scale);

		$Frame.x = -worldX * $Frame.scale + centerX * $Frame.scale;
		$Frame.y = -worldY * $Frame.scale + centerY * $Frame.scale;
	}

	// Initialize and setup listeners
	onMount(() => {
		ctx = canvas.getContext('2d', { alpha: false, desynchronized: true })!;

		// Adjust for device pixel ratio for sharp rendering
		const displayWidth = width;
		const displayHeight = height;

		// Set canvas dimensions accounting for pixel ratio
		canvas.width = displayWidth * pixelRatio;
		canvas.height = displayHeight * pixelRatio;

		// Scale context for high-DPI display
		ctx.scale(pixelRatio, pixelRatio);

		// Set canvas CSS dimensions
		canvas.style.width = `${displayWidth}px`;
		canvas.style.height = `${displayHeight}px`;

		// Apply crisp rendering settings
		ctx.imageSmoothingEnabled = false;

		// Initial draw
		drawMinimap();

		// Setup resize observer
		const resizeObserver = new ResizeObserver(() => {
			drawMinimap();
		});
		resizeObserver.observe(canvas);

		return () => {
			resizeObserver.disconnect();
		};
	});

	// Update minimap when relevant store values change
	$: if (canvas && ctx && ($Blocks || $Frame || $ActiveBlocks)) {
		drawMinimap();
	}

	// Auto-fit scale calculation whenever blocks change
	$: if ($Blocks && $Blocks.length) {
		calculateMinimapBounds();
	}
</script>

<!-- svelte-ignore a11y_no-static-element-interactions -->
<div
	class={`select-none overflow-hidden rounded-md border ${$Frame.dark ? 'border-neutral-800' : 'border-neutral-200'}`}
>
	<canvas
		bind:this={canvas}
		{width}
		{height}
		class="cursor-pointer rounded-md shadow-md"
		style={`width: ${width}px; height: ${height}px; background-color: ${backgroundColor};`}
		on:mousedown={(e) => handleMinimapInteraction(e, true)}
		on:mousemove={handleMinimapInteraction}
		on:mouseup={(e) => (isDragging = false)}
		on:mouseleave={(e) => (isDragging = false)}
	></canvas>
</div>
