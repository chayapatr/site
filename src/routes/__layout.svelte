<script>
	import Navbar from '../Components/Navbar.svelte';
	import Transition from '../Components/Transition.svelte';
	export let key
</script>

<script context="module">
	export const load = async ({ page }) => ({
	  props: {
		key: page.path,
	  },
	})
</script>

<Navbar />
<div class="nav-back" />

<Transition refresh={key}>
	<main>
    	<slot />
	</main>
</Transition>

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
