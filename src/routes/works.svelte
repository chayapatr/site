<script lang="ts">
	const text =
		'The Molecular Encoded Storage for Space Exploration explores the possibility of preserving human knowledge in space DNA by implementing an algorithm to encode the musical notation into DNA storage and launch the pieces of DNA into space on a sub-orbital flight.';
</script>

<div class="wrapper">
	<div class="introduction">
		<h1>MESSE: a Molecular Encoded Storage for Space Exploration</h1>
	</div>
	<div class="title-wrapper">
		<img src={'favicon.png'} alt="" />
	</div>
	<p>{text}</p>
</div>

<style>
	p {
		font-size: 40px;
		line-height: 40px;
		letter-spacing: -1.5px;
	}
	.introduction {
		max-width: 80%;
	}
	.title-wrapper {
		display: flex;
		align-items: flex-end;
		margin: 30px 0;
	}
	.title-wrapper img {
		width: 100%;
		object-fit: cover;
		margin-right: 30px;
	}
	@media screen and (max-width: 768px) {
		.introduction {
			max-width: 100%;
		}
		.title-wrapper {
			flex-direction: column;
			align-items: flex-start;
		}
		.title-wrapper img {
			width: 100%;
			height: auto;
			margin-right: 0;
			margin-bottom: 10px;
			aspect-ratio: 1 / 1;
		}
	}
</style>
