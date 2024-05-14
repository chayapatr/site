import { micromark } from 'micromark';
import { get } from 'svelte/store';
import { Blocks, Frame } from './store';

type BlockType = "page" | "log" | "graph" | "current"
export const getContent = async (slug: string, parent: number) => {
    const text = await fetch(`https://garden.from.pub/${slug}`).then((res) => {
        return res.text()
    });

    const internalLinks = (_: string, slug: string) => {
        return `<a onclick={getBlock('${slug}',${parent})} href="?page=${slug}" class="internal-link"`;
    };
    
    const externalLinks = (_: string, url: string) => {
        return `<a href="${url}" target="_blank" class="external-link"`;
    }

    const styleParser = (text: string) => {
        return text
        .replace(/<a href="\/([A-Za-z1-9\s-]*)(?:\.md)?"/g, internalLinks)
        .replace(/<a href="((?:http||https):\/\/.[^"]*)"/g, externalLinks)
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

    const maybeMobile = (width: number, height: number) => {
        return (width < 600 && height < 1000)
    }

    const screenType = (width: number, height: number) => {
        if(maybeMobile(width, height)) return 'small'
        if(width < 1000) return 'medium'
        return 'large'
    }

    const h = maybeMobile(frame.width, frame.height) ? (Math.min(frame.height / 2, 400)) : 250

    const scales = {
        small: 1,
        medium: 1.2,
        large: 1.5
    }

    const scale = scales[screenType(frame.width, frame.height)]

    return {
        id: index,
        title,
        type,
        x: parentIndex === -1 ? -frame.x + frame.width / 2 - 160 * scale : parent.x + 50,
        y: parentIndex === -1 ? -frame.y + frame.height / 2 - (h * scale / 2 ) - 50: parent.y + 50,
        width: 320 * scale,
        height: h * scale,
        text,
        parentIndex
    }
}

export const locate = (blockId: number) => {
    const blocks = get(Blocks)
    return blocks.find((x) => x.id === blockId)
}
