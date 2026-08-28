import { getContent } from '$lib/content/content';

export const ssr = false;

export const load = async ({ url }) => {
	const slug = url.searchParams.get('page') || '!@$';
	const { content, lineCount } = await getContent(slug);
	return { slug, content, lineCount };
};
