import type { Kernel, AppType, Process, StatResult } from './types'

export interface Sys {
  read(path: string): Promise<string>
  write(path: string, content: string): void
  remove(path: string): void
  list(path: string): Promise<string[]>
  stat(path: string): Promise<StatResult>
  exists(path: string): Promise<boolean>
  spawn(app: AppType, args?: string[]): number
  kill(pid: number): void
  ps(): Process[]
  env(): Record<string, string>
  setenv(key: string, value: string): void
  setTitle(title: string): void
  exit(code?: number): void
  reload(): void
  resolve(path: string): string
}

function normalizePath(path: string): string {
  const parts: string[] = []
  for (const seg of path.split('/')) {
    if (seg === '' || seg === '.') continue
    if (seg === '..') parts.pop()
    else parts.push(seg)
  }
  return '/' + parts.join('/')
}

export function createSyscall(pid: number, kernel: Kernel): Sys {
  const resolve = (path: string) =>
    normalizePath(path.startsWith('/') ? path : (kernel.env['CWD'] ?? '/') + '/' + path)

  return {
    read:   (path) => kernel.read(resolve(path)),
    write:  (path, content) => kernel.write(resolve(path), content),
    remove: (path) => kernel.remove(resolve(path)),
    list:   (path) => kernel.list(resolve(path)),
    stat:   (path) => kernel.stat(resolve(path)),
    exists: (path) => kernel.exists(resolve(path)),
    spawn:  (app, args) => kernel.spawn(app, args),
    kill:   (p) => kernel.kill(p),
    ps:     () => kernel.ps(),
    env:    () => ({ ...kernel.env }),
    setenv: (key, value) => kernel.setEnv(key, value),
    setTitle: (title) => kernel.setTitle(pid, title),
    exit:   (_code) => kernel.kill(pid),
    reload: () => window.location.reload(),
    resolve,
  }
}
