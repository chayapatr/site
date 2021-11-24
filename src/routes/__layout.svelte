<script>
	import Navbar from '../Components/Navbar.svelte'
</script>

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

<Navbar />
<div class="nav-back"></div>

<main>
    <slot></slot>
</main>