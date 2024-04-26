// place files you want to import through the `$lib` alias in this folder.
import { micromark } from 'micromark';
export const getContent = async (slug: string) => {
    const text = await fetch(slug).then((res) => res.text());

    const slugReplacer = (_: string, slug: string) => {
        return `<a onclick={getPage("${slug}")} href="?${slug}"`;
    };

    const styleParser = (text: string) => {
        return text.replace(/<a href="\/([A-Za-z1-9\s-]*)(?:\.md)?"/g, slugReplacer);
    };

    return styleParser(micromark(text));
};