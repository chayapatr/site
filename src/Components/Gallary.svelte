<script lang="ts">
	import Image from '../Components/Image.svelte';
	export let gallary: TImage[];
	export let detail: boolean;

	const images = gallary.map((image) => {
		const file = image.img.split('.')[0];
		return [
			file,
			image.title,
			image.link
		];
	});
</script>

<section class="wrapper">
	{#each images as image}
	<div class="work">
		{#if detail}
			<a href={image[2]}>
				<h2>{image[1]}</h2>
				<div class="img detail"><Image {image} /></div>
			</a>
		{:else}
			<div class="img"><Image {image} /></div>
		{/if}
	</div>
	{/each}
</section>

<style>
	.wrapper {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		padding: 15px 0;
		column-gap: 10px;
		row-gap: 15px;
	}

	.work {
		width: calc(33.33% - 8.33px);
		aspect-ratio: 1/1;
		overflow: hidden;
	}

	.work a {
		display: block;
		position: relative;
	}

	.work h2{ 
		position: absolute;
		color: white;
    	top: 100%;
		left: 3%;
		right: 3%;
    	-webkit-transform: translateY(-100%);
    	-ms-transform: translateY(-100%);
    	transform: translateY(-100%);
		z-index: 999;
		opacity: 0;
	}

	.work:hover h2 {
		opacity: 1;
		top: 95%;
		transition: 0.25s ease-in-out;
	}

	.work :global(.img.detail) {
		scale: 1.02;
	}

	.work:hover :global(.img.detail) {
		scale: 1.01;
		filter: blur(2px);
		transition: 0.2s ease-in-out;
	}

	@media screen and (max-width: 760px) {
		.wrapper {
			flex-direction: column;
			padding: 0 15px;
			row-gap: 0px;
		}

		.work {
			width: 100%;
		}
	}
</style>
