<script lang="ts">
	import { onMount } from 'svelte';

	let s = 1;
	let drag = false;
	let g: any = () => {};

	let els: { x: number; y: number; text: string }[] = [
		{ x: 0, y: 0, text: 'test1' },
		{ x: 20, y: 30, text: 'test2' }
	];

	let cur: number = -1;
	let two = (n: number) => {
		// convert to two digit float
		return n.toFixed(2);
	};

	let file = '';

	onMount(async () => {
		window.addEventListener(
			'wheel',
			function (e) {
				e.preventDefault();
				console.log(e);
				let d = s - 0.003 * e.deltaY;
				const min = 0.6;
				const max = 1.4;
				s = d > min ? (d < max ? d : max) : min;
			},
			{ passive: false }
		);

		g = (e: MouseEvent) => {
			console.log('ff');
			if (drag) {
				els[cur].x += e.movementX / s;
				els[cur].y += e.movementY / s;
			}
		};
	});
</script>

<svelte:window on:mousemove={g} on:mouseup={() => (drag = false)} />

<div class="fixed bottom-0 left-0 z-50 m-3 flex w-screen justify-center">
	<div
		class="flex min-w-60 items-center justify-between gap-2 rounded-full border border-neutral-700 bg-neutral-800 p-1 text-white shadow-sm"
	>
		<div class="ml-2">{s}</div>
		<button
			class="aspect-square w-7 rounded-full bg-neutral-700 text-white"
			on:click={async () => {
				els = [
					...els,
					{
						x: els[els.length - 1].x + 50,
						y: els[els.length - 1].y + 50,
						text: await fetch(`/${els.length - 1}.md`).then((res) => res.text())
					}
				];
			}}>+</button
		>
	</div>
</div>

<div class="h-screen w-screen">
	<div class="h-full w-full overflow-hidden">
		<div
			class="relative min-h-full min-w-full"
			style={`
            transform: scale(${s});
        `}
		>
			{#each els as el, i}
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div
					class="noselect absolute aspect-square w-36 p-1 text-xs text-white hover:cursor-grab"
					on:mousedown={() => {
						drag = true;
						cur = i;
					}}
					style={`
                        transform: matrix(1, 0, 0, 1, ${el.x}, ${el.y});
                        background-color: hsl(${i * 20}, 100%, 40%);
                `}
				>
					{drag && cur === i}
					{two(el.x)}
					{two(el.y)}
					{i}
					{el.text}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<button
						class="absolute right-0 top-0 aspect-square w-6 border bg-red-400"
						on:click={() => {
							els = els.filter((_, j) => i !== j);
						}}
					>
						x
					</button>
				</div>
			{/each}
		</div>
	</div>
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
</style>
