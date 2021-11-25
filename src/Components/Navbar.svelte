<nav>
	<div class="name-wrapper">
		<h1>Chayapatr</h1>
	</div>
	<div class="menu-wrapper">
		<h3>Blog</h3>
		<h3>Gallary</h3>
		<h3>About</h3>
	</div>
	<div class="menu-small-wrapper">
		<span />
		<span />
		<span />
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
	h1 {
		font-size: 24px;
		letter-spacing: 0px;
		line-height: 24px;
	}
	.name-wrapper {
		margin-left: 12px;
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

	@media screen and (max-width: 768px) {
		nav {
			padding: 0;
		}
		h1 {
			font-size: 30px;
			margin: 15px 0;
		}
		.menu-wrapper {
			display: none;
		}
		.menu-small-wrapper {
			display: block;
			margin: 12px;
		}
	}
</style>
