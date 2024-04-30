import { writable, derived } from 'svelte/store';

type BlockType = "page" | "log" | "graph"

export const Frame = writable({
	cur: -1,
	x: 0,
	y: 0,
	scale: 1,
	drag: false,
	resize: false,
    dark: true,
    currentIndex: -1,
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

export const ActiveBlocks = derived([Blocks, Log], ([$Blocks, $Log]) => {
    return [...$Blocks.map((block) => {
        if(block.type === "log") {
            block.text = $Log.map ((l) => {
                return `<div>> <a href="" onclick={getBlock("${l.split(".")[0]}",${block.id})}> ${l}</a></div>`}).join("")
            return block
        }
        else return block
    })]
})

export const OpenBlocks = derived([Blocks, Path], ([$Blocks, $Path]) => {
    return new Set([...$Path.nodes.filter((x) => $Blocks.find((b) => b.title === `${x.id}.md`)).map((x) => x.id)])
})