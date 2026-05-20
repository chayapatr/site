import type { KernelState, StatResult, FSManifestNode } from './types'
import { findNode } from './manifest'

const LS_PREFIX = 'tidbitOS:fs:'

function lsKey(path: string) {
  return LS_PREFIX + path
}

function computedList(path: string, state: KernelState): string[] | null {
  if (path === '/proc') {
    return Array.from(state.processes.keys()).map(String)
  }
  const procMatch = path.match(/^\/proc\/(\d+)$/)
  if (procMatch) return ['status', 'name', 'ctl']
  if (path === '/dev') return ['screen', 'cons']
  if (path === '/sys') return ['version', 'uptime', 'hostname']
  return null
}

function computedRead(path: string, state: KernelState): string | null {
  const procMatch = path.match(/^\/proc\/(\d+)\/(status|name)$/)
  if (procMatch) {
    const pid = parseInt(procMatch[1])
    const field = procMatch[2]
    const proc = state.processes.get(pid)
    if (!proc) throw new Error(`no such process: ${pid}`)
    return field === 'status' ? proc.status : proc.name
  }
  if (path === '/dev/screen') {
    return Array.from(state.windows.values())
      .map(w => `${w.id} ${w.appType} ${w.title}`)
      .join('\n')
  }
  if (path === '/sys/version') return 'tidbitOS 0.1.0'
  if (path === '/sys/hostname') return state.env['HOSTNAME'] ?? 'tidbitOS'
  if (path === '/sys/uptime') {
    const secs = Math.floor((Date.now() - state.startedAt) / 1000)
    return String(secs)
  }
  return null
}

function isComputed(path: string): boolean {
  return path.startsWith('/proc') || path.startsWith('/dev') || path.startsWith('/sys')
}

export async function vfsRead(
  path: string,
  state: KernelState,
  manifest: FSManifestNode
): Promise<string> {
  if (isComputed(path)) {
    const val = computedRead(path, state)
    if (val === null) throw new Error(`${path}: not readable`)
    return val
  }

  if (path.startsWith('/home/')) {
    const val = localStorage.getItem(lsKey(path))
    if (val === null) throw new Error(`${path}: no such file`)
    return val
  }

  const node = findNode(manifest, path)
  if (!node || node.type !== 'file') throw new Error(`${path}: no such file`)
  const res = await fetch(path)
  if (!res.ok) throw new Error(`${path}: fetch failed`)
  return res.text()
}

export function vfsRemove(path: string): void {
  if (!path.startsWith('/home/')) throw new Error(`${path}: read-only filesystem`)
  const key = lsKey(path)
  // remove the file itself
  localStorage.removeItem(key)
  // remove any children (directory)
  const prefix = key + '/'
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const k = localStorage.key(i)
    if (k?.startsWith(prefix)) localStorage.removeItem(k)
  }
}

export function vfsWrite(path: string, content: string, state: KernelState): void {
  if (!path.startsWith('/home/') && !path.match(/^\/proc\/\d+\/ctl$/)) {
    throw new Error(`${path}: read-only filesystem`)
  }
  const ctlMatch = path.match(/^\/proc\/(\d+)\/ctl$/)
  if (ctlMatch) {
    const pid = parseInt(ctlMatch[1])
    const signal = content.trim()
    if (signal === 'kill') {
      const proc = state.processes.get(pid)
      if (!proc) throw new Error(`no such process: ${pid}`)
      state.processes.delete(pid)
      return
    }
    if (signal === 'stop') {
      const proc = state.processes.get(pid)
      if (proc) proc.status = 'stopped'
      return
    }
    if (signal === 'resume') {
      const proc = state.processes.get(pid)
      if (proc) proc.status = 'running'
      return
    }
    throw new Error(`unknown signal: ${signal}`)
  }

  localStorage.setItem(lsKey(path), content)
}

export async function vfsList(
  path: string,
  state: KernelState,
  manifest: FSManifestNode
): Promise<string[]> {
  if (path === '/') {
    const staticChildren = (manifest.children ?? []).map(c => c.name)
    const computed = ['proc', 'dev', 'sys', 'home']
    const combined = new Set([...staticChildren, ...computed])
    return Array.from(combined)
  }

  if (isComputed(path)) {
    const val = computedList(path, state)
    if (val === null) throw new Error(`${path}: not a directory`)
    return val
  }

  if (path === '/home' || path.startsWith('/home/')) {
    return listHome(path)
  }

  const node = findNode(manifest, path)
  if (!node) throw new Error(`${path}: no such file or directory`)
  if (node.type !== 'dir') throw new Error(`${path}: not a directory`)
  return (node.children ?? []).map(c => c.name)
}

export async function vfsStat(
  path: string,
  state: KernelState,
  manifest: FSManifestNode
): Promise<StatResult> {
  if (path === '/') return { type: 'dir', size: 0, mtime: Date.now() }

  if (isComputed(path)) {
    return { type: 'dir', size: 0, mtime: Date.now() }
  }

  if (path === '/home' || path === '/home/user') return { type: 'dir', size: 0, mtime: Date.now() }

  if (path.startsWith('/home/')) {
    const val = localStorage.getItem(lsKey(path))
    if (val !== null) return { type: 'file', size: val.length, mtime: Date.now() }
    const prefix = lsKey(path) + '/'
    const keys = Object.keys(localStorage).filter(k => k.startsWith(prefix))
    if (keys.length > 0) return { type: 'dir', size: 0, mtime: Date.now() }
    throw new Error(`${path}: no such file or directory`)
  }

  const node = findNode(manifest, path)
  if (!node) throw new Error(`${path}: no such file or directory`)
  return { type: node.type, size: node.size ?? 0, mtime: node.mtime ?? 0 }
}

export async function vfsExists(
  path: string,
  state: KernelState,
  manifest: FSManifestNode
): Promise<boolean> {
  try {
    await vfsStat(path, state, manifest)
    return true
  } catch {
    return false
  }
}

function listHome(path: string): string[] {
  const names = new Set<string>()
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)!
    if (!key.startsWith(LS_PREFIX)) continue
    const fsPath = key.slice(LS_PREFIX.length)
    const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path
    if (!fsPath.startsWith(normalizedPath + '/')) continue
    const rest = fsPath.slice(normalizedPath.length + 1)
    const name = rest.split('/')[0]
    if (name) names.add(name)
  }
  return Array.from(names)
}
