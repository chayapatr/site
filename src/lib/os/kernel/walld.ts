import { bus } from './events'

const WALLD_PATH_PREFIX = '/usr/share/wallpaper/'

type ReadFn = (path: string) => Promise<string>

type SetupFn = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, bus: typeof import('./events').bus) => void
type EventFn = (payload: unknown, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => void

class WallpaperDaemon {
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private _read: ReadFn | null = null
  private animFrame: number | null = null
  private eventHandlers = new Map<string, EventFn>()
  private offWatchers: Array<() => void> = []
  current: string | null = null

  setReader(read: ReadFn) {
    this._read = read
  }

  mount(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.resize()
  }

  resize() {
    if (!this.canvas) return
    const dpr = window.devicePixelRatio || 1
    this.canvas.width = window.innerWidth * dpr
    this.canvas.height = window.innerHeight * dpr
    this.canvas.style.width = window.innerWidth + 'px'
    this.canvas.style.height = window.innerHeight + 'px'
    if (this.ctx) this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  async load(name: string) {
    if (!this._read || !this.canvas || !this.ctx) return
    this.teardown()
    this.current = name

    // static image — clear canvas and let CSS handle it
    if (!name.endsWith('.js')) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      return
    }

    try {
      const src = await this._read(WALLD_PATH_PREFIX + name)
      this.runTheme(src)

      // hot-reload when file changes
      const off = bus.watch(WALLD_PATH_PREFIX + name, async (_event) => {
        if (this.current !== name) return
        const updated = await this._read!(WALLD_PATH_PREFIX + name)
        this.teardown()
        this.current = name
        this.runTheme(updated)
      })
      this.offWatchers.push(off)
    } catch (e) {
      console.warn('walld: failed to load theme', e)
    }
  }

  private runTheme(src: string) {
    if (!this.canvas || !this.ctx) return
    const canvas = this.canvas
    const ctx = this.ctx
    const handlers = this.eventHandlers

    const setup = (fn: SetupFn) => {
      fn(canvas, ctx, bus)
    }

    const on = (event: string, fn: EventFn) => {
      handlers.set(event, fn)
    }

    const frame = (fn: (t: number) => void) => {
      let start: number | null = null
      const tick = (t: number) => {
        if (!start) start = t
        fn(t - start)
        this.animFrame = requestAnimationFrame(tick)
      }
      this.animFrame = requestAnimationFrame(tick)
    }

    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function('setup', 'on', 'frame', 'canvas', 'ctx', src)
      fn(setup, on, frame, canvas, ctx)
    } catch (e) {
      console.warn('walld: theme error', e)
    }

    // wire event handlers to bus
    for (const [event, handler] of handlers) {
      const off = bus.on(event as never, (payload) => {
        try { handler(payload, canvas, ctx) } catch {}
      })
      this.offWatchers.push(off)
    }
  }

  private teardown() {
    if (this.animFrame !== null) {
      cancelAnimationFrame(this.animFrame)
      this.animFrame = null
    }
    for (const off of this.offWatchers) off()
    this.offWatchers = []
    this.eventHandlers.clear()
    if (this.canvas && this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }
  }

  unload() {
    this.teardown()
    this.current = null
  }
}

export const walld = new WallpaperDaemon()
