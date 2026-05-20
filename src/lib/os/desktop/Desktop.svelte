<script lang="ts">
  import { kernel } from '$lib/os/kernel/store'
  import Window from './Window.svelte'
  import Terminal from '$lib/os/apps/Terminal.svelte'
  import Finder from '$lib/os/apps/Finder.svelte'
  import Browser from '$lib/os/apps/Browser.svelte'
  import Notepad from '$lib/os/apps/Notepad.svelte'
  import Settings from '$lib/os/apps/Settings.svelte'
  import Monitor from '$lib/os/apps/Monitor.svelte'
  import WebApp from '$lib/os/apps/WebApp.svelte'
  import { onMount } from 'svelte'
  import type { AppType } from '$lib/os/kernel/types'
  import { isDragging } from './drag'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const appComponents: Partial<Record<AppType, any>> = {
    terminal: Terminal,
    finder: Finder,
    browser: Browser,
    notepad: Notepad,
    settings: Settings,
    monitor: Monitor,
    webapp: WebApp,
  }

  const CONFIG_PATH = '/home/user/.config/wallpaper'
  const THEME_PATH = '/home/user/.config/theme'

  let wallpaper = $state('')

  function applyTheme(t: string) {
    const root = document.documentElement
    if (t === 'light') {
      root.setAttribute('data-theme', 'light')
    } else if (t === 'system') {
      root.removeAttribute('data-theme')
    } else {
      root.setAttribute('data-theme', 'dark')
    }
  }

  function focusWindow(id: string) {
    kernel.update(s => {
      let maxZ = 0
      for (const w of s.windows.values()) maxZ = Math.max(maxZ, w.zIndex)
      for (const [wid, w] of s.windows) {
        w.focused = wid === id
        if (wid === id) w.zIndex = maxZ + 1
      }
      return s
    })
  }

  function closeWindow(id: string) {
    kernel.update(s => {
      const win = s.windows.get(id)
      if (win) {
        s.processes.delete(win.pid)
        s.windows.delete(id)
      }
      return s
    })
  }

  function minimizeWindow(id: string) {
    kernel.update(s => {
      const win = s.windows.get(id)
      if (win) win.minimized = true
      return s
    })
  }

  function moveWindow(id: string, x: number, y: number) {
    kernel.update(s => {
      const win = s.windows.get(id)
      if (win) { win.position.x = x; win.position.y = y }
      return s
    })
  }

  function resizeWindow(id: string, w: number, h: number) {
    kernel.update(s => {
      const win = s.windows.get(id)
      if (win) { win.size.width = w; win.size.height = h }
      return s
    })
  }

  type DesktopEntry = { label: string; icon: string } & ({ app: AppType } | { folder: string } | { webapp: string } | { file: string })
  let desktopEntries = $state<DesktopEntry[]>([])

  // reload desktop icons when filesystem changes
  $effect(() => {
    void $kernel.fsRev
    loadDesktop()
  })

  async function loadDesktop() {
    try {
      const names = await kernel.list('/home/user/Desktop')
      const entries: DesktopEntry[] = []
      for (const name of names) {
        if (name.startsWith('.')) continue
        const path = `/home/user/Desktop/${name}`
        if (name.endsWith('.desktop')) {
          try {
            const raw = await kernel.read(path)
            entries.push(JSON.parse(raw) as DesktopEntry)
          } catch { /* skip malformed */ }
        } else {
          const ext = name.split('.').pop() ?? ''
          const icon = ext === 'md' || ext === 'txt' ? '/usr/share/icons/notepad.svg' : '/usr/share/icons/notepad.svg'
          entries.push({ label: name, icon, file: path })
        }
      }
      desktopEntries = entries
    } catch { /* desktop folder not ready yet */ }
  }

  function openEntry(entry: DesktopEntry) {
    if ('app' in entry) {
      kernel.spawn(entry.app)
    } else if ('webapp' in entry) {
      kernel.spawnWebapp(entry.webapp, entry.label)
    } else if ('file' in entry) {
      const ext = entry.file.split('.').pop()
      if (ext === 'md' || ext === 'html') kernel.spawn('browser', [entry.file])
      else kernel.spawn('notepad', [entry.file])
    } else {
      kernel.spawn('finder', [entry.folder])
    }
  }

  onMount(async () => {
    await kernel.init()

    // load saved wallpaper
    try {
      wallpaper = (await kernel.read(CONFIG_PATH)).trim()
    } catch {
      wallpaper = ''
    }

    // load saved theme
    try { applyTheme((await kernel.read(THEME_PATH)).trim()) } catch { applyTheme('dark') }

    window.addEventListener('wallpaper-change', (e) => {
      wallpaper = (e as CustomEvent<string>).detail
    })
    window.addEventListener('theme-change', (e) => {
      applyTheme((e as CustomEvent<string>).detail)
    })

    await loadDesktop()
  })
</script>

<div
  class="fixed inset-0 overflow-hidden pt-8"
  style="background: {wallpaper ? `black url('/usr/share/wallpaper/${wallpaper}.webp') center/cover no-repeat` : 'black'};"
>
  <!-- Desktop icons -->
  <div class="absolute top-12 left-4 flex flex-col gap-1">
    {#each desktopEntries as entry (entry.label)}
      <button
        class="group flex flex-col items-center gap-1 px-2 py-1.5 text-center"
        onclick={() => openEntry(entry)}
      >
        <img src={entry.icon} alt={entry.label} class="h-10 w-10" />
        <span class="font-mono text-[10px] text-neutral-300 transition-colors group-hover:text-neutral-100">{entry.label}</span>
      </button>
    {/each}
  </div>

  {#each [...$kernel.windows.values()] as win (win.id)}
    {#if !win.minimized}
      {@const AppComponent = appComponents[win.appType]}
      {#if AppComponent}
        <Window
          {win}
          onFocus={() => focusWindow(win.id)}
          onClose={() => closeWindow(win.id)}
          onMinimize={() => minimizeWindow(win.id)}
          onMove={(x, y) => moveWindow(win.id, x, y)}
          onResize={(w, h) => resizeWindow(win.id, w, h)}
        >
          <AppComponent
            pid={win.pid}
            args={win.appState.path ? [win.appState.path as string, ...((win.appState.args as string[]) ?? [])] : ((win.appState.args as string[]) ?? [])}
          />
        </Window>
      {/if}
    {/if}
  {/each}

  {#if $isDragging}
    <div class="fixed inset-0 z-9999"></div>
  {/if}
</div>
