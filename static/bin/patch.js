const sub = args[0]

if (!sub || sub === 'list') {
  const patched = sys.patches()
  if (!patched.length) {
    print('no system files patched')
  } else {
    print('patched system files:')
    for (const p of patched) print('  ~ ' + p)
  }
} else if (sub === 'reset') {
  const target = args[1]
  if (!target) {
    print('usage: patch reset <path>')
  } else {
    const path = sys.resolve(target)
    sys.remove(path)
    print('reset: ' + path)
  }
} else if (sub === 'reset-all') {
  const patched = sys.patches()
  if (!patched.length) {
    print('nothing to reset')
  } else {
    for (const p of patched) sys.remove(p)
    print('reset ' + patched.length + ' patched file(s)')
  }
} else {
  print('usage: patch [list]')
  print('       patch reset <path>')
  print('       patch reset-all')
}
