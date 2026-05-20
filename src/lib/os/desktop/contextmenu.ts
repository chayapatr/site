import { writable } from 'svelte/store'
import type { MenuItem } from './ContextMenu.svelte'

export const contextMenu = writable<{ x: number; y: number; items: MenuItem[] } | null>(null)

export function showContextMenu(x: number, y: number, items: MenuItem[]) {
  contextMenu.set({ x, y, items })
}

export function hideContextMenu() {
  contextMenu.set(null)
}
