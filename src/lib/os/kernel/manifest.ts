import type { FSManifestNode } from './types'

let manifestCache: FSManifestNode | null = null

export async function loadManifest(): Promise<FSManifestNode> {
  if (manifestCache) return manifestCache
  const res = await fetch('/fs-manifest.json')
  if (!res.ok) throw new Error('failed to load fs-manifest.json')
  manifestCache = await res.json()
  return manifestCache!
}

export function findNode(manifest: FSManifestNode, path: string): FSManifestNode | null {
  if (path === '/') return manifest
  const parts = path.replace(/^\//, '').split('/').filter(Boolean)
  let node: FSManifestNode = manifest
  for (const part of parts) {
    if (node.type !== 'dir' || !node.children) return null
    const child = node.children.find(c => c.name === part)
    if (!child) return null
    node = child
  }
  return node
}
