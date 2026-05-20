<script lang="ts">
  import { kernel } from '$lib/os/kernel/store'
  import Window from './Window.svelte'
  import Terminal from '$lib/os/apps/Terminal.svelte'
  import Finder from '$lib/os/apps/Finder.svelte'
  import Settings from '$lib/os/apps/Settings.svelte'
  import Monitor from '$lib/os/apps/Monitor.svelte'
  import App from '$lib/os/apps/App.svelte'
  import ContextMenu from './ContextMenu.svelte'
  import { contextMenu, showContextMenu, hideContextMenu } from './contextmenu'
  import { onMount } from 'svelte'
  import type { AppType } from '$lib/os/kernel/types'
  import { isDragging } from './drag'

  function onDesktopContextMenu(e: MouseEvent) {
    e.preventDefault()
    showContextMenu(e.clientX, e.clientY, desktopMenuItems)
  }

  const desktopMenuItems = [
    {
      label: 'New File',
      action: async () => {
        const name = prompt('File name:', 'untitled.txt')
        if (!name) return
        kernel.write(`/home/user/Desktop/${name}`, '')
      }
    },
    {
      label: 'New Folder',
      action: async () => {
        const name = prompt('Folder name:', 'New Folder')
        if (!name) return
        kernel.write(`/home/user/Desktop/${name}/.keep`, '')
      }
    },
    { separator: true as const },
    {
      label: 'Open Terminal Here',
      action: () => kernel.spawn('terminal')
    },
    {
      label: 'Open Finder',
      action: () => kernel.spawn('finder', ['/home/user/Desktop'])
    },
  ]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const appComponents: Partial<Record<AppType, any>> = {
    terminal: Terminal,
    finder: Finder,
    settings: Settings,
    monitor: Monitor,
    app: App,
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
    const win = $kernel.windows.get(id)
    if (win) kernel.kill(win.pid)
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

  type DesktopEntry = { label: string; icon: string } & ({ app: AppType } | { folder: string } | { launch: string } | { webapp: string } | { file: string })
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
          const icon = '/usr/share/icons/file.svg'
          entries.push({ label: name, icon, file: path })
        }
      }
      desktopEntries = entries
    } catch { /* desktop folder not ready yet */ }
  }

  import type { MenuItem } from './ContextMenu.svelte'

  function onIconContextMenu(e: MouseEvent, entry: DesktopEntry) {
    e.preventDefault()
    e.stopPropagation()
    const items: MenuItem[] = []
    items.push({ label: 'Open', action: () => openEntry(entry) })

    if ('file' in entry) {
      const ext = entry.file.split('.').pop() ?? ''
      const openWith: MenuItem[] = []
      if (['html','htm'].includes(ext)) {
        openWith.push({ label: 'Browser', action: () => kernel.spawnApp('/usr/share/applications/browser', entry.file) })
        openWith.push({ label: 'Editor', action: () => kernel.spawnApp('/usr/share/applications/editor', entry.file) })
      } else if (['png','jpg','jpeg','gif','webp','svg','bmp'].includes(ext)) {
        openWith.push({ label: 'Preview', action: () => kernel.spawnApp('/usr/share/applications/preview', entry.file) })
        openWith.push({ label: 'Editor', action: () => kernel.spawnApp('/usr/share/applications/editor', entry.file) })
      } else if (['md','js','ts','css','json','txt'].includes(ext)) {
        openWith.push({ label: 'Editor', action: () => kernel.spawnApp('/usr/share/applications/editor', entry.file) })
        openWith.push({ label: 'Browser', action: () => kernel.spawnApp('/usr/share/applications/browser', 'file://' + entry.file) })
      }
      if (openWith.length > 1) items.push({ label: 'Open With', children: openWith })
      items.push({ separator: true })
      items.push({ label: 'Delete', danger: true, action: () => kernel.remove(entry.file) })
    } else if ('launch' in entry || 'webapp' in entry || 'app' in entry) {
      const path = 'launch' in entry ? entry.launch : 'webapp' in entry ? entry.webapp : null
      if (path) items.push({ label: 'Show in Finder', action: () => kernel.spawn('finder', [path.split('/').slice(0, -1).join('/') || '/']) })
    }

    showContextMenu(e.clientX, e.clientY, items)
  }

  function openEntry(entry: DesktopEntry) {
    if ('app' in entry) {
      kernel.spawn(entry.app)
    } else if ('launch' in entry) {
      kernel.spawnApp(entry.launch)
    } else if ('webapp' in entry) {
      kernel.spawnApp(entry.webapp)
    } else if ('file' in entry) {
      const ext = entry.file.split('.').pop()
      if (ext && ['png','jpg','jpeg','gif','webp','svg','bmp'].includes(ext)) {
        kernel.spawnApp('/usr/share/applications/preview', entry.file)
      } else if (ext === 'md' || ext === 'html' || ext === 'js' || ext === 'ts' || ext === 'css' || ext === 'json') {
        kernel.spawnApp('/usr/share/applications/editor', entry.file)
      } else {
        kernel.spawnApp('/usr/share/applications/editor', entry.file)
      }
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
  class="fixed inset-0 pt-8"
  style="background: {wallpaper ? `black url('/usr/share/wallpaper/${wallpaper}.webp') center/cover no-repeat` : 'black'};"
  oncontextmenu={onDesktopContextMenu}
  role="none"
>
  <!-- Desktop icons -->
  <div class="absolute top-12 left-4 flex flex-col gap-1">
    {#each desktopEntries as entry (entry.label)}
      <button
        class="group flex flex-col items-center gap-1 px-2 py-1.5 text-center"
        onclick={() => openEntry(entry)}
        oncontextmenu={(e) => onIconContextMenu(e, entry)}
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

  {#if $contextMenu}
    <ContextMenu
      x={$contextMenu.x}
      y={$contextMenu.y}
      items={$contextMenu.items}
      onclose={hideContextMenu}
    />
  {/if}
</div>
