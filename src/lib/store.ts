import { writable, derived } from 'svelte/store';

type BlockType = "page" | "log" | "graph"

export const Frame = writable({
	cur: -1,
	x: 0,
	y: 0,
	scale: 1,
	drag: false,
	resize: false
});

export const Blocks = writable<({
    title: string
    type?: BlockType
    x: number
    y: number
    width: number
    height: number
    text?: string
})[]>
([]);

export const Log = writable<string[]>([]);

export const ActiveBlocks = derived([Blocks, Log], ([$Blocks, $Log]) => {
    return [...$Blocks.map((block, i) => {
        if(block.type === "log") {
            block.text = $Log.map ((l) => `<div>> <a onclick={getBlock("${l.split(".")[0]}",${i})}> ${l}</a></div>`).join("")
            return block
        }
        else return block
    })]
})