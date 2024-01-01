<script>
	import Conway from '../../../components/Conway.svelte'
	import Draggable from '../../../components/Draggable.svelte'
	let levels = [1]
</script>

<div>
	<Draggable rand={true} top={300} show={false}>
		<button
			on:click={() => {
				levels = [...levels, 1]
			}}>Add Levels</button
		>
	</Draggable>

	{#each levels as level}
		<div class={`opacity-[20%]`}>
			<Conway stats={false} />
		</div>
	{/each}
</div>
