<script lang="ts">
	import { onMount } from 'svelte';

	import { generateBlock } from '$lib';
	import { Frame, Blocks, ActiveBlocks, Log, Path } from '$lib/store';
	import Block from '$lib/Block.svelte';
	import Head from '$lib/head.svelte';
	import { pinch } from 'svelte-gestures';
	import { page } from '$app/stores';

	import AddWindow from '$lib/AddWindow.svelte';
	import Grid from '$lib/Grid.svelte';
	import MiniMap from '$lib/MiniMap.svelte'; // Import the MiniMap component

	let move = $state((_: MouseEvent) => {});
	let touchMove = (_: TouchEvent) => {};

	let prevScale = $state(1);
	let changeX: number = $state(0),
		changeY: number = $state(0);
	let previousTouch: Touch | undefined = $state();

	// Mouse position tracking for zoom
	let mouseX = $state(0);
	let mouseY = $state(0);
	let zoomContainer: HTMLDivElement;

	let getInitialBlock = $state(() => {});
	let load = $state(false);
	let menu = $state('');

	// MiniMap settings
	let showMiniMap = $state(true); // Toggle for showing/hiding the minimap
	let minimapPosition = $state<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>(
		'bottom-right'
	);

	const url = $page.url;

	// Function to apply zoom based on mouse position
	function applyZoom(newScale: number, clientX: number, clientY: number) {
		const oldScale = $Frame.scale;

		// Ensure scale is within bounds
		const min = 0.5;
		const max = 1; // Increased max zoom
		newScale = newScale > min ? (newScale < max ? newScale : max) : min;

		if (newScale === oldScale) return;

		// Get position relative to the viewport
		const rect = zoomContainer.getBoundingClientRect();
		const offsetX = clientX - rect.left;
		const offsetY = clientY - rect.top;

		// Calculate the world coordinates before zoom
		const worldX = (offsetX - $Frame.x) / oldScale;
		const worldY = (offsetY - $Frame.y) / oldScale;

		// Calculate new position that keeps the point under cursor fixed
		$Frame.x = offsetX - worldX * newScale;
		$Frame.y = offsetY - worldY * newScale;
		$Frame.scale = newScale;
	}

	onMount(async () => {
		let slug = url.searchParams.get('page') || '!@$';

		$Frame.height = window.innerHeight;
		$Frame.width = window.innerWidth;

		Object.assign(window, {
			getBlock: async (slug: string, parentIndex: number) => {
				const newIndex = $Frame.currentIndex + 1;
				$Frame.currentIndex = newIndex;
				$Blocks = [
					...$Blocks,
					await generateBlock(
						slug,
						'page',
						parentIndex,
						$Blocks.find((x) => x.id === parentIndex),
						newIndex || 0
					)
				];
				if (!$Path.nodes.find((x) => x.id === `${slug}`))
					$Path.nodes = [...$Path.nodes, { id: `${slug}` }];
				if (parentIndex !== -1) {
					$Path.links = [
						...$Path.links,
						{
							source: $Blocks.filter((x) => x.id === parentIndex)[0].title.split('.')[0],
							target: `${slug}`
						}
					];
				}
				$Log = [...$Log, `${new Date().toLocaleTimeString()}~${slug}.md`];
				return newIndex;
			},
			jump: (x: string, y: string, width: string, height: string, id: string) => {
				$Frame = {
					...$Frame,
					x: -Number(x) + $Frame.width / 2 - Number(width) / 2,
					y: -Number(y) + $Frame.height / 2 - Number(height) / 2,
					scale: 1
				};
				requestAnimationFrame(() => {
					$Frame.cur = $Blocks.findIndex((x) => x.id === Number(id)); // Number();
				});
			}
		});

		move = (e: MouseEvent) => {
			// Track mouse position
			mouseX = e.clientX;
			mouseY = e.clientY;

			if ($Frame.cur === -1 && $Frame.drag && !$Frame.resize) {
				$Frame.x += 0.75 * e.movementX;
				$Frame.y += 0.75 * e.movementY;
			}
		};

		touchMove = (e: TouchEvent) => {
			const touch = e.touches[0];
			if (previousTouch) {
				if ($Frame.cur === -1 && $Frame.drag && !$Frame.resize) {
					changeX = touch.pageX - previousTouch.pageX;
					changeY = touch.pageY - previousTouch.pageY;
					$Frame.x += 0.75 * (changeX as number);
					$Frame.y += 0.75 * (changeY as number);
				}
			}
			previousTouch = touch;
		};

		getInitialBlock = async () => {
			setTimeout(async () => {
				let id = await window.getBlock('!@$', -1);
				if (slug !== '!@$') id = await window.getBlock(slug, id);
				requestAnimationFrame(() => {
					$Frame.cur = $Blocks.findIndex((x) => x.id === id);
				});
				load = false;
			}, 300);
		};

		// if (localStorage.getItem('blocks')) $Blocks = JSON.parse(localStorage.getItem('blocks') || '');
		// if (localStorage.getItem('frame')) $Frame = JSON.parse(localStorage.getItem('frame') || '');
	});

	$effect(() => {
		if ($Blocks.length === 0) {
			getInitialBlock();
			load = true;
		}
	});

	// Handle mouse wheel zoom
	function handleWheel(e: WheelEvent) {
		if ($Frame.cur === -1) {
			// Calculate new scale
			const delta = e.deltaY * -0.001; // Adjust sensitivity here
			const newScale = $Frame.scale * (1 + delta);

			// Apply zoom centered on mouse position
			applyZoom(newScale, e.clientX, e.clientY);
		}
	}

	// Toggle MiniMap visibility
	function toggleMiniMap() {
		showMiniMap = !showMiniMap;
	}

	// Change MiniMap position
	function cycleMiniMapPosition() {
		const positions: Array<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'> = [
			'top-left',
			'top-right',
			'bottom-right',
			'bottom-left'
		];
		const currentIndex = positions.indexOf(minimapPosition);
		minimapPosition = positions[(currentIndex + 1) % positions.length];
	}
