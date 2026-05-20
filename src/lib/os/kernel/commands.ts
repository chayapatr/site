import type { Kernel } from './types'
import { runScript } from './runtime'

interface ParsedCommand {
  cmd: string
  args: string[]
  redirectOut: string | null
}

export function parseInput(input: string): ParsedCommand {
  const parts = input.trim().split(/\s+/)
  const redirectIdx = parts.indexOf('>')
  if (redirectIdx !== -1) {
    const redirectOut = parts[redirectIdx + 1] ?? null
    const before = parts.slice(0, redirectIdx)
    return { cmd: before[0], args: before.slice(1), redirectOut }
  }
  return { cmd: parts[0], args: parts.slice(1), redirectOut: null }
}

export async function executeCommand(
  input: string,
  kernel: Kernel,
  stdout: (line: string) => void,
  pid: number = 0
): Promise<void> {
  const { cmd, args, redirectOut } = parseInput(input)

  if (!cmd) return

  // shell builtins — handled before file lookup
  if (cmd === 'export') {
    if (!args[0]) {
      Object.entries(kernel.env).forEach(([k, v]) => stdout(`export ${k}=${v}`))
    } else {
      const eq = args[0].indexOf('=')
      if (eq === -1) stdout('export: usage: export KEY=value')
      else kernel.setEnv(args[0].slice(0, eq), args[0].slice(eq + 1))
    }
    return
  }

  let output = ''
  const capture = (line: string) => { output += line + '\n' }
  const emit = redirectOut ? capture : stdout

  const paths = [
    `/home/user/bin/${cmd}`,
    `/home/user/bin/${cmd}.js`,
    `/home/user/bin/${cmd}.sh`,
    `/bin/${cmd}`,
    `/bin/${cmd}.js`,
    `/bin/${cmd}.sh`,
  ]

  let src: string | null = null
  let foundPath: string | null = null
  for (const p of paths) {
    if (await kernel.exists(p)) {
      src = await kernel.read(p)
      foundPath = p
      break
    }
  }

  if (src === null) {
    stdout(`${cmd}: command not found`)
    return
  }

  if (foundPath?.endsWith('.sh') || src.startsWith('#!/bin/sh') || src.startsWith('#!/bin/bash')) {
    await runShell(src, kernel, emit, args, pid, stdout)
  } else {
    await runScript(src, kernel, emit, args, pid)
  }

  if (redirectOut) {
    kernel.write(redirectOut, output.trimEnd())
  }
}

async function runShell(
  src: string,
  kernel: Kernel,
  stdout: (line: string) => void,
  _args: string[],
  pid: number,
  rawStdout: (line: string) => void
): Promise<void> {
  const lines = src.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    await executeCommand(trimmed, kernel, stdout, pid)
  }
}
