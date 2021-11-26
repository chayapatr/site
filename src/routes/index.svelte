<script lang="ts">
	import Image from 'svelte-image';
	import Carousel from '../Components/Carousel.svelte';
	import Gallary from '../Components/Gallary.svelte';
	const talks = [
		{
			title: 'TEDxUTCC 2021',
			img: 'tedsq.png'
		},
		{
			title: 'Hacktoberfest 2020',
			img: 'hacktoberfest.png'
		},
		{
			title: 'bangkok citycity gallary',
			img: 'bccg.png'
		}
	];
	const works = [
		{
			title: 'MESSE',
			img: 'messe.png'
		},
		{
			title: 'Recursive Mono Thai',
			img: 'recthai.png'
		},
		{
			title: 'bkkjs',
			img: 'bkkjs.png'
		},
		{
			title: 'the 5th stupid hackathon thailand',
			img: 'sht5.png'
		},
		{
			title: 'spaceth',
			img: 'spaceth.png'
		},
		{
			title: 'forgotten',
			img: 'forgotten.png'
		},
		{
			title: 'toi15',
			img: 'toi.png'
		},
		{
			title: 'forgotten',
			img: 'forgotten.png'
		},
		{
			title: 'forgotten',
			img: 'forgotten.png'
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
			<Image src="profile.png" alt="profile" />
			<!-- <img src="profile.png" srcset="g/profile-400.png 375w,g/profile-800.png 768w,g/profile.png 1024w," alt="profile" /> -->
		</div>
		<h2 class="me-large">&lt;- (This is me)</h2>
		<h1 class="me-small">^ (This is me)</h1>
	</div>
</div>
<div class="wrapper">
	<h1>Works/Projects</h1>
</div>
<Gallary gallary={works} />
<div class="wrapper">
	<h1>Talks/Keynotes</h1>
</div>
<Gallary gallary={talks} />

<style>
	.wrapper {
		padding: 0 15px;
	}
	.introduction {
		max-width: 80%;
	}
	.title-wrapper {
		display: flex;
		align-items: flex-end;
		margin: 30px 0;
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
