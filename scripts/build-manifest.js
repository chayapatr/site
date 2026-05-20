// scripts/build-manifest.js
import { readdirSync, statSync, writeFileSync } from 'fs'
import { join, relative } from 'path'

const STATIC_DIR = './static'
const OUTPUT = './static/fs-manifest.json'

const EXCLUDE = ['fs-manifest.json']

function buildTree(dir, baseDir = STATIC_DIR) {
  const entries = readdirSync(dir)
  const children = []

  for (const entry of entries) {
    if (EXCLUDE.includes(entry)) continue
    const fullPath = join(dir, entry)
    const relPath = '/' + relative(baseDir, fullPath).replace(/\\/g, '/')
    const stat = statSync(fullPath)

    if (stat.isDirectory()) {
      children.push({
        type: 'dir',
        name: entry,
        path: relPath,
        children: buildTree(fullPath, baseDir)
      })
    } else {
      children.push({
        type: 'file',
        name: entry,
        path: relPath,
        size: stat.size,
        mtime: stat.mtimeMs
      })
    }
  }

  return children
}

const tree = {
  type: 'dir',
  name: '',
  path: '/',
  children: buildTree(STATIC_DIR)
}

writeFileSync(OUTPUT, JSON.stringify(tree, null, 2))
console.log('fs-manifest.json written')
