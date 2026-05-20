export type KernelEventMap = {
  // filesystem
  'fs:write':  { path: string }
  'fs:delete': { path: string }
  // process
  'proc:spawn': { pid: number; name: string }
  'proc:kill':  { pid: number; name: string }
  // window
  'win:open':     { windowId: string; pid: number }
  'win:close':    { windowId: string; pid: number }
  'win:focus':    { windowId: string }
  'win:minimize': { windowId: string }
  // sound daemon
  'soundd:mute':   Record<string, never>
  'soundd:unmute': Record<string, never>
  // theme / wallpaper (replaces window.dispatchEvent calls)
  'theme:change':    { theme: string }
  'wallpaper:change': { wallpaper: string }
  'dotfiles:change':  { show: boolean }
}

export type KernelEventName = keyof KernelEventMap

type Handler<T> = (payload: T) => void

const MAX_LOG = 64

class EventBus {
  private listeners = new Map<string, Set<Handler<unknown>>>()
  private log: Array<{ event: string; payload: unknown; ts: number }> = []

  emit<E extends KernelEventName>(event: E, payload: KernelEventMap[E]): void {
    this.log.push({ event, payload, ts: Date.now() })
    if (this.log.length > MAX_LOG) this.log.shift()

    const handlers = this.listeners.get(event)
    if (!handlers) return
    for (const h of handlers) h(payload)
  }

  on<E extends KernelEventName>(event: E, handler: Handler<KernelEventMap[E]>): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set())
    this.listeners.get(event)!.add(handler as Handler<unknown>)
    return () => this.off(event, handler)
  }

  off<E extends KernelEventName>(event: E, handler: Handler<KernelEventMap[E]>): void {
    this.listeners.get(event)?.delete(handler as Handler<unknown>)
  }

  // watch a path prefix — fires on fs:write and fs:delete beneath it
  watch(pathPrefix: string, handler: (event: 'write' | 'delete', path: string) => void): () => void {
    const onWrite  = ({ path }: { path: string }) => { if (path.startsWith(pathPrefix)) handler('write',  path) }
    const onDelete = ({ path }: { path: string }) => { if (path.startsWith(pathPrefix)) handler('delete', path) }
    const offWrite  = this.on('fs:write',  onWrite)
    const offDelete = this.on('fs:delete', onDelete)
    return () => { offWrite(); offDelete() }
  }

  // recent event log as a string — for /dev/events
  recentLog(): string {
    return this.log
      .map(e => `${e.ts} ${e.event} ${JSON.stringify(e.payload)}`)
      .join('\n')
  }
}

export const bus = new EventBus()
