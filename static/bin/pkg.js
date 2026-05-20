const REGISTRY = '/net/registry.from.pub/packages.json'
const INSTALL_DIR = '/usr/share/applications'

const cmd = args[0]

;(async () => {
  if (!cmd || cmd === 'help') {
    print('usage: pkg <command> [name]')
    print('  pkg list              list available packages')
    print('  pkg installed         list installed packages')
    print('  pkg install <name>    install a package')
    print('  pkg remove <name>     remove a package')
    return
  }

  let registry
  try {
    registry = JSON.parse(await sys.read(REGISTRY))
  } catch {
    print('pkg: could not read registry')
    return
  }

  if (cmd === 'list') {
    const installed = await getInstalled(registry)
    print('available packages:')
    for (const pkg of registry) {
      const mark = installed.has(pkg.name) ? ' [installed]' : ''
      print('  ' + pkg.name + ' — ' + pkg.description + mark)
    }
    return
  }

  if (cmd === 'installed') {
    const installed = await getInstalled(registry)
    if (installed.size === 0) { print('no packages installed'); return }
    for (const name of installed) print('  ' + name)
    return
  }

  if (cmd === 'install') {
    const name = args[1]
    if (!name) { print('pkg install: missing package name'); return }
    const pkg = registry.find(p => p.name === name)
    if (!pkg) { print('pkg: ' + name + ': not found in registry'); return }

    print('installing ' + name + '...')
    if (pkg.type === 'app') {
      await copyDir(pkg.src, INSTALL_DIR + '/' + name)
    } else if (pkg.type === 'bin') {
      const src = pkg.src
      const content = await sys.read(src)
      await sys.write('/home/user/bin/' + name + '.js', content)
    }
    print(name + ': installed')
    return
  }

  if (cmd === 'remove') {
    const name = args[1]
    if (!name) { print('pkg remove: missing package name'); return }
    const dest = INSTALL_DIR + '/' + name
    const exists = await sys.exists(dest)
    if (!exists) { print('pkg: ' + name + ': not installed'); return }
    await sys.remove(dest)
    print(name + ': removed')
    return
  }

  print('pkg: unknown command: ' + cmd)
})()

async function getInstalled(registry) {
  const installed = new Set()
  for (const pkg of registry) {
    if (await sys.exists(INSTALL_DIR + '/' + pkg.name)) {
      installed.add(pkg.name)
    }
  }
  return installed
}

async function copyDir(src, dest) {
  const entries = await sys.list(src)
  for (const entry of entries) {
    const srcPath = src + '/' + entry
    const destPath = dest + '/' + entry
    const stat = await sys.stat(srcPath)
    if (stat.type === 'dir') {
      await copyDir(srcPath, destPath)
    } else {
      const content = await sys.read(srcPath)
      await sys.write(destPath, content)
    }
  }
}
