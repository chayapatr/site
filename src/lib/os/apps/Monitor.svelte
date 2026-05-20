<script lang="ts">
  import { kernel } from '$lib/os/kernel/store'
  import { bus, type KernelEventName, type KernelEventMap } from '$lib/os/kernel/events'
  import { onMount, onDestroy } from 'svelte'

  let { pid }: { pid: number } = $props()

  let tick = $state(0)
  let interval: ReturnType<typeof setInterval>

  type LogEntry = { ts: number; event: string; summary: string }
  let eventLog = $state<LogEntry[]>([])
  let logEl = $state<HTMLElement | null>(null)

  function formatPayload(event: string, payload: unknown): string {
    const p = payload as Record<string, unknown>
    if (event === 'fs:write' || event === 'fs:delete') return p.path as string
    if (event === 'proc:spawn' || event === 'proc:kill') return `pid ${p.pid} (${p.name})`
    if (event === 'win:open' || event === 'win:close') return `pid ${p.pid}`
    if (event === 'win:focus') return String(p.windowId).slice(0, 8)
    if (event === 'theme:change') return p.theme as string
    if (event === 'wallpaper:change') return p.wallpaper as string
    if (event === 'dotfiles:change') return p.show ? 'show' : 'hide'
    return ''
  }

  function subscribe() {
    const events: KernelEventName[] = [
      'fs:write', 'fs:delete',
      'proc:spawn', 'proc:kill',
      'win:open', 'win:close', 'win:focus', 'win:minimize',
      'soundd:mute', 'soundd:unmute',
      'theme:change', 'wallpaper:change', 'dotfiles:change',
    ]
    const offs = events.map(e =>
      bus.on(e, (payload) => {
        eventLog.push({ ts: Date.now(), event: e, summary: formatPayload(e, payload) })
        if (eventLog.length > 128) eventLog.shift()
        // auto-scroll
        setTimeout(() => { if (logEl) logEl.scrollTop = logEl.scrollHeight }, 0)
      })
    )
    return () => offs.forEach(off => off())
  }

  onMount(() => {
    interval = setInterval(() => tick++, 1000)
    return subscribe()
  })
  onDestroy(() => clearInterval(interval))

  let procs = $derived([...$kernel.processes.values()])
  let wins = $derived([...$kernel.windows.values()])
  let uptimeSec = $derived(tick >= 0 ? Math.floor((Date.now() - $kernel.startedAt) / 1000) : 0)
  let uptimeStr = $derived(`${Math.floor(uptimeSec / 60)}m ${uptimeSec % 60}s`)

  function killProc(p: number) { kernel.kill(p) }

  function focusWin(windowId: string | null) {
    if (!windowId) return
    kernel.update(s => {
      for (const [id, w] of s.windows) {
        w.focused = id === windowId
        if (id === windowId) {
          w.minimized = false
          let maxZ = 0
          for (const ww of s.windows.values()) maxZ = Math.max(maxZ, ww.zIndex)
          w.zIndex = maxZ + 1
        }
      }
      return s
    })
  }

  function fmtTime(ts: number): string {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  const EVENT_COLOR: Partial<Record<string, string>> = {
    'fs:write':       'text-blue-400',
    'fs:delete':      'text-red-400',
    'proc:spawn':     'text-green-400',
    'proc:kill':      'text-red-400',
    'win:open':       'text-green-400',
    'win:close':      'text-red-400',
    'soundd:mute':    'text-yellow-400',
    'soundd:unmute':  'text-yellow-400',
    'theme:change':   'text-purple-400',
  }
</script>

<div class="flex h-full flex-col font-mono text-xs">
  <!-- system bar -->
  <div class="flex shrink-0 items-center gap-4 border-b px-3 py-2" style="border-color: var(--os-border); color: var(--os-text-dim);">
    <span>up <span style="color: var(--os-text);">{uptimeStr}</span></span>
    <span>proc <span style="color: var(--os-text);">{procs.length}</span></span>
    <span>win <span style="color: var(--os-text);">{wins.length}</span></span>
    <span>pid <span style="color: var(--os-text);">{$kernel.nextPid - 1}</span></span>
  </div>

  <div class="flex flex-1 overflow-hidden">
    <!-- left: processes + windows -->
    <div class="flex w-48 shrink-0 flex-col border-r" style="border-color: var(--os-border);">
      <!-- processes -->
      <div class="shrink-0 border-b px-3 py-1.5" style="border-color: var(--os-border); color: var(--os-text-dim);">processes</div>
      <div class="flex-1 overflow-y-auto border-b" style="border-color: var(--os-border);">
        {#each procs as p (p.pid)}
          <div class="flex items-center justify-between border-b px-3 py-1.5" style="border-color: var(--os-border-subtle); color: {p.status === 'running' ? 'var(--os-text)' : 'var(--os-text-dim)'};">
            <div class="flex items-center gap-2 min-w-0">
              <span class="shrink-0" style="color: var(--os-text-dim);">{p.pid}</span>
              <span class="truncate">{p.name}</span>
            </div>
            {#if p.pid !== pid}
              <button class="shrink-0 transition-colors hover:text-red-400" style="color: var(--os-text-dim);" onclick={() => killProc(p.pid)}>[x]</button>
            {/if}
          </div>
        {/each}
      </div>

      <!-- windows -->
      <div class="shrink-0 border-b px-3 py-1.5" style="border-color: var(--os-border); color: var(--os-text-dim);">windows</div>
      <div class="flex-1 overflow-y-auto">
        {#each wins as w (w.id)}
          <button
            class="flex w-full items-center justify-between border-b px-3 py-1.5 text-left transition-colors"
            style="border-color: var(--os-border-subtle); color: {w.focused ? 'var(--os-text)' : 'var(--os-text-dim)'}; opacity: {w.minimized ? '0.4' : '1'};"
            onclick={() => focusWin(w.id)}
          >
            <span class="truncate">{w.title}</span>
            <span class="shrink-0 ml-2" style="color: var(--os-text-dim);">{w.size.width}×{w.size.height}</span>
          </button>
        {/each}
      </div>
    </div>

    <!-- right: event log -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <div class="shrink-0 border-b px-3 py-1.5" style="border-color: var(--os-border); color: var(--os-text-dim);">events</div>
      <div class="flex-1 overflow-y-auto" bind:this={logEl}>
        {#if eventLog.length === 0}
          <div class="px-3 py-2" style="color: var(--os-text-dim);">waiting...</div>
        {/if}
        {#each eventLog as entry (entry.ts + entry.event)}
          <div class="flex items-baseline gap-2 border-b px-3 py-1" style="border-color: var(--os-border-subtle);">
            <span class="shrink-0" style="color: var(--os-text-dim);">{fmtTime(entry.ts)}</span>
            <span class="shrink-0 {EVENT_COLOR[entry.event] ?? 'text-neutral-400'}">{entry.event}</span>
            <span class="truncate" style="color: var(--os-text-dim);">{entry.summary}</span>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
