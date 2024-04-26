import { writable, derived } from 'svelte/store';

type BlockType = "page" | "log" | "graph"

export const Frame = writable({
	cur: -1,
	x: 0,
	y: 0,
	scale: 1,
	drag: false,
	resize: false,
    dark: true
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

export const Log = writable<string[]>([]);

export const ActiveBlocks = derived([Blocks, Log], ([$Blocks, $Log]) => {
    return [...$Blocks.map((block, i) => {
        if(block.type === "log") {
            block.text = $Log.map ((l) => `<div>> <a href="" onclick={getBlock("${l.split(".")[0]}",${i})}> ${l}</a></div>`).join("")
            return block
        }
        else return block
    })]
})