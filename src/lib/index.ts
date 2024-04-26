import { micromark } from 'micromark';

type BlockType = "page" | "log" | "graph"
export const getContent = async (slug: string, parent: number) => {
    const text = await fetch(slug).then((res) => res.text());

    const slugReplacer = (_: string, slug: string) => {
        return `<a onclick={getBlock('${slug}',${parent})} href="?${slug}"`;
    };

    const styleParser = (text: string) => {
        return text.replace(/<a href="\/([A-Za-z1-9\s-]*)(?:\.md)?"/g, slugReplacer)
    };

    return styleParser(micromark(text));
};

export const generateBlock = async (name: string, type: BlockType, parentIndex: number, parent, index: number) => {
    let title: string = ""
    let text: string = ""

    if(type === "page") {
        title = `${name}.md`
        text = await getContent(`/${name}.md`, index)
    }
    else if (type === "log") {
        title = "log"
    }

    console.log(index, parentIndex)

    return {
        id: index,
        title,
        type,
        x: parentIndex === -1 ? 10 : parent.x + 50,
        y: parentIndex === -1 ? 10 : parent.y + 50,
        width: 320,
        height: 250,
        text,
        parentIndex
    }
}