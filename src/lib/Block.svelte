<script lang="ts">
	import { onMount } from 'svelte';
	import { Frame, Blocks } from './store';
	import Graph from './Graph.svelte';
	import Setting from './Setting.svelte';
	import { pinch, swipe } from 'svelte-gestures';

	interface Props {
		i: number;
		block: any;
	}

	let { i, block }: Props = $props();

	let rescale = $state((_: MouseEvent) => {});
	let move = $state((_: MouseEvent) => {});
	let touchMove = $state((_: TouchEvent) => {});
	let touchRescale = $state((_: TouchEvent) => {});
	let touch = $state(false);

	let el: HTMLElement = $state();

	let previousTouch: Touch | undefined = $state();

	let changeX = 0,
		changeY = 0;

	const length = (x1: number, x2: number, y1: number, y2: number) => {
		return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
	};

	let chToPixels = (ch: number, el: HTMLElement): number => 0;
	let chSize: number;

	let parentId = $derived($Blocks.findIndex((x) => x.id === block.parentIndex));
	let blockId = $derived($Blocks.findIndex((x) => x.id === block.id));

	function focusBlock() {
		$Frame.cur = i;
		if ($Blocks[blockId].z < $Frame.z) {
			$Frame.z = $Frame.z + 1;
			$Blocks[blockId].z = $Frame.z;
		}
	}

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
				if (
					$Blocks[blockId].width + e.movementX >= 250 &&
					$Blocks[blockId].width + e.movementX <= chSize
				)
					$Blocks[blockId].width += e.movementX;
				if ($Blocks[blockId].height + e.movementY >= 200) $Blocks[blockId].height += e.movementY;
			}
		};
		move = (e: MouseEvent) => {
			if ($Frame.cur === i && !$Frame.resize && $Frame.drag) {
				$Blocks[blockId].x += e.movementX / $Frame.scale;
				$Blocks[blockId].y += e.movementY / $Frame.scale;
			}
		};
		touchMove = (e: TouchEvent) => {
			const touch = e.touches[0];
			if (previousTouch) {
				changeX = touch.pageX - previousTouch.pageX;
				changeY = touch.pageY - previousTouch.pageY;

				if ($Frame.cur === i && !$Frame.resize && $Frame.drag) {
					$Blocks[blockId].x += changeX / $Frame.scale;
					$Blocks[blockId].y += changeY / $Frame.scale;
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
					if ($Blocks[blockId].width + changeX >= 250 && $Blocks[blockId].width + changeX <= 720)
						$Blocks[blockId].width += changeX;
					if ($Blocks[blockId].height + changeY >= 200) $Blocks[blockId].height += changeY;
				}
			}
		};
	});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->

<svelte:window
	onmousemove={(e) => {
		rescale(e);
		move(e);
	}}
	ontouchmove={(e) => {
		touchRescale(e);
		touchMove(e);
	}}
	onmouseup={() => {
		$Frame.resize = false;
		$Frame.drag = false;
		// $Frame.cur = -1;
		requestAnimationFrame(() => {
			touch = false;
		});
	}}
	ontouchend={() => {
		$Frame.resize = false;
		$Frame.drag = false;
		// $Frame.cur = -1;
		previousTouch = undefined;
	}}
/>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	bind:this={el}
	class={`${
		$Frame.cur === i
			? $Frame.drag || $Frame.resize
				? 'noselect border-blue-300 dark:border-amber-700'
				: ' border-blue-600 dark:border-amber-400'
			: 'border-neutral-200 dark:border-neutral-800'
	}
			${$Frame.dark ? 'glass-dark' : 'glass'}
			absolute aspect-square flex-col justify-between overflow-hidden rounded-md border-[1.5px] text-xs text-white shadow-sm
	`}
	onclick={() => {
		if (!touch) {
			focusBlock();
			if ($Blocks[blockId].type === 'graph') {
				$Frame.scale = 1;
			}
		}
	}}
	style={`
        min-width: 250px;
        min-height: 200px;
        max-width: 80ch;
        width: ${$Blocks[blockId].width}px;
        height: ${$Blocks[blockId].height}px;
        transform: matrix(1, 0, 0, 1, ${$Blocks[blockId].x}, ${$Blocks[blockId].y});
		z-index: ${$Blocks[blockId].z}
    `}
