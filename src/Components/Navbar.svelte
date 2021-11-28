<script>
	let show = false
	const toggleShow = () => show = !show
	const resetShow = () => show = false
	const elements = [
		{name: "Gallary", link: "/gallary"},
		{name: "Blog", link: "/blog"},
		{name: "About", link: "/about"}, 
	]
</script>

<nav>
	<div class="name-wrapper">
		<h2><a href="/">Chayapatr</a></h2>
	</div>
	<div class="menu-small-wrapper {show ? 'cross' : 'cross-close'}" on:click={toggleShow}>
		<span />
		<span />
		<span />
	</div> 
	<div class="menu-wrapper">
		{#each elements as element}
			<h3><a href="{element.link}" on:click={resetShow}>
				{element.name}
			</a></h3>
		{/each}
	</div>
	<div class="show {show ? '' : 'close'}">
		{#each elements as element}
			<h3><a href="{element.link}" on:click={resetShow}>
				{element.name}
			</a></h3>
		{/each}
	</div>
</nav>

<style>
	nav {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		padding: 10px 0;
		position: fixed;
		z-index: 999;
		width: 100%;
		background-color: #fff;
	}
	a {
		text-decoration: none;
		color: #000;
	}
	a:hover {
		color: #444;
		transition: 0.15s;
	}
	h2 { 
		font-size: 24px;
		line-height: 24px;
		letter-spacing: 0;
		margin: 0;
	}
	.name-wrapper {
		margin-left: 15px;
	}
	.menu-wrapper {
		display: flex;
		margin-right: 12px;
		column-gap: 15px;
	}
	.menu-small-wrapper {
		display: none;
	}
	.menu-small-wrapper span {
		display: block;
		width: 28px;
		height: 3px;
		margin-bottom: 6px;
		position: relative;

		background: #000;
		border-radius: 3px;

		z-index: 1;
	}
	.menu-small-wrapper span:nth-last-child(1) {
		margin-bottom: 0px;
	}
	.show {
		display: none;
	}

	@media screen and (max-width: 768px) {
		nav {
			padding: 0;
			min-height: 45px;
		}
		.menu-wrapper {
			display: none;
		}
		.menu-small-wrapper {
			display: block;
			margin: 12px;
			height: 21px;
		}
		.cross span:nth-child(1) {
			transform: rotate(-45deg);
			top: 11px;
			margin: 0;
			transition: 0.2s;
		}
		.cross span:nth-child(2) {
			display: none;
			transition: 0.2s;
		}
		.cross span:nth-child(3) {
			transform: rotate(45deg);
			top: 8px;
			margin: 0;
			transition: 0.2s;
		}
		.show {
			display: flex; 
			flex-direction: column;
			padding-left: 15px;
			padding-top: 20px;
			height: 100vh;
			width: 100%;
			overflow: hidden;
			font-size: 60px;
			animation: nav 0.2s;
		}
		.close {
			animation: close 0.2s;
			height: 0;
			padding-top: 0px;
		}
		@keyframes nav {
			from {
				height: 0;
				padding-top: 0;
			}
			to {
				height: 100vh;
				padding-top: 20px;
			}
		}
		@keyframes close {
			from {
				height: 100vh;
				padding-top: 20px;
			}
			to {
				height: 0;
				padding-top: 0;
			}
		}
	}
</style>
