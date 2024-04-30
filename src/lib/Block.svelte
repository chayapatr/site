<script lang="ts">
	import { onMount } from 'svelte';
	import { Frame, Blocks } from './store';
	import Graph from './Graph.svelte';

	export let i: number;
	export let block: any;

	let rescale = (_: MouseEvent) => {};
	let move = (_: MouseEvent) => {};
	let touchMove = (_: TouchEvent) => {};
	let touchRescale = (_: TouchEvent) => {};
	let el: HTMLElement;

	let previousTouch: Touch;

	let changeX = 0,
		changeY = 0;

	const length = (x1: number, x2: number, y1: number, y2: number) => {
		return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
	};

	let chToPixels = () => {};
	let chSize: number;

	$: parent = $Blocks.filter((x) => x.id === block.parentIndex)[0];
	$: block = $Blocks.filter((x) => x.id === block.id)[0];

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
				if (block.width + e.movementX >= 250 && block.width + e.movementX <= chSize)
					block.width += e.movementX;
				if (block.height + e.movementY >= 200) block.height += e.movementY;
			}
		};
		move = (e: MouseEvent) => {
			if ($Frame.cur === i && !$Frame.resize && $Frame.drag) {
				block.x += e.movementX / $Frame.scale;
				block.y += e.movementY / $Frame.scale;
			}
		};
		touchMove = (e: TouchEvent) => {
			const touch = e.touches[0];
			if (previousTouch) {
				changeX = touch.pageX - previousTouch.pageX;
				changeY = touch.pageY - previousTouch.pageY;

				if ($Frame.cur === i && !$Frame.resize && $Frame.drag) {
					block.x += changeX / $Frame.scale;
					block.y += changeY / $Frame.scale;
				}
			}
			previousTouch = touch;
		};
		touchRescale = (e: TouchEvent) => {
			const touch = e.touches[0];
			if (previousTouch) {
				changeX = touch.pageX - previousTouch.pageX;
				changeY = touch.pageY - previousTouch.pageY;

				if ($Frame.cur === i && $Frame.resize) {
					if (block.width + changeX >= 250 && block.width + changeX <= 720) block.width += changeX;
					if (block.height + changeY >= 200) block.height += changeY;
				}
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
	on:touchmove={(e) => {
		touchRescale(e);
		touchMove(e);
	}}
	on:mouseup={() => {
		$Frame.resize = false;
		$Frame.drag = false;
		$Frame.cur = -1;
	}}
	on:touchend={() => {
		$Frame.resize = false;
		$Frame.drag = false;
		// $Frame.cur = -1;
		previousTouch = undefined;
	}}
/>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	bind:this={el}
	class={`${$Frame.drag && $Frame.cur === i ? 'noselect' : ''} absolute aspect-square flex-col justify-between overflow-hidden rounded-sm border border-neutral-200 text-xs text-white shadow-sm dark:border-neutral-800
        ${$Frame.cur === i ? 'border-3 border-neutral-400/60 dark:border-white/30' : ''}
		${$Frame.dark ? 'glass-dark' : 'glass'}`}
	on:click={() => {
		$Frame.cur = i;
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
	<div
		class={`h-full overflow-x-hidden ${$Frame.cur === i ? 'overflow-y-scroll' : 'overflow-y-hidden'}`}
	>
		{#if block.type === 'graph'}
			<div class="noselect">
				<Graph height={block.height} width={block.width} blockId={block.id} />
			</div>
		{:else}
			<div class="prose prose-sm px-3 pb-4 pt-10 dark:prose-invert">
				{@html block.text}
			</div>
		{/if}
	</div>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div
		class="noselect fixed top-0 flex w-full justify-between border-b border-neutral-200 bg-neutral-100/70 p-2 dark:border-neutral-800 dark:bg-neutral-950/80"
		style="backdrop-filter: blur(2px);
        -webkit-backdrop-filter: blur(2px);"
		on:touchstart={() => {
			if (!$Frame.resize && $Frame.cur === i) {
				$Frame.drag = true;
			}
		}}
		on:mousedown={() => {
			if (!$Frame.resize) {
				$Frame.cur = i;
				$Frame.drag = true;
			}
		}}
	>
		<div class="text-neutral-500">
			{block.id || 0} | {block.title}
			[{block.x.toFixed(0)},
			{block.y.toFixed(0)}]
		</div>
		<div class="flex gap-2">
			<button
				class=" text-neutral-500"
				on:click={() => {
					let queue = [...$Blocks.filter((i) => i.parentIndex === block.id).map((x) => x.id)];
					let visited = new Set();
					visited.add(block.id);
					while (queue.length > 0) {
						const el = queue.shift();
						visited.add(el);
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
	</div>

	<button
		on:mousedown={() => {
			$Frame.resize = true;
			$Frame.cur = i;
		}}
		on:touchstart={() => {
			$Frame.resize = true;
			$Frame.cur = i;
		}}
		class="fixed bottom-0 right-0 aspect-square w-3 rounded-br-sm border-b-2 border-r-2 border-b-neutral-300 border-r-neutral-300 hover:cursor-se-resize dark:border-b-neutral-500 dark:border-r-neutral-500"
	></button>
	<!-- {Math.floor(((Math.atan2(y + 24 - cor[1], x + 24 - cor[0]) * 180) / Math.PI) * 1000) / 1000} -->
</div>

{#if block.parentIndex !== -1 && !$Frame.drag}
	<div
		class="absolute -z-20"
		style={`
	background-color: ${$Frame.dark ? '#333' : '#bbb'};
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
