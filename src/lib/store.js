import { writable } from 'svelte/store';

export const Frame = writable({
	cur: -1,
	x: 0,
	y: 0,
	scale: 1,
	drag: false,
	resize: false
});

export const Els = writable([]);

export const Log = writable(['Hello World!']);

// <{
//     title: string
//     x: number
//     y: number
//     width: number
//     height: number
//     text: string
// }[]>
