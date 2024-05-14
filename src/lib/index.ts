import { micromark } from 'micromark';
import { get } from 'svelte/store';
import { Blocks, Frame } from './store';

type BlockType = "page" | "log" | "graph" | "current"
export const getContent = async (slug: string, parent: number) => {
    const text = await fetch(`https://garden.from.pub/${slug}`).then((res) => {
        return res.text()
    });

    const slugReplacer = (_: string, slug: string) => {
        return `<a onclick={getBlock('${slug}',${parent})} href="?page=${slug}"`;
    };

    const styleParser = (text: string) => {
        return text.replace(/<a href="\/([A-Za-z1-9\s-]*)(?:\.md)?"/g, slugReplacer)
    };

    return styleParser(micromark(text));
};

export const generateBlock = async (name: string, type: BlockType, parentIndex: number, parent, index: number) => {
    let title: string = ""
    let text: string = ""

    switch(type) {
        case "page":
            title = `${name}.md`;
            text = await getContent(`${name}.md`, index); break;
        case "log":
            title = "log"; break;
        case "graph":
            title = "graph";
            type = "graph"; break;
        case "current":
            title = "current"; break;
    }

    const frame = get(Frame)

    return {
        id: index,
        title,
        type,
        x: parentIndex === -1 ? -frame.x + 10 : parent.x + 50,
        y: parentIndex === -1 ? -frame.y + 10 : parent.y + 50,
        width: 320,
        height: 250,
        text,
        parentIndex
    }
}

export const locate = (blockId: number) => {
    const blocks = get(Blocks)
    return blocks.find((x) => x.id === blockId)
}
