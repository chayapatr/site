<script lang="ts">
	import Image from '../Components/Image.svelte';
	import Gallary from '../Components/Gallary.svelte';
	const talks = [
		{
			title: 'TEDxUTCC 2021',
			img: 'tedsq.png'
		},
		{
			title: 'Hacktoberfest Thailand 2020',
			img: 'hacktoberfest.png'
		},
		{
			title: 'bangkok citycity gallary',
			img: 'bccg.png'
		}
	];
	const works = [
		{
			title: 'Molecular Encoded Storage for Space Exploration',
			link: 'messe',
			img: 'messe.png'
		},
		{
			title: 'Recursive (Mono?) Sans Thai',
			link: 'recthai',
			img: 'recthai.png'
		},
		{
			title: 'BKK.JS',
			link: 'bkkjs',
			img: 'bkkjs.png'
		},
		{
			title: 'The Stupid Hackathon Thailand',
			link: 'sht',
			img: 'sht5.png'
		},
		{
			title: 'SPACETH.CO',
			link: 'spaceth',
			img: 'spaceth.png'
		},
		{
			title: 'Forgotten',
			link: 'forgotten',
			img: 'forgotten.png'
		},
		{
			title: 'The 15th Thailand Olympiad in Informatics',
			link: 'toi15',
			img: 'toi.png'
		}
	];
</script>

<svelte:head>
	<title>Chayapatr</title>
</svelte:head>

<div class="wrapper">
	<div class="introduction">
		<h1>Hello! My name is Chayapatr. I'm an antidisciplinary creator based in Bangkok, Thailand</h1>
	</div>
	<div class="title-wrapper">
		<div class="image-wrapper">
			<Image image={["profile", "profile"]} />
		</div>
		<h2 class="me-large">&lt;- (This is me)</h2>
		<h1 class="me-small">^ (This is me)</h1>
	</div>
</div>
<div class="wrapper">
	<h1>Works/Projects</h1>
</div>
<Gallary gallary={works} detail={true}/>
<div class="wrapper">
	<h1>Talks/Keynotes</h1>
</div>
<Gallary gallary={talks} detail={true}/>

<style>
	.introduction {
		max-width: 80%;
	}
	.title-wrapper {
		display: flex;
		align-items: flex-end;
		margin: 30px 0 0;
	}
	.image-wrapper {
		width: calc(66.66% - 8.33px);
		object-fit: cover;
		margin-right: 30px;
	}
	.me-small {
		display: none;
	}
	@media screen and (max-width: 768px) {
		.introduction {
			max-width: 100%;
		}
		.title-wrapper {
			flex-direction: column;
			align-items: flex-start;
		}
		.image-wrapper {
			width: 100%;
			object-fit: cover;
			margin-right: 0px;
		}
		.me-small {
			display: block;
		}
		.me-large {
			display: none;
		}
	}
</style>
