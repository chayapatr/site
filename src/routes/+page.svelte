<script lang="ts">
	import { onMount } from 'svelte';

	import { generateBlock } from '$lib';
	import { Frame, Blocks, ActiveBlocks, Log } from '$lib/store';
	import Block from '$lib/Block.svelte';
	import Head from '$lib/head.svelte';
	import { pinch } from 'svelte-gestures';

	let move = (_: MouseEvent) => {};
	let touchMove = (_: TouchEvent) => {};

	let prevScale = 1;
	let changeX, changeY;
	let previousTouch: Touch;

	let getInitialBlock = () => {};

	onMount(async () => {
		Object.assign(window, {
			getBlock: async (slug: string, parentIndex: number) => {
				const newId = $Frame.currentIndex + 1;
				$Frame.currentIndex = newId;
				$Blocks = [
					...$Blocks,
					await generateBlock(
						slug,
						'page',
						parentIndex,
						$Blocks.filter((x) => x.id === parentIndex)[0],
						newId || 0
					)
				];
				$Log = [...$Log, `${slug}.md`];
			}
		});

		window.addEventListener(
			'wheel',
			function (e) {
				if ($Frame.cur === -1) {
					e.preventDefault();
					let d = $Frame.scale - 0.003 * e.deltaY;
					const min = 0.5;
					const max = 1.5;
					$Frame.scale = d > min ? (d < max ? d : max) : min;
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
			window.getBlock('!@$', -1);
		};
	});

	$: if ($Blocks.length === 0) getInitialBlock();
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
/>

<div
	class={`fixed bottom-0 left-0 z-50 m-3 flex w-screen justify-center ${$Frame.dark ? 'dark' : ''}`}
>
	<div
		class={`flex min-w-60 items-center justify-between gap-2 rounded-full border p-1 text-neutral-600 shadow-md dark:border-neutral-800 dark:text-white
			${$Frame.dark ? 'glass-dark' : 'glass'}
		`}
	>
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div class="flex gap-1">
			<!-- <div>{$Frame.cur}</div>
			<div>{$Frame.resize}</div> -->
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<buttons
				title="Appearance"
				class="aspect-square w-7 rounded-full border bg-white text-white dark:border-neutral-700 dark:bg-neutral-800"
				on:click={() => {
					$Frame.scale = 1;
				}}>🔎</buttons
			>
			<div>{$Frame.scale.toFixed(2)}</div>
		</div>
		<div class="flex gap-1">
			<button
				title="Clear Frame"
				class="aspect-square w-7 rounded-full border bg-white text-white dark:border-neutral-700 dark:bg-neutral-800"
				on:click={() => {
					$Blocks = [];
					($Frame.x = 0), ($Frame.y = 0), ($Frame.scale = 1);
				}}>✂️</button
			>
			<button
				title="Add Log"
				class="aspect-square w-7 rounded-full border bg-white text-white dark:border-neutral-700 dark:bg-neutral-800"
				on:click={async () => {
					$Frame.currentIndex += 1;
					$Blocks = [
						...$Blocks,
						await generateBlock('Log', 'log', -1, undefined, $Frame.currentIndex || 0)
					];
				}}>📖</button
			>
			<button
				title="Appearance"
				class="aspect-square w-7 rounded-full border bg-white text-white dark:border-neutral-700 dark:bg-neutral-800"
				on:click={() => {
					$Frame.dark = !$Frame.dark;
				}}>{$Frame.dark ? '☀️' : '🌙'}</button
			>
		</div>
	</div>
</div>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class={`h-[100svh] w-screen ${$Frame.drag ? 'mousedown' : ''}  ${$Frame.dark ? 'dark' : ''}`}
	on:mousedown={() => {
		$Frame.drag = true;
	}}
	on:touchstart={() => {
		if ($Frame.cur === -1) $Frame.drag = true;
	}}
>
	<div
		class={`h-full w-full overflow-hidden bg-neutral-200 dark:bg-neutral-950`}
		use:pinch
		on:pinch={(e) => {
			$Frame.scale = prevScale * e.detail.scale;
		}}
		on:pinchup={(e) => {
			prevScale = $Frame.scale;
		}}
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
		</div>
	</div>
</div>

<style>
	.mousedown {
		cursor: grab;
	}
</style>