>
	<div
		class={`h-full overflow-hidden ${$Frame.cur === i && !$Frame.drag && !$Frame.resize ? '' : 'noselect'}`}
	>
		{#if $Blocks[blockId].type === 'graph'}
			<div class={`noselect ${$Frame.cur === i ? '' : ''}`}>
				<Graph
					height={$Blocks[blockId].height}
					width={$Blocks[blockId].width}
					blockId={$Blocks[blockId].id}
				/>
			</div>
		{:else if $Blocks[blockId].type === 'setting'}
			<div class={`noselect relative ${$Frame.cur === i ? '' : ''}`}>
				<Setting />
				{#if $Frame.cur !== i}
					<div class="fixed left-0 top-0 h-full w-full"></div>
				{/if}
			</div>
		{:else}
			<div
				use:pinch
				use:swipe={{
					timeframe: 300,
					minSwipeDistance: 100,
					touchAction: 'pan-y'
				}}
				onpinch={() => {}}
				class={`prose-em:[#FF82B2] prose prose-sm h-full overflow-y-scroll px-3 pb-4 pt-10 lg:prose-base dark:prose-invert prose-h1:my-1 prose-h1:text-3xl prose-h2:my-1 prose-h3:my-1 prose-h4:my-1 prose-h4:text-emerald-300 prose-p:mb-3 prose-strong:text-[#FF82B2] prose-img:m-1 ${$Frame.cur === i ? 'overflow-y-scroll' : ''}`}
				style="scroll-padding-top: 2.5rem;"
			>
				{@html $Blocks[blockId].text}
				{#if $Frame.cur !== i}
					<div class="fixed left-0 top-0 h-full w-full"></div>
				{/if}
			</div>
		{/if}
	</div>
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class={`
		noselect fixed top-0 flex w-full justify-between border-b  border-neutral-200 bg-neutral-100/70 p-2 dark:border-neutral-800 dark:bg-neutral-950/80`}
		style="backdrop-filter: blur(2px);
        -webkit-backdrop-filter: blur(2px);"
		onmousedown={() => {
			touch = true;
			if (!$Frame.resize) {
				focusBlock();
				$Frame.drag = true;
			}
		}}
		ontouchstart={() => {
			if (!$Frame.resize && $Frame.cur === i) {
				$Frame.drag = true;
			}
		}}
		onclick={() => {
			if ($Frame.cur !== i) focusBlock();
		}}
	>
		<div class="text-neutral-500">
			{$Blocks[blockId].id || 0} | {$Blocks[blockId].title}
			[{$Blocks[blockId].x.toFixed(0)},
			{$Blocks[blockId].y.toFixed(0)}]
		</div>
		<div class="flex gap-2">
			<button
				class=" text-neutral-500"
				onclick={() => {
					let queue = [
						...$Blocks.filter((i) => i.parentIndex === $Blocks[blockId].id).map((x) => x.id)
					];
					let visited = new Set();
					visited.add($Blocks[blockId].id);
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
		onmousedown={() => {
			touch = true;
			$Frame.resize = true;
			$Frame.cur = i;
		}}
		ontouchstart={() => {
			$Frame.resize = true;
			$Frame.cur = i;
		}}
		class="fixed bottom-0 right-0 aspect-square w-[14px] rounded-br-md border-b-[3px] border-r-[3px] border-b-neutral-400 border-r-neutral-400 hover:cursor-se-resize md:w-3 md:border-b-2 md:border-r-2 dark:border-b-neutral-500 dark:border-r-neutral-500"
	></button>
	<!-- {Math.floor(((Math.atan2(y + 24 - cor[1], x + 24 - cor[0]) * 180) / Math.PI) * 1000) / 1000} -->
</div>

{#if block.parentIndex !== -1}
	<div
		class="absolute -z-20"
		style={`
	background-color: ${$Frame.dark ? '#444' : '#bbb'};
	opacity: 0.5;
	height: 2px;
	width: ${length(
		$Blocks[blockId].x + $Blocks[blockId].width / 2,
		$Blocks[parentId].x + $Blocks[parentId].width / 2,
		$Blocks[blockId].y + $Blocks[blockId].height / 2,
		$Blocks[parentId].y + $Blocks[parentId].height / 2
	)}px;
	left: ${$Blocks[blockId].x + $Blocks[blockId].width / 2}px;
	top: ${$Blocks[blockId].y + $Blocks[blockId].height / 2}px;
	transform-origin: left;
	transform: rotate(
		${
			(Math.atan2(
				$Blocks[parentId].y +
					$Blocks[parentId].height / 2 -
					$Blocks[blockId].y -
					$Blocks[blockId].height / 2,
				$Blocks[parentId].x +
					$Blocks[parentId].width / 2 -
					$Blocks[blockId].x -
					$Blocks[blockId].width / 2
			) *
				180) /
			Math.PI
		}deg);
`}
	></div>
{/if}

<style>
	.mousedown {
		cursor: grab;
	}
</style>
