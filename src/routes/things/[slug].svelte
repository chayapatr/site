<script context="module">
  /** @type {import('./[slug]').Load} */
  export async function load({ params, fetch, session, stuff }) {
    const res = await fetch(`/things/${params.slug}.md`);

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

<script lang="ts">
	import { micromark } from 'micromark';
	export let body: string;

  const sectionReplacer = (match) => {
		return `<section class='pub-large-section'>${match}</section>`;
	};

  const imageReplacer = (match, src, alt) => {
    const className = `"w-full aspect-video object-cover border-2 border-neutral-900"`
    return `<div class="w-full md:w-5/6 lg:w-3/4"><img src=${src} alt=${alt} class=${className} /><h6>${alt}</h6></div>`;
  }

  const headerReplacer = (match, title) => {
    return `<section class='pub-large-section'><h2>${title}</h2></section>`
  }

  const styleParser = (body) => {
    body = body
      .replace(/<h2>(.*)<\/h2>/g, headerReplacer)
      .replace(/<img src="(.*)" alt="(.*)" \/>/g, imageReplacer)
      .replace(/<p>[^<]*<\/p>/g, sectionReplacer)
    return body
  }

  
	body = micromark(body);
  console.log(body)
  body = styleParser(body);
  console.log(body)
</script>

<div class="wrapper">
	{@html body}
</div>