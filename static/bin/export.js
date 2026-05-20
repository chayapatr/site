if (!args[0]) {
  const env = sys.env()
  for (const [k, v] of Object.entries(env)) print('export ' + k + '=' + v)
} else {
  const eq = args[0].indexOf('=')
  if (eq === -1) { print('export: usage: export KEY=value') }
  else {
    const key = args[0].slice(0, eq)
    const value = args[0].slice(eq + 1)
    sys.setenv(key, value)
  }
}
