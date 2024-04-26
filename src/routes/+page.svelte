<script lang="ts">
	import { onMount } from 'svelte';
	import { micromark } from 'micromark';

	import { Frame, Els, Log } from '$lib/store';
	import Block from '$lib/Block.svelte';

	let g: any = () => {};

	const getContent = async (slug: string) => {
		const text = await fetch(slug).then((res) => res.text());

		const slugReplacer = (_: string, slug: string) => {
			return `<a onclick={update("${slug}")} href="?${slug}"`;
		};

		const styleParser = (text: string) => {
			return text.replace(/<a href="\/([A-Za-z1-9\s-]*)(?:\.md)?"/g, slugReplacer);
		};

		return styleParser(micromark(text));
	};

	onMount(async () => {
		window.update = async (slug: string) => {
			$Els = [
				...$Els,
				{
					title: `${slug}.md`,
					x: $Els.length > 0 ? $Els[$Els.length - 1].x + 50 : 0,
					y: $Els.length > 0 ? $Els[$Els.length - 1].y + 50 : 0,
					width: 320,
					height: 250,
					text: await getContent(`/${slug}.md`)
				}
			];
			$Log = [...$Log, `${slug}.md`];
		};

		window.update('!@$');

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

		g = (e: MouseEvent) => {
			if ($Frame.cur !== -1 && $Frame.drag && !$Frame.resize) {
				$Els[$Frame.cur].x += e.movementX / $Frame.scale;
				$Els[$Frame.cur].y += e.movementY / $Frame.scale;
			} else if ($Frame.drag && !$Frame.resize) {
				$Frame.x += 0.75 * e.movementX;
				$Frame.y += 0.75 * e.movementY;
			}
		};
	});
</script>

<svelte:window on:mousemove={g} on:mouseup={() => (($Frame.drag = false), ($Frame.cur = -1))} />

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
					window.update('!@$');
				}}>+</button
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
			{#each $Els as el, i}
				<Block {el} {i} />
			{/each}
		</div>
	</div>
</div>