</script>

<Head />

<svelte:window
	onmousemove={move}
	onmouseup={() => {
		$Frame.drag = false;
		$Frame.cur = -1;
	}}
	ontouchend={() => {
		$Frame.drag = false;
		previousTouch = undefined;
	}}
	ontouchmove={(e) => {
		if (!$Frame) return;
		const touch = e.touches[0];
		if (previousTouch) {
			if ($Frame.cur === -1 && $Frame.drag && !$Frame.resize) {
				changeX = touch.pageX - previousTouch.pageX;
				changeY = touch.pageY - previousTouch.pageY;
				$Frame.x += 0.75 * (changeX as number);
				$Frame.y += 0.75 * (changeY as number);
			}
		}
		previousTouch = touch;
	}}
	onresize={() => {
		$Frame.height = window.innerHeight;
		$Frame.width = window.innerWidth;
	}}
/>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class={`noselect fixed bottom-0 left-0 z-50 flex w-screen flex-col items-center justify-center gap-2 p-3 ${$Frame.dark ? 'dark' : ''}`}
>
	<div class="flex min-w-72 flex-col items-end gap-1 lg:gap-2">
		{#if menu}
			<div
				class={`flex w-min items-center justify-between gap-2 rounded-full border p-1 text-base text-neutral-600 shadow-sm md:text-sm lg:text-base dark:border-neutral-800 dark:text-white
				${$Frame.dark ? 'glass-dark' : 'glass'}
			`}
			>
				{#if menu === 'discovery'}
					{#each [{ title: 'Add Graph', type: 'graph', header: 'Garden', icon: '🧭' }, { title: 'Add Log', type: 'log', header: 'Log', icon: '📖' }, { title: 'Add Current', type: 'current', header: 'Current', icon: '👀' }] as btn, i}
						<AddWindow {btn} />
					{/each}
				{/if}
			</div>
		{/if}
		<div
			class={`flex w-full items-center justify-between gap-8 rounded-full border p-1 text-base text-neutral-600 shadow-sm md:text-sm md:shadow-md lg:text-base dark:border-neutral-800 dark:text-white
			${$Frame.dark ? 'glass-dark' : 'glass'}
		`}
		>
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="flex items-center gap-1">
				<button
					title="Appearance"
					class="dot"
					onclick={() => {
						$Frame.dark = !$Frame.dark;
					}}>{$Frame.dark ? '☀️' : '🌙'}</button
				>
				<!-- <div>{$Frame.scale.toFixed(2)}</div> -->
				<button
					class="group rounded-sm px-1 py-[0.15rem] text-sm text-neutral-500 hover:bg-neutral-200/80 md:text-[13px] dark:text-neutral-400 dark:hover:bg-neutral-800/50"
					title="Reset Position"
					onclick={() => {
						$Frame.x = 0;
						$Frame.y = 0;
						$Frame.scale = 1;
					}}
				>
					<div class="hidden group-hover:block">Reset Position</div>
					<div class="group-hover:hidden">
						[{-$Frame.x.toFixed(0)}, {-$Frame.y.toFixed(0)}, {$Frame.scale.toFixed(1)}]
					</div>
				</button>
			</div>
			<div class="flex gap-2">
				<button
					title="Add Root Node"
					class="dot"
					onclick={async () => {
						const id = await window.getBlock('!@$', -1);
						requestAnimationFrame(() => {
							$Frame.cur = $Blocks.findIndex((x) => x.id === id);
						});
					}}>🌱</button
				>
				<button
					title="Open Discovery Menu"
					class="dot"
					onclick={() => {
						if (menu === 'discovery') menu = '';
						else menu = 'discovery';
					}}>🔎</button
				>
				<!-- <button title="Toggle MiniMap" class="dot" onclick={toggleMiniMap}>🗺️</button>
				<button title="Change MiniMap Position" class="dot" onclick={cycleMiniMapPosition}
					>📍</button
				> -->
				<AddWindow
					btn={{
						title: 'Open Setting',
						type: 'setting',
						icon: '⚙️'
					}}
				/>
			</div>
		</div>
	</div>
</div>

<!-- Modified to use mouse position for zooming -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	bind:this={zoomContainer}
	class={`h-[100svh] w-screen ${$Frame.drag ? 'mousedown' : ''}  ${$Frame.dark ? 'dark' : ''}`}
	onmousedown={(e) => {
		if ($Frame.cur === -1) $Frame.drag = true;
		// Update mouse position on mousedown
		mouseX = e.clientX;
		mouseY = e.clientY;
	}}
	ontouchstart={() => {
		if ($Frame.cur === -1) $Frame.drag = true;
	}}
	onwheel={handleWheel}
	use:pinch
	onpinch={(e) => {
		$Frame.cur = -1;

		// Calculate new scale
		let newScale = prevScale * e.detail.scale;

		// Get the touch center point
		const touch = e.detail.center;

		// Apply zoom centered on touch position
		applyZoom(newScale, touch.x, touch.y);
	}}
	onpinchup={(e) => {
		prevScale = $Frame.scale;
	}}
>
	<div
		class={`h-full w-full overflow-hidden ${
			$Frame.cur === -1
				? 'bg-neutral-100 dark:bg-neutral-800/80 md:dark:bg-neutral-900'
				: 'bg-neutral-200/95 md:bg-neutral-200 dark:bg-neutral-900/70'
		} `}
	>
		<div
			class="relative z-10 min-h-full min-w-full"
			style={`
            transform: matrix(${$Frame.scale}, 0, 0, ${$Frame.scale}, ${$Frame.x}, ${$Frame.y});
			transform-origin: 0 0;
        `}
		>
			{#each $ActiveBlocks as block, i}
				<Block {block} {i} />
			{/each}
		</div>
	</div>

	<div class="fixed left-0 top-0 z-0 h-[100svh] w-full">
		<Grid />
	</div>
</div>

{#if $ActiveBlocks.length === 0}
	<div class="absolute left-0 top-0 flex h-[100svh] w-full items-center justify-center text-lg">
		<img src="/imgs/pub.svg" alt="" class="h-12 w-full animate-pulse" />
	</div>
{/if}

<!-- Display MiniMap when showMiniMap is true -->
{#if showMiniMap}
	<div class="fixed bottom-0 right-0 z-[999999] m-3 hidden md:block">
		<MiniMap position={minimapPosition} width={180} height={120} />
	</div>
{/if}

<style>
	.mousedown {
		cursor: grab;
	}
</style>
