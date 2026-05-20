const path = sys.resolve(args[0] ?? '.')
const entries = await sys.list(path)
const stats = await Promise.all(entries.map(async name => {
  const full = (path === '/' ? '' : path) + '/' + name
  const stat = await sys.stat(full).catch(() => null)
  return { name, isDir: stat?.type === 'dir' }
}))
const dirs = stats.filter(e => e.isDir).map(e => e.name + '/')
const files = stats.filter(e => !e.isDir).map(e => e.name)
if (dirs.length) print(dirs.join('  '))
if (files.length) print(files.join('  '))
