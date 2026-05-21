<script lang="ts">
	import { fade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import type { WritingSource, WritingYear } from '$lib/writings';

	type Props = {
		writingYears: WritingYear[];
		activeSource: WritingSource | null;
		mobile?: boolean;
	};

	let { writingYears, activeSource = $bindable(), mobile = false }: Props = $props();

	const sourceColors: Record<WritingSource, [string, string]> = {
		medium:   ['#E8F0E8', '#2D6A2D'],
		spaceth:  ['#E8EEF8', '#2A4A8A'],
		substack: ['#FDF0E0', '#8A4A00'],
	};

	const sourceLabels: Record<WritingSource, string> = {
		medium:   'Medium',
		spaceth:  'Spaceth',
		substack: 'Substack',
	};

	const allSources: WritingSource[] = ['medium', 'spaceth', 'substack'];

	const visibleYears = $derived(
		writingYears
			.map((g) => ({
				year: g.year,
				writings: activeSource ? g.writings.filter((w) => w.source === activeSource) : g.writings,
			}))
			.filter((g) => g.writings.length > 0)
			.sort((a, b) => b.year - a.year)
	);
</script>

<div class="flex flex-col py-2">
	{#each visibleYears as group (group.year)}
		<div class="mb-1 border-b border-neutral-200 pb-1 text-xs text-neutral-400 not-first:pt-3">
			{group.year}
		</div>
		{#each group.writings as writing (writing.slug)}
			<div class="flex items-center gap-2 border-b border-neutral-100 py-1.5">
				<div class="flex min-w-0 flex-1 flex-col gap-0.5">
					<span class="min-w-0 truncate text-sm text-neutral-700">{writing.title}</span>
					<span
						class="w-fit rounded-full px-1.5 py-0.5 text-[10px] leading-none"
						style="background-color: {sourceColors[writing.source][0]}; color: {sourceColors[writing.source][1]}"
					>{sourceLabels[writing.source]}</span>
				</div>
			</div>
		{/each}
	{/each}
</div>
