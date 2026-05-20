const nativeApps = ['finder', 'terminal', 'settings', 'monitor']

;(async () => {
  const env = await sys.env()
  const cwd = env.CWD || '/home/user'
  let app = args[0]

  if (!app) {
    print('usage: open <app|path>')
    return
  }

  // resolve . and relative paths to absolute
  if (app === '.') app = cwd
  else if (app === '..') app = cwd.split('/').slice(0, -1).join('/') || '/'
  else if (!app.startsWith('/')) app = cwd + '/' + app

  // native apps by name
  if (nativeApps.includes(app)) {
    sys.spawn(app, args.slice(1))
    return
  }

  // if it's an absolute path, open it directly
  if (app.startsWith('/')) {
    const exists = await sys.exists(app)
    if (!exists) { print('open: ' + args[0] + ': not found'); return }
    const stat = await sys.stat(app)
    if (stat.type === 'dir') {
      const openAsCwd = args[0] === '.' || args[0] === '..'
      if (!openAsCwd) {
        const hasManifest = await sys.exists(app + '/manifest.json')
        if (hasManifest) { await sys.spawnWebapp(app); return }
      }
      sys.spawn('finder', [app])
      return
    }
    await sys.spawnWebapp('/usr/share/applications/editor', app)
    return
  }

  // search by app name in known locations
  const candidates = [
    '/usr/share/applications/' + app,
    '/home/user/apps/' + app,
  ]
  for (const p of candidates) {
    const exists = await sys.exists(p)
    if (!exists) continue
    const stat = await sys.stat(p)
    if (stat.type === 'dir') {
      const hasManifest = await sys.exists(p + '/manifest.json')
      if (hasManifest) { await sys.spawnWebapp(p); return }
    }
  }
  print('open: ' + args[0] + ': not found')
})()
