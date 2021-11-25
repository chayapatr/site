<script lang="ts">
	// import Image from 'svelte-image';
	import Image from '../Components/Image.svelte'
	export let gallary: TImage[];

	const images = gallary.map((image) => {
		const file = image.img.split('.')[0];
		return [
			// `g/${file}-400.png 375w,g/${file}-800.png 768w,g/${file}.png 1024w,`,
			file,
			image.title
		];
	});
</script>

<section class="wrapper">
	{#each images as image}
		<div class="work">
			<!-- <img srcset={image[0]} src={image[1]} alt={image[2]} /> -->
			<Image {image} />
		</div>
	{/each}
</section>

<style>
	.wrapper {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;

		padding: 12px;
		column-gap: 10px;
		row-gap: 10px;
	}

	.work {
		width: calc(33.33% - 8.33px);
		overflow: hidden;
	}

	@media screen and (max-width: 760px) {
		.wrapper {
			flex-direction: column;
		}

		.work {
			width: 100%;
		}
	}
</style>
