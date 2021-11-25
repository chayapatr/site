<script>
	import Navbar from '../Components/Navbar.svelte';
</script>

<Navbar />
<div class="nav-back" />

<main>
	<slot />
</main>

<style>
	main {
		position: relative;
		max-width: 60em;
		background-color: white;
		margin: 0 auto;
		box-sizing: border-box;
	}
	.nav-back {
		height: 45px;
	}
	@media screen and (max-width: 768px) {
		.nav-back {
			height: 75px;
		}
	}
</style>
