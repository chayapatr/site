<script lang="ts">
	import { onMount } from 'svelte';

	import { generateBlock } from '$lib';
	import { Frame, Blocks, ActiveBlocks, Log, Path } from '$lib/store';
	import Block from '$lib/Block.svelte';
	import Head from '$lib/head.svelte';
	import { pinch } from 'svelte-gestures';
	import { page } from '$app/stores';

	let move = (_: MouseEvent) => {};
	let touchMove = (_: TouchEvent) => {};

	let prevScale = 1;
	let changeX, changeY;
	let previousTouch: Touch;

	let getInitialBlock = () => {};
	let load = false;

	const url = $page.url;

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
						$Blocks.filter((x) => x.id === parentIndex)[0],
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
			},
			jump: (x: string, y: string, width: string, height: string) => {
				$Frame = {
					...$Frame,
					x: -Number(x) + $Frame.width / 2 - Number(width) / 2,
					y: -Number(y) + $Frame.height / 2 - Number(height) / 2,
					scale: 1
				};
			}
		});

		window.addEventListener(
			'wheel',
			function (e) {
				if ($Frame.cur === -1) {
					e.preventDefault();
					let d = $Frame.scale - 0.0015 * e.deltaY;
					const min = 0.5;
					const max = 1.5;
					$Frame.scale = d > min ? (d < max ? d : max) : min;

					// const { clientX, clientY } = e;
					// change origin
					// $Frame.originX = clientX - $Frame.x * $Frame.scale;
					// $Frame.originY = clientY - $Frame.y * $Frame.scale;
				}
			},
			{ passive: false }
		);

		move = (e: MouseEvent) => {
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
					$Frame.x += 0.75 * changeX;
					$Frame.y += 0.75 * changeY;
				}
			}
			previousTouch = touch;
		};

		getInitialBlock = () => {
			window.getBlock(slug, -1);
		};

		// if (localStorage.getItem('blocks')) $Blocks = JSON.parse(localStorage.getItem('blocks') || '');
		// if (localStorage.getItem('frame')) $Frame = JSON.parse(localStorage.getItem('frame') || '');
	});

	$: if ($Blocks.length === 0) getInitialBlock();
	load = true;
</script>

<Head />

<svelte:window
	on:mousemove={move}
	on:mouseup={() => {
		$Frame.drag = false;
		$Frame.cur = -1;
	}}
	on:touchend={() => {
		$Frame.drag = false;
		previousTouch = undefined;
	}}
	on:touchmove={touchMove}
	class={`${$Frame.dark ? 'dark' : ''}`}
	on:resize={() => {
		$Frame.height = window.innerHeight;
		$Frame.width = window.innerWidth;
	}}
