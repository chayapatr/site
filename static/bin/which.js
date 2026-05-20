if (!args[0]) { print('usage: which <command>') }
else {
  const cmd = args[0]
  const env = sys.env()

  // native apps
  const native = ['finder', 'terminal', 'settings', 'monitor']
  if (native.includes(cmd)) { print(cmd + ' (built-in app)'); }
  else {
    // search PATH for scripts
    const dirs = (env.PATH ?? '/bin').split(':')
    let found = false
    for (const dir of dirs) {
      for (const ext of ['', '.js', '.sh']) {
        const p = dir + '/' + cmd + ext
        if (await sys.exists(p)) { print(p); found = true; break }
      }
      if (found) break
    }

    // search app packages
    if (!found) {
      const appDirs = ['/usr/share/applications/' + cmd, '/home/user/apps/' + cmd]
      for (const p of appDirs) {
        if (await sys.exists(p + '/manifest.json')) { print(p + ' (app)'); found = true; break }
      }
    }

    if (!found) print(cmd + ': not found')
  }
}
