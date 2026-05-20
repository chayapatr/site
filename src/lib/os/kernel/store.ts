import { writable, get } from 'svelte/store'
import type { KernelState, Process, AppType, Kernel, FSManifestNode } from './types'
import { loadManifest } from './manifest'
import { vfsRead, vfsWrite, vfsRemove, vfsList, vfsStat, vfsExists } from './vfs'

const APP_META: Record<AppType, { title: string; icon: string }> = {
  finder:   { title: 'Finder',   icon: '/usr/share/icons/finder.svg' },
  terminal: { title: 'Terminal', icon: '/usr/share/icons/terminal.svg' },
  browser:  { title: 'Browser',  icon: '/usr/share/icons/browser.svg' },
  notepad:  { title: 'Notepad',  icon: '/usr/share/icons/notepad.svg' },
  settings: { title: 'Settings', icon: '/usr/share/icons/settings.svg' },
  monitor:  { title: 'Monitor',  icon: '/usr/share/icons/monitor.svg' },
  script:   { title: 'Script',   icon: '' },
  webapp:   { title: 'App',      icon: '/usr/share/icons/notepad.svg' },
}

function createKernel() {
  const initialState: KernelState = {
    processes: new Map(),
    windows: new Map(),
    nextPid: 1,
    startedAt: Date.now(),
    fsRev: 0,
    env: {
      USER: 'user',
      HOME: '/home/user',
      PATH: '/home/user/bin:/bin',
      CWD: '/home/user',
      HOSTNAME: 'tidbitOS'
    }
  }

  const { subscribe, update, set } = writable(initialState)

  let manifest: FSManifestNode | null = null

  let initialized = false

  async function copySkel(manifest: FSManifestNode) {
    // recursively collect all files under /etc/skel from the static manifest
    const files: { skelPath: string; destPath: string }[] = []
    function walk(node: FSManifestNode, skelBase: string, destBase: string) {
      if (node.type === 'file') {
        files.push({ skelPath: skelBase, destPath: destBase })
      } else if (node.type === 'dir' && node.children) {
        for (const child of node.children) {
          walk(child, `${skelBase}/${child.name}`, `${destBase}/${child.name}`)
        }
      }
    }
    // find /etc/skel node in manifest
    const etcNode = (manifest as FSManifestNode & { children?: FSManifestNode[] }).children
      ?.find((n: FSManifestNode) => n.name === 'etc')
    const skelNode = (etcNode as FSManifestNode & { children?: FSManifestNode[] })?.children
      ?.find((n: FSManifestNode) => n.name === 'skel')
    if (!skelNode) return
    walk(skelNode, '/etc/skel', '/home/user')

    for (const { skelPath, destPath } of files) {
      const key = 'tidbitOS:fs:' + destPath
      if (localStorage.getItem(key) !== null) continue
      try {
        const res = await fetch(skelPath)
        if (res.ok) localStorage.setItem(key, await res.text())
      } catch { /* skip */ }
    }
  }

  async function init() {
    if (initialized) return
    initialized = true
    manifest = await loadManifest()
    await copySkel(manifest)
    // load /etc/environment into env
    try {
      const res = await fetch('/etc/environment')
      if (res.ok) {
        const env: Record<string, string> = {}
        for (const line of (await res.text()).split('\n')) {
          const eq = line.indexOf('=')
          if (eq === -1 || line.startsWith('#')) continue
          env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim()
        }
        update(s => { Object.assign(s.env, env); s.env.CWD = env.HOME ?? s.env.CWD; return s })
      }
    } catch { /* use defaults */ }
    update(s => {
      s.processes.set(1, {
        pid: 1,
        name: 'init',
        app: 'script',
        status: 'running',
        windowId: null,
        startedAt: Date.now()
      })
      s.nextPid = 2
      return s
    })
  }

  function getManifest(): FSManifestNode {
    if (!manifest) throw new Error('kernel not initialized')
    return manifest
  }

  function getState(): KernelState {
    return get({ subscribe })
  }

  const kernel = {
    subscribe,
    update,
    init,

    get env(): Record<string, string> {
      return getState().env
    },

    getState(): KernelState {
      return getState()
    },

    setEnv(key: string, value: string): void {
      update(s => { s.env[key] = value; return s })
    },

    async read(path: string): Promise<string> {
      return vfsRead(path, getState(), getManifest())
    },

    write(path: string, content: string): void {
      const state = getState()
      vfsWrite(path, content, state)
      update(s => { s.fsRev++; return s })
    },

    remove(path: string): void {
      vfsRemove(path)
      update(s => { s.fsRev++; return s })
    },

    async list(path: string): Promise<string[]> {
      return vfsList(path, getState(), getManifest())
    },

    async stat(path: string) {
      return vfsStat(path, getState(), getManifest())
    },

    async exists(path: string): Promise<boolean> {
      return vfsExists(path, getState(), getManifest())
    },

    spawn(app: AppType, args: string[] = []): number {
      let pid = 0
      update(s => {
        pid = s.nextPid++
        const windowId = crypto.randomUUID()
        s.processes.set(pid, {
          pid,
          name: app,
          app,
          status: 'running',
          windowId,
          startedAt: Date.now()
        })
        const meta = APP_META[app]
        s.windows.set(windowId, {
          id: windowId,
          pid,
          title: meta.title,
          appType: app,
          appState: { args, icon: meta.icon },
          position: { x: 80 + Math.random() * 200, y: 60 + Math.random() * 100 },
          size: { width: 640, height: 440 },
          zIndex: Math.max(0, ...Array.from(s.windows.values()).map(w => w.zIndex)) + 1,
          focused: true,
          minimized: false
        })
        for (const [id, win] of s.windows) {
          if (id !== windowId) win.focused = false
        }
        return s
      })
      return pid
    },

    spawnWebapp(path: string, title?: string): Promise<number> {
      const name = title ?? path.split('/').pop() ?? 'App'
      let pid = 0
      update(s => {
        pid = s.nextPid++
        const windowId = crypto.randomUUID()
        s.processes.set(pid, { pid, name, app: 'webapp', status: 'running', windowId, startedAt: Date.now() })
        s.windows.set(windowId, {
          id: windowId, pid, title: name, appType: 'webapp',
          appState: { path, icon: '/usr/share/icons/notepad.svg' },
          position: { x: 80 + Math.random() * 200, y: 60 + Math.random() * 100 },
          size: { width: 640, height: 440 },
          zIndex: Math.max(0, ...Array.from(s.windows.values()).map(w => w.zIndex)) + 1,
          focused: true, minimized: false
        })
        for (const [id, win] of s.windows) if (id !== windowId) win.focused = false
        return s
      })
      return Promise.resolve(pid)
    },

    kill(pid: number): void {
      update(s => {
        const proc = s.processes.get(pid)
        if (proc?.windowId) s.windows.delete(proc.windowId)
        s.processes.delete(pid)
        return s
      })
    },

    ps(): Process[] {
      return Array.from(getState().processes.values())
    },

    setTitle(pid: number, title: string): void {
      update(s => {
        const proc = s.processes.get(pid)
        if (proc?.windowId) {
          const win = s.windows.get(proc.windowId)
          if (win) win.title = title
        }
        return s
      })
    }
  }

  return kernel
}

export const kernel = createKernel()
export type KernelStore = ReturnType<typeof createKernel>
