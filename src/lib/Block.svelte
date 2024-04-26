<script lang="ts">
	import { onMount } from 'svelte';
	import { Frame, Els } from './store';
	export let i: number;
	export let el: any;

	let s = () => {};

	onMount(() => {
		s = (e: MouseEvent) => {
			if ($Frame.resize && $Frame.cur === i) {
				el.width += e.movementX;
				el.height += e.movementY;
			}
		};
	});
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->

<svelte:window
	on:mousemove={s}
	on:mouseup={() => {
		$Frame.resize = false;
		$Frame.drag = false;
		$Frame.cur = -1;
	}}
/>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class={`noselect glass absolute aspect-square flex-col justify-between overflow-hidden rounded-sm border border-neutral-800 text-xs text-white shadow-sm transition-shadow hover:cursor-grab hover:shadow-md
        ${$Frame.cur === i ? 'border-3  border-white/30' : ''}`}
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
        width: ${el.width}px;
        height: ${el.height}px;
        transform: matrix(1, 0, 0, 1, ${el.x}, ${el.y});
    `}
>
	<div class="h-full overflow-x-hidden overflow-y-scroll">
		<div class="prose prose-sm prose-invert px-3 pb-4 pt-10">
			{@html el.text}
		</div>
	</div>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div
		class="fixed top-0 flex w-full justify-between border-b border-neutral-800 bg-neutral-950/80 p-2"
		style="backdrop-filter: blur(2px);
        -webkit-backdrop-filter: blur(2px);"
	>
		<div class="text-neutral-500">
			{el.title}
			<!-- {el.x.toFixed(2)}
			{el.y.toFixed(2)} -->
		</div>
		<button
			class=" text-neutral-500"
			on:click={() => {
				$Els = $Els.filter((_, j) => i !== j);
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
		class="fixed bottom-0 right-0 aspect-square w-3 rounded-br-sm border-b-2 border-r-2 border-b-neutral-500 border-r-neutral-500 hover:cursor-se-resize"
	></button>
</div>

<style>
	.noselect {
		-webkit-touch-callout: none; /* iOS Safari */
		-webkit-user-select: none; /* Safari */
		-khtml-user-select: none; /* Konqueror HTML */
		-moz-user-select: none; /* Old versions of Firefox */
		-ms-user-select: none; /* Internet Explorer/Edge */
		user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome, Edge, Opera and Firefox */
	}
	.mousedown {
		cursor: grab;
	}
</style>
