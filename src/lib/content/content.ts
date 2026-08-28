import { micromark } from 'micromark';
import { gfmTable, gfmTableHtml } from 'micromark-extension-gfm-table';
import { rehype } from 'rehype';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { visit } from 'unist-util-visit';
import type { Root, Element } from 'hast';

const BLOCK_TAGS = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'li']);

function rehypeLineNumbers() {
	return (tree: Root, file: { data: Record<string, unknown> }) => {
		let line = 1;
		visit(tree, 'element', (node: Element, index, parent) => {
			if (!parent || index === undefined) return;
			if (!BLOCK_TAGS.has(node.tagName)) return;
			if (parent.type === 'element' && (parent as Element).tagName === 'li') return;

			node.properties = node.properties ?? {};
			node.properties['data-line'] = String(line++);
		});
		file.data.lineCount = line - 1;
	};
}

export const getContent = async (slug: string): Promise<{ content: string; lineCount: number }> => {
	const res = await fetch(`https://garden.from.pub/${slug}.md`);
	const text = res.ok ? await res.text() : '';

	const html = micromark(text, {
		allowDangerousHtml: true,
		extensions: [gfmTable()],
		htmlExtensions: [gfmTableHtml()]
	});

	const processed = await rehype()
		.data('settings', { fragment: true })
		.use(rehypeSlug)
		.use(rehypeAutolinkHeadings)
		.use(rehypeLineNumbers)
		.process(html);

	const lineCount = (processed.data.lineCount as number) ?? 0;

	const content = String(processed)
		.replace(
			/<a href="((?:https?):\/\/[^"]*)"/g,
			(_: string, url: string) =>
				`<a href="${url}" target="_blank" class="external-link" data-href="${url}"`
		)
		.replace(
			/<a href="\/?([A-Za-z0-9!@$%^&*_\s-]*)(?:\.md)?"/g,
			(_: string, slug: string) => `<a href="#" data-internal-slug="${slug}" data-href="/${slug}"`
		);

	return { content, lineCount };
};
