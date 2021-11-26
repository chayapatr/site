<script context="module">
	export async function load({ page, fetch, session, stuff }) {
		const slug = page.params.slug;
		const res = await fetch(`/work/${slug}.md`);
		if (res.ok) {
			return {
				props: {
					body: await res.text()
				}
			};
		}
		return {
			status: res.status,
			error: new Error()
		};
	}
</script>

<script>
	import { micromark } from 'micromark';
	export let body;

	const replacer = (match, src, alt) => {
		const dir = `/assets/g`;
		return `<picture>
    <source media="(min-width: 769px)"
        srcset="${dir}/${src}.png" 
        type="image/png">
    <source media="(max-width: 768px)" 
        srcset="${dir}/${src}-800.webp"
        type="image/webp">
    <source media="(min-width: 375px)" 
        srcset="${dir}/${src}-400.webp"
        type="image/webp">
    <source media="(max-width: 768px)" 
        srcset="${dir}/${src}-800.png"
        type="image/png">
    <source media="(min-width: 375px)" 
        srcset="${dir}/${src}-400.png"
        type="image/png">
    <img 
        srcset="${dir}/${src}.png 1024w, ${dir}/${src}-400.png 375w, ${dir}/${src}-800.png 768w"
        sizes="(min-width: 769px) 1024px, (max-width: 768px) 768px, (max-width: 500px) 500px"
        src="${dir}/${src}.png" 
        alt="${alt}"
    />
</picture>`;
	};

	body = micromark(body);
	body = body.replace(/<img src="\/(.*)\.png\" alt="(.*)" \/>/g, replacer);
	// body = body.replace("/messe.png","/g/messe.png")
</script>

<div class="wrapper">
	{@html body}
</div>

<style>
	.wrapper {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;

		padding: 12px;
		column-gap: 10px;
		row-gap: 10px;
	}
	.wrapper :global(img) {
		width: 100%;
		object-fit: cover;
	}

	.wrapper :global(p) {
		font-size: 40px;
		line-height: 40px;
		letter-spacing: -1.5px;
	}
</style>
