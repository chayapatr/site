import { writable, derived } from 'svelte/store';

type BlockType = "page" | "log" | "graph" | "current"

export const Frame = writable({
	cur: -1,
	x: 0,
	y: 0,
	scale: 1,
	drag: false,
	resize: false,
    dark: true,
    currentIndex: -1,
    height: 0,
    width: 0
});

export const Blocks = writable<({
    id: number
    title: string
    type?: BlockType
    x: number
    y: number
    width: number
    height: number
    text?: string
    parentIndex: number
})[]>
([]);

export const Path = writable<{
    nodes: { id: string, open?: boolean }[],
    links: { source: string, target: string}[]
}>({
    nodes: [],
    links: []
});

export const Log = writable<string[]>([]);


export const OpenBlocks = derived([Blocks, Path], ([$Blocks, $Path]) => {
    return new Set([...$Path.nodes.filter((x) => $Blocks.find((b) => b.title === `${x.id}.md`)).map((x) => x.id)])
})

export const ActiveBlocks = derived([Blocks, Log], ([$Blocks, $Log]) => {
    return [...$Blocks.map((block) => {
        if(block.type === "log") {
            block.text = $Log.map((l) => {
                const [date, slug] = l.split("~");
                return `<div>${date} | <a href="" onclick={getBlock("${slug.split(".")[0]}",${block.id})}> ${slug}</a></div>`}).join("")
        }
        if(block.type === "current") {
            block.text = $Blocks.map(x => `<div>[${x.id}] <a href="" onclick={jump(${x.x},${x.y},${x.width},${x.height})}> ${x.title}</a></div>`).join("")
        }
        return block
    })]
})