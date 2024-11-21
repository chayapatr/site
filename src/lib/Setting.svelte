<!-- @migration-task Error while migrating Svelte code: `<button>` is invalid inside `<button>` -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { Blocks, Frame, Path } from './store';

	let success = $state(-1);
	let name = $state('');

	const formatPath = (path: { nodes: any; links: any }) => {
		const { nodes, links } = path;
		return {
			nodes: nodes.map((x: { id: any; open: any }) => ({ id: x.id, open: x.open ?? false })),
			links: links.map((x: { source: { id: any }; target: { id: any } }) => {
				if (typeof x.source === 'string') {
					return {
						source: x.source,
						target: x.target
					};
				}
				return {
					source: x.source.id,
					target: x.target.id
				};
			})
		};
	};

	onMount(() => {
		boards = JSON.parse(localStorage.getItem('boards') || '[]');
	});

	let boards: any[] = $state([]);
</script>

<div class="mt-8 flex w-full flex-col gap-4 p-2 text-base">
	<div class="w-full text-neutral-900 dark:text-neutral-100">
		<div class="mb-1 flex w-full items-center justify-between">
			<h4 class="font-medium">Boards</h4>
			<button
				class="text-xs text-neutral-600 hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-500"
				onclick={() => {
					localStorage.setItem('boards', JSON.stringify([]));
					boards = [];
				}}>Clear</button
			>
		</div>
		<div class="grid w-full gap-2 md:grid-cols-2">
			{#each boards as board, i}
				<div class="relative">
					<button
						onclick={async () => {
							$Blocks = board.blocks;
							$Frame = board.frame;
							$Path = board.path;
							success = 1;
							setTimeout(() => {
								success = -1;
							}, 500);
						}}
						class="glass w-full rounded-md border border-neutral-300 bg-neutral-100 px-2 py-[0.15rem] text-left hover:bg-neutral-200/50 dark:border-neutral-700 dark:bg-neutral-800/80 dark:hover:bg-neutral-800/40"
					>
						<div class="flex w-full justify-between gap-2">
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<div class="overflow-hidden pr-2 text-sm">{board?.name}</div>
						</div>
						<div class="flex w-full justify-between gap-2 text-xs text-neutral-500">
							<div>{board?.time}</div>
						</div>
					</button>
					<button
						class="absolute right-[0.45rem] top-1 text-xs hover:text-red-600 dark:hover:text-red-500"
						onclick={() => {
							boards = boards.filter((x, j) => i !== j);
							localStorage.setItem('boards', JSON.stringify(boards));
						}}>[x]</button
					>
				</div>
			{/each}
		</div>
	</div>
	<!-- <button
			title="Load"
			class="wrap"
			on:click={async () => {
				$Blocks = JSON.parse(localStorage.getItem('blocks') || '');
				$Frame = JSON.parse(localStorage.getItem('frame') || '');
				$Path = JSON.parse(localStorage.getItem('path') || '');
				success = 1;
				setTimeout(() => {
					success = -1;
				}, 500);
			}}
			><div class={success === 1 ? 'dot-success' : 'dot'}>
				{success === 1 ? '✌️' : '🤔'}
			</div>
			LOAD</button
		> -->
	<div class="flex w-full items-center gap-1 text-sm">
		<input
			type="text"
			bind:value={name}
			placeholder="Board Name"
			name=""
			id=""
			class="w-full rounded-md border border-neutral-300 px-2 py-[0.15rem] text-neutral-900 outline-none focus:border-blue-600 dark:border-neutral-700 dark:bg-neutral-800/80 dark:text-neutral-100 dark:focus:border-amber-400 dark:focus:ring-0"
		/>
		<button
			title="Save current board"
			class="btn"
			disabled={!name}
			onclick={async () => {
				// localStorage.setItem('blocks', JSON.stringify($Blocks));
				// localStorage.setItem('frame', JSON.stringify($Frame));
				// localStorage.setItem('path', JSON.stringify(formatPath($Path)));
				let l = boards.length;
				let time = new Date();
				localStorage.setItem(
					'boards',
					JSON.stringify([
						...boards,
						{
							name,
							time: time.toLocaleString(undefined, {
								day: '2-digit',
								month: 'numeric',
								year: '2-digit',
								hour: '2-digit',
								minute: '2-digit',
								hour12: false
							}),
							blocks: $Blocks,
							frame: $Frame,
							path: formatPath($Path)
						}
					])
				);
				boards = JSON.parse(localStorage.getItem('boards') || '[]');
				if (boards.length > l) {
					success = 0;
					name = '';
				}
				setTimeout(() => {
					success = -1;
					boards = boards;
				}, 500);
			}}
		>
			Save</button
		>
		<div>
			{success === 0 ? '✅' : ''}
		</div>
	</div>
</div>

<!-- class={success === 0 ? 'dot-success' : 'dot'} -->

<style>
	.btn {
		@apply flex w-min items-center justify-center gap-1 rounded-md border bg-blue-600 px-2 py-[0.15rem] hover:bg-blue-700 dark:border-neutral-800  dark:bg-amber-400  dark:text-neutral-900 dark:hover:bg-amber-500;
	}
	.btn:disabled {
		@apply border bg-neutral-400 dark:bg-neutral-600;
	}
</style>
