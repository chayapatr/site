import { getContent } from '$lib/content';

export const ssr = false;

export const load = async () => {
	const { content, lineCount } = await getContent('!@$');
	return { content, lineCount };
};
