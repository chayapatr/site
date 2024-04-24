<script lang="ts">
	import { onMount } from 'svelte';
	import { micromark } from 'micromark';

	let s = 1;
	let drag = false;
	let g: any = () => {};

	let x = 0,
		y = 0;

	let els: { x: number; y: number; text: string; sx; sy }[] = [
		{ x: 10, y: 10, text: 'test1', sx: '320', sy: '320' }
	];

	let cur: number = -1;
	const two = (n: number) => {
		// convert to two digit float
		return n.toFixed(2);
	};

	const getContent = async (slug: string) => {
		const text = await fetch(slug).then((res) => res.text());

		const slugReplacer = (match, slug) => {
			return `<a onclick={update("${slug}")} href="?${slug}"`;
		};

		const styleParser = (text: string) => {
			return text.replace(/<a href="\/([A-Za-z1-9\s-]*)(?:\.md)?"/g, slugReplacer);
		};

		return styleParser(micromark(text));
	};

	onMount(async () => {
		window.update = async (s) => {
			els = [
				...els,
				{
					x: els[els.length - 1].x + 50,
					y: els[els.length - 1].y + 50,
					sx: '320',
					sy: '320',
					text: await getContent(`/${s}.md`)
				}
			];
		};

		window.addEventListener(
			'wheel',
			function (e) {
				if (cur === -1) {
					e.preventDefault();
					let d = s - 0.003 * e.deltaY;
					const min = 0.5;
					const max = 1.5;
					s = d > min ? (d < max ? d : max) : min;
				}
			},
			{ passive: false }
		);

		g = (e: MouseEvent) => {
			if (drag && cur > -1) {
				els[cur].x += e.movementX / s;
				els[cur].y += e.movementY / s;
			} else if (drag) {
				x += 0.75 * e.movementX;
				y += 0.75 * e.movementY;
			}
		};
	});
</script>

<svelte:window on:mousemove={g} on:mouseup={() => ((drag = false), (cur = -1))} />

<div class="fixed bottom-0 left-0 z-50 m-3 flex w-screen justify-center">
	<div
		class="glass flex min-w-60 items-center justify-between gap-2 rounded-full border border-neutral-800 p-1 text-white shadow-md"
	>
		<div class="ml-2 flex gap-1">
			<div>{cur}</div>
			<div>{two(s)}</div>
		</div>
		<div class="flex gap-1">
			<button
				class="aspect-square w-7 rounded-full bg-neutral-700 text-white"
				on:click={async () => {
					(x = 0), (y = 0), (s = 1);
				}}>◻️</button
			>
			<button
				class="aspect-square w-7 rounded-full bg-neutral-700 text-white"
				on:click={async () => {
					els = [
						...els,
						{
							x: els.length > 0 ? els[els.length - 1].x + 50 : 0,
							y: els.length > 0 ? els[els.length - 1].y + 50 : 0,
							text: await getContent(`/!@$.md`),
							sx: '320',
							sy: '320'
						}
					];
				}}>+</button
			>
		</div>
	</div>
</div>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class={`h-screen w-screen ${drag ? 'mousedown' : ''}`}
	on:mousedown={() => {
		drag = true;
	}}
>
	<div class={`h-full w-full overflow-hidden bg-neutral-950`}>
		<div
			class="relative min-h-full min-w-full"
			style={`
            transform: matrix(${s}, 0, 0, ${s}, ${x}, ${y});
        `}
		>
			{#each els as el, i}
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div
					class={`noselect glass absolute aspect-square max-h-80 w-80 flex-col justify-between rounded-sm border border-neutral-800 text-xs text-white shadow-sm transition-shadow hover:cursor-grab hover:shadow-md
                        ${cur === i ? 'border-3 overflow-scroll border-white/30' : 'overflow-hidden'}
                    `}
					on:click={() => {
						cur = i;
					}}
					on:mousedown={() => {
						cur = i;
						drag = true;
					}}
					style={`
                        transform: matrix(1, 0, 0, 1, ${el.x}, ${el.y});
                `}
				>
					<div class="prose prose-sm prose-invert px-1 py-6">
						{@html el.text}
					</div>
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<div class="absolute top-0 flex w-full justify-between p-1">
						<div class="text-neutral-500">
							{two(el.x)}
							{two(el.y)}
						</div>
						<button
							class=" text-neutral-500"
							on:click={() => {
								els = els.filter((_, j) => i !== j);
							}}
						>
							[x]
						</button>
					</div>
					<!-- <div class="fixed bottom-0 w-full p-1">
						<div class="text-neutral-500">
							{drag && cur === i}
							{two(el.x)}
							{two(el.y)}
							{i}
						</div>
					</div> -->
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
	.mousedown {
		cursor: grab;
	}
	.glass {
		/* background: linear-gradient(135deg, rgba(100, 100, 100, 0.07), rgba(100, 100, 100, 0.15)); */
		background: rgba(100, 100, 100, 0.1);
		box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
		backdrop-filter: blur(2px);
		-webkit-backdrop-filter: blur(2px);
	}
</style>
