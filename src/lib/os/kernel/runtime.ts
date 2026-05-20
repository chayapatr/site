import type { Kernel } from './types'
import { createSyscall } from './syscall'

export async function runScript(
  src: string,
  kernel: Kernel,
  stdout: (line: string) => void,
  args: string[] = [],
  pid: number = 0
): Promise<void> {
  try {
    const sys = createSyscall(pid, kernel)
    // eslint-disable-next-line no-new-func
    const fn = new Function(
      'sys', 'print', 'args',
      'fetch', 'localStorage', 'sessionStorage', 'indexedDB', 'XMLHttpRequest',
      `return (async () => { ${src} })()`
    )
    await fn(sys, stdout, args, undefined, undefined, undefined, undefined, undefined)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('read-only filesystem')) {
      stdout(`__readonly__: ${msg}`)
    } else {
      stdout(`error: ${msg}`)
    }
  }
}
