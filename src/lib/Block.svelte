<script lang="ts">
	import { onMount } from 'svelte';
	import { Frame, Blocks } from './store';
	export let i: number;
	export let block: any;

	let rescale = (_: MouseEvent) => {};
	let move = (_: MouseEvent) => {};
	let el: HTMLElement;

	const length = (x1: number, x2: number, y1: number, y2: number) => {
		return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
	};

	let chToPixels = () => {};
	let chSize: number;

	$: parent = $Blocks.filter((x) => x.id === block.parentIndex)[0];

	onMount(() => {
		chToPixels = (ch: number, el: HTMLElement): number => {
			const tempElement = document.createElement('div');
			tempElement.style.display = 'inline-block';
			tempElement.style.fontFamily = window.getComputedStyle(el).fontFamily;
			tempElement.style.fontSize = window.getComputedStyle(el).fontSize;
			tempElement.style.width = ch + 'ch';

			el.appendChild(tempElement);
			const pixelWidth = tempElement.offsetWidth;
			el.removeChild(tempElement);

			return pixelWidth;
		};

		rescale = (e: MouseEvent) => {
			if (!chSize) chSize = chToPixels(80, el);
			if ($Frame.cur === i && $Frame.resize) {
				if ($Blocks[i].width + e.movementX >= 250 && $Blocks[i].width + e.movementX <= chSize)
					$Blocks[i].width += e.movementX;
				if ($Blocks[i].height + e.movementY >= 200) $Blocks[i].height += e.movementY;
			}
		};
		move = (e: MouseEvent) => {
			if ($Frame.cur === i && !$Frame.resize && $Frame.drag) {
				$Blocks[i].x += e.movementX / $Frame.scale;
				$Blocks[i].y += e.movementY / $Frame.scale;
			}
		};
	});
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->

<svelte:window
	on:mousemove={(e) => {
		rescale(e);
		move(e);
	}}
	on:mouseup={() => {
		$Frame.resize = false;
		$Frame.drag = false;
		$Frame.cur = -1;
	}}
/>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	bind:this={el}
	class={`noselect absolute aspect-square flex-col justify-between overflow-hidden rounded-sm border border-neutral-200 text-xs text-white shadow-sm active:cursor-grab dark:border-neutral-800
        ${$Frame.cur === i ? 'border-3 border-neutral-400/60 dark:border-white/30' : ''}
		${$Frame.dark ? 'glass-dark' : 'glass'}`}
	on:click={() => {
		$Frame.cur = i;
	}}
	on:mousedown={() => {
		if (!$Frame.resize) {
			$Frame.cur = i;
			$Frame.drag = true;
		}
	}}
	style={`
        min-width: 250px;
        min-height: 200px;
        max-width: 80ch;
        width: ${block.width}px;
        height: ${block.height}px;
        transform: matrix(1, 0, 0, 1, ${block.x}, ${block.y});
    `}
>
	<div class="h-full overflow-x-hidden overflow-y-scroll">
		<div class="prose prose-sm px-3 pb-4 pt-10 dark:prose-invert">
			{block.id}
			{@html block.text}
		</div>
	</div>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div
		class="fixed top-0 flex w-full justify-between border-b border-neutral-200 bg-neutral-100/70 p-2 dark:border-neutral-800 dark:bg-neutral-950/80"
		style="backdrop-filter: blur(2px);
        -webkit-backdrop-filter: blur(2px);"
	>
		<div class="text-neutral-500">
			{block.id || 0} | {block.title}
			[{block.x.toFixed(2)},
			{block.y.toFixed(2)}]
		</div>
		<button
			class=" text-neutral-500"
			on:click={() => {
				// get all children of block using bfs
				let queue = [...$Blocks.filter((i) => i.parentIndex === block.id).map((x) => x.id)];
				let visited = new Set();
				visited.add(block.id);
				while (queue.length > 0) {
					const el = queue.shift();
					visited.add($Blocks[el].id);
					queue = [
						...queue,
						...$Blocks.filter((i) => i.parentIndex === el && !visited.has(i.id)).map((x) => x.id)
					];
				}
				$Blocks = $Blocks.filter((i) => !visited.has(i.id));
			}}
		>
			[x]
		</button>
	</div>
	<button
		on:mousedown={() => {
			$Frame.resize = true;
			$Frame.cur = i;
		}}
		class="fixed bottom-0 right-0 aspect-square w-3 rounded-br-sm border-b-2 border-r-2 border-b-neutral-300 border-r-neutral-300 hover:cursor-se-resize dark:border-b-neutral-500 dark:border-r-neutral-500"
	></button>
	<!-- {Math.floor(((Math.atan2(y + 24 - cor[1], x + 24 - cor[0]) * 180) / Math.PI) * 1000) / 1000} -->
</div>

{#if block.parentIndex !== -1}
	<div
		class="absolute -z-20"
		style={`
	background-color: ${$Frame.dark ? '#222' : '#bbb'};
	opacity: 0.5;
	height: 2px;
	width: ${length(
		block.x + block.width / 2,
		parent.x + parent.width / 2,
		block.y + block.height / 2,
		parent.y + parent.height / 2
	)}px;
	left: ${block.x + block.width / 2}px;
	top: ${block.y + block.height / 2}px;
	transform-origin: left;
	transform: rotate(
		${
			(Math.atan2(
				parent.y + parent.height / 2 - block.y - block.height / 2,
				parent.x + parent.width / 2 - block.x - block.width / 2
			) *
				180) /
			Math.PI
		}deg);
`}
	></div>
{/if}

<style>
	.noselect {
		-webkit-touch-callout: none;
		-webkit-user-select: none;
		-khtml-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}
	.mousedown {
		cursor: grab;
	}
</style>
