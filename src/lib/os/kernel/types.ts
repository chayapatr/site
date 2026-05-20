export type AppType = 'finder' | 'terminal' | 'settings' | 'monitor' | 'script' | 'app'

export interface Process {
  pid: number
  name: string
  app: AppType
  status: 'running' | 'stopped'
  windowId: string | null
  startedAt: number
}

export interface Window {
  id: string
  pid: number
  title: string
  appType: AppType
  appState: Record<string, unknown>
  position: { x: number; y: number }
  size: { width: number; height: number }
  zIndex: number
  focused: boolean
  minimized: boolean
}

export interface StatResult {
  type: 'file' | 'dir'
  size: number
  mtime: number
}

export interface FSManifestNode {
  type: 'file' | 'dir'
  name: string
  path: string
  size?: number
  mtime?: number
  children?: FSManifestNode[]
}

export interface KernelState {
  processes: Map<number, Process>
  windows: Map<string, Window>
  nextPid: number
  startedAt: number
  env: Record<string, string>
  fsRev: number
}

export interface Kernel {
  read(path: string): Promise<string>
  write(path: string, content: string): void
  remove(path: string): void
  list(path: string): Promise<string[]>
  stat(path: string): Promise<StatResult>
  exists(path: string): Promise<boolean>
  setEnv(key: string, value: string): void
  getState(): KernelState
  spawn(app: AppType, args?: string[]): number
  spawnWebapp(path: string, title?: string): Promise<number>
  kill(pid: number): void
  ps(): Process[]
  setTitle(pid: number, title: string): void
  env: Record<string, string>
}
