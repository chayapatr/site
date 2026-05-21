<script lang="ts">
	import { onMount } from 'svelte';
	import { view } from '$lib/store.svelte';
	import NavBar from '$lib/NavBar.svelte';
	import MainView from '$lib/MainView.svelte';
	import Desktop from '$lib/os/desktop/Desktop.svelte';
	import { fade } from 'svelte/transition';

	let { data } = $props();

	let bostonTime = $state('');
	let fontsReady = $state(false);

	$effect(() => {
		if (view.showOS) {
			document.body.classList.add('os-active')
		} else {
			document.body.classList.remove('os-active')
		}
	})

	onMount(async () => {
		await document.fonts.ready;
		fontsReady = true;

		// iOS Safari: lock scroll position when keyboard appears inside OS
		const lockScroll = () => { if (view.showOS) window.scrollTo(0, 0) }
		window.visualViewport?.addEventListener('resize', lockScroll)
		window.visualViewport?.addEventListener('scroll', lockScroll)
		return () => {
			window.visualViewport?.removeEventListener('resize', lockScroll)
			window.visualViewport?.removeEventListener('scroll', lockScroll)
		}

		const update = () => {
			bostonTime = new Date()
				.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit', hour12: true })
				.toLowerCase();
		};
		update();
		const interval = setInterval(update, 1000);
		return () => clearInterval(interval);
	});
</script>

<svelte:head>
	<title>{view.showOS ? 'PubOS' : "Pub's Site"}</title>
</svelte:head>

{#if fontsReady}
<NavBar
	isMobile={view.isMobile}
	showGallery={view.showGallery}
	splitView={view.splitView}
	{bostonTime}
	onToggleGallery={() => (view.showGallery = !view.showGallery)}
	onToggleSplit={() => (view.splitView = !view.splitView)}
/>

<MainView {data} />
{/if}

{#if view.showOS}
	<div class="fixed inset-0 z-40" style="height: 100svh;" transition:fade={{ duration: 300 }}>
		<Desktop />
	</div>
{/if}
