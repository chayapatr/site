<script lang="ts">
	import { onMount } from 'svelte';

	import { getContent } from '$lib';
	import { Frame, Blocks, ActiveBlocks, Log } from '$lib/store';
	import Block from '$lib/Block.svelte';

	let move = (_: MouseEvent) => {};

	onMount(async () => {
		Object.assign(window, {
			getPage: async (slug: string) => {
				$Blocks = [
					...$Blocks,
					{
						title: `${slug}.md`,
						type: 'page',
						x: $Blocks.length > 0 ? $Blocks[$Blocks.length - 1].x + 50 : 0,
						y: $Blocks.length > 0 ? $Blocks[$Blocks.length - 1].y + 50 : 0,
						width: 320,
						height: 250,
						text: await getContent(`/${slug}.md`)
					}
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

		window.getPage('!@$');
	});
</script>

<svelte:window
	on:mousemove={move}
	on:mouseup={() => {
		$Frame.drag = false;
		$Frame.cur = -1;
	}}
/>

<div class="fixed bottom-0 left-0 z-50 m-3 flex w-screen justify-center">
	<div
		class="glass flex min-w-60 items-center justify-between gap-2 rounded-full border border-neutral-800 p-1 text-white shadow-md"
	>
		<div class="ml-2 flex gap-1">
			<div>{$Frame.cur}</div>
			<div>{$Frame.resize}</div>
			<div>{$Frame.scale.toFixed(2)}</div>
		</div>
		<div class="flex gap-1">
			<button
				class="aspect-square w-7 rounded-full bg-neutral-700 text-white"
				on:click={async () => {
					($Frame.x = 0), ($Frame.y = 0), ($Frame.scale = 1);
				}}>◻️</button
			>
			<button
				class="aspect-square w-7 rounded-full bg-neutral-700 text-white"
				on:click={async () => {
					window.getPage('!@$');
				}}>+</button
			>
			<button
				class="aspect-square w-7 rounded-full bg-neutral-700 text-white"
				on:click={async () => {
					$Blocks = [
						...$Blocks,
						{
							title: `Log`,
							type: 'log',
							x: $Blocks.length > 0 ? $Blocks[$Blocks.length - 1].x + 50 : 0,
							y: $Blocks.length > 0 ? $Blocks[$Blocks.length - 1].y + 50 : 0,
							width: 320,
							height: 250
						}
					];
				}}>😀</button
			>
		</div>
	</div>
</div>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class={`h-screen w-screen ${$Frame.drag ? 'mousedown' : ''}`}
	on:mousedown={() => {
		$Frame.drag = true;
	}}
>
	<div class={`h-full w-full overflow-hidden bg-neutral-950`}>
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
