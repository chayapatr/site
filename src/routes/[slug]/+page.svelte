<script>
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	const slug = page.params.slug;

	onMount(() => {
		window.location.href = `/?page=${slug}`;
	});
</script>
