<script>
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	const slug = page.params.slug;

	onMount(() => {
		window.location.href = `/?page=${slug}`;
	});
</script>

<h1 class="text-white">{slug}</h1>