/>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class={`fixed bottom-0 left-0 z-50 m-3 flex w-screen justify-center ${$Frame.dark ? 'dark' : ''}`}
>
	<div
		class={`flex min-w-60 items-center justify-between gap-8 rounded-full border p-1 text-base text-neutral-600 shadow-sm md:min-w-72 md:text-sm md:shadow-md lg:text-base dark:border-neutral-800 dark:text-white
			${$Frame.dark ? 'glass-dark' : 'glass'}
		`}
	>
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div class="flex items-center gap-1">
			<button
				title="Appearance"
				class="dot"
				on:click={() => {
					$Frame.dark = !$Frame.dark;
				}}>{$Frame.dark ? '☀️' : '🌙'}</button
			>
			<!-- <div>{$Frame.scale.toFixed(2)}</div> -->
			<button
				class="rounded-sm px-1 py-[0.15rem] text-sm text-neutral-500 hover:bg-neutral-200/80 md:text-[13px] dark:text-neutral-400 dark:hover:bg-neutral-800/50"
				on:click={() => {
					$Frame.x = 0;
					$Frame.y = 0;
					$Frame.scale = 1;
				}}
			>
				[{-$Frame.x.toFixed(0)}, {-$Frame.y.toFixed(0)}]
			</button>
		</div>
		<div class="flex gap-2">
			<button
				title="Add Graph"
				class="dot"
				on:click={async () => {
					if (!$Blocks.find((x) => x.type === 'graph')) {
						$Frame.currentIndex += 1;
						$Blocks = [
							...$Blocks,
							await generateBlock('Garden', 'graph', -1, undefined, $Frame.currentIndex || 0)
						];
					} else {
						const { x, y, height, width } = $Blocks.find((x) => x.type === 'graph');
						$Frame = {
							...$Frame,
							x: -Number(x) + $Frame.width / 2 - width / 2,
							y: -Number(y) + $Frame.height / 2 - height / 2,
							scale: 1
						};
					}
				}}>🏕️</button
			>
			<button
				title="Add Log"
				class="dot"
				on:click={async () => {
					if (!$Blocks.find((x) => x.type === 'log')) {
						$Frame.currentIndex += 1;
						$Blocks = [
							...$Blocks,
							await generateBlock('Log', 'log', -1, undefined, $Frame.currentIndex || 0)
						];
					} else {
						const { x, y, height, width } = $Blocks.find((x) => x.type === 'log');
						$Frame = {
							...$Frame,
							x: -Number(x) + $Frame.width / 2 - width / 2,
							y: -Number(y) + $Frame.height / 2 - height / 2,
							scale: 1
						};
					}
				}}>⏳</button
			>
			<button
				title="Add Current"
				class="dot"
				on:click={async () => {
					if (!$Blocks.find((x) => x.type === 'current')) {
						$Frame.currentIndex += 1;
						$Blocks = [
							...$Blocks,
							await generateBlock('Current', 'current', -1, undefined, $Frame.currentIndex || 0)
						];
					} else {
						const { x, y, height, width } = $Blocks.find((x) => x.type === 'current');
						$Frame = {
							...$Frame,
							x: -Number(x) + $Frame.width / 2 - width / 2,
							y: -Number(y) + $Frame.height / 2 - height / 2,
							scale: 1
						};
					}
				}}>📖</button
			>
			<!-- <button
				title="SAVE"
				class="dot"
				on:click={() => {
					localStorage.setItem('blocks', JSON.stringify($Blocks));
					localStorage.setItem('frame', JSON.stringify($Frame));
				}}>S</button
			> -->
		</div>
	</div>
</div>
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class={`h-[100svh] w-screen ${$Frame.drag ? 'mousedown' : ''}  ${$Frame.dark ? 'dark' : ''}`}
	on:mousedown={() => {
		if ($Frame.cur === -1) $Frame.drag = true;
	}}
	on:touchstart={() => {
		if ($Frame.cur === -1) $Frame.drag = true;
	}}
>
	<div
		class={`h-full w-full overflow-hidden ${$Frame.cur === -1 ? 'bg-neutral-200 dark:bg-neutral-950' : 'bg-neutral-300 dark:bg-neutral-900/70'} `}
	>
		<div
			class="relative min-h-full min-w-full"
			style={`
            transform: matrix(${$Frame.scale}, 0, 0, ${$Frame.scale}, ${$Frame.x}, ${$Frame.y});
        `}
		>
			{#each $ActiveBlocks as block, i}
				<Block {block} {i} />
			{/each}
			{#if $ActiveBlocks.length === 0 && !load}
				<div
					class="flex h-[100svh] w-full animate-pulse items-center justify-center text-lg text-white"
				>
					FROM.PUB
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- use:pinch on:pinch={(e) => {
	$Frame.cur = -1;
	$Frame.scale = prevScale * e.detail.scale;
}}
on:pinchup={(e) => {
	prevScale = $Frame.scale;
}} -->

<style>
	.mousedown {
		cursor: grab;
	}
	.dot {
		@apply flex aspect-square w-8 items-center justify-center rounded-full border bg-white text-white md:w-7 dark:border-neutral-700 dark:bg-neutral-800;
	}
</style>
