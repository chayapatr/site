<script lang="ts">
	import Image from '../Components/Image.svelte';
	import Gallary from '../Components/Gallary.svelte';
	const img = [
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
</script>

<svelte:head>
	<title>Chayapatr</title>
</svelte:head>

<div class="wrapper">
	<h1>Gallary</h1>
</div>
<Gallary gallary={img} detail={false}/>