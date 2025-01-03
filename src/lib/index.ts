import { micromark } from 'micromark';
import { gfmTable, gfmTableHtml } from 'micromark-extension-gfm-table';
import { rehype } from 'rehype';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import { get } from 'svelte/store';
import { Frame } from './store';

export type BlockType = 'page' | 'log' | 'graph' | 'current' | 'setting';
export const getContent = async (slug: string, parent: number) => {
	const text = await fetch(`https://garden.from.pub/${slug}`).then((res) => {
		return res.text();
	});

	const internalLinks = (_: string, slug: string) => {
		return `<a onclick={getBlock('${slug}',${parent})} href="?page=${slug}" class="internal-link"`;
	};

	const externalLinks = (_: string, url: string) => {
		return `<a href="${url}" target="_blank" class="external-link"`;
	};

	const imgs = () => {
		return `<img class="img"`;
	};

	const iframes = () => {
		return `<iframe class="iframe"`;
	};

	const tags = (_: string, text: string) => {
		return `<p class="tag">#${text}</p>`;
	};

	const styleParser = async (text: string) => {
		const parsed = await rehype()
			.data('settings', { fragment: true })
			.use(rehypeSlug)
			.use(rehypeAutolinkHeadings)
			.process(text);
		return parsed.value
			.replace(/<a href="\/?([A-Za-z1-9\s-]*)(?:\.md)?"/g, internalLinks)
			.replace(/<a href="((?:http||https):\/\/.[^"]*)"/g, externalLinks)
			.replace(/<p>#([A-Za-z][^"]*)<\/p>/g, tags)
			.replace(/<img/g, imgs)
			.replace(/<iframe/g, iframes);
	};

	return await styleParser(
		micromark(text, {
			allowDangerousHtml: true,
			extensions: [gfmTable()],
			htmlExtensions: [gfmTableHtml()]
		})
	);
};

const maybeMobile = (width: number, height: number) => {
	return width < 600 && height < 1000;
};

const screenType = (width: number, height: number) => {
	if (maybeMobile(width, height)) return 'small';
	if (width < 1000) return 'medium';
	return 'large';
};

const scales = {
	small: 1,
	medium: 1.6,
	large: 1.8
};

export const generateBlock = async (
	name: string,
	type: BlockType,
	parentIndex: number,
	parent:
		| {
				id: number;
				title: string;
				type?: BlockType;
				x: number;
				y: number;
				width: number;
				height: number;
				text?: string | undefined;
				parentIndex: number;
		  }
		| undefined,
	index: number
) => {
	let title: string = '';
	let text: string = '';

	switch (type) {
		case 'page':
			title = `${name}.md`;
			text = await getContent(`${name}.md`, index);
			break;
		case 'log':
			title = 'log';
			break;
		case 'graph':
			title = 'graph';
			type = 'graph';
			break;
		case 'current':
			title = 'current';
			break;
		case 'setting':
			title = 'setting';
			break;
	}

	Frame.update((f) => {
		return {
			...f,
			z: f.z + 1
		};
	});
	const frame = get(Frame);

	const h = maybeMobile(frame.width, frame.height) ? Math.min(frame.height / 2, 400) : 250;
	const scale = scales[screenType(frame.width, frame.height)];

	return {
		id: index,
		title,
		type,
		x: parentIndex === -1 ? -frame.x + frame.width / 2 - 160 * scale : (parent?.x || 0) + 50,
		y:
			parentIndex === -1
				? -frame.y + frame.height / 2 - (h * scale) / 2 - 50
				: (parent?.y || 0) + 50,
		z: frame.z,
		width: 320 * scale,
		height: h * scale,
		text,
		parentIndex
	};
};
