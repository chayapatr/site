<script>
	const directory = [
		{
			name: 'me',
			link: '/'
		},
		{
			name: 'things',
			link: '/things'
		},
		{
			name: 'write',
			link: '/write'
		},
		{
			name: 'draw & snap',
			link: '/gallery'
		},
		{
			name: 'talk',
			link: '/talk'
		},
		{
			name: 'about',
			link: '/about'
		}
	];
</script>

<header>
	<ul class="flex px-2 py-1 z-50 fixed w-full bg-white border-b-2 border-neutral-900">
		{#each directory as route}
			<li class="px-1 md:px-2 first:pl-0 last:pr-0">
				<a href={route.link} class="hover:underline hover:text-neutral-900 text-md sm:text-lg">{route.name}</a>
			</li>
		{/each}
	</ul>
</header>
