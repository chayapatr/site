import { getContent } from '$lib/content';

export const load = async () => {
	const { content, lineCount } = await getContent('!@$');
	return { content, lineCount };
};
