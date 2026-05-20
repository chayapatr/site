if (args.length < 2) { print('cp: usage: cp <src> <dest>'); }
else {
  const src = args[0]
  let dest = args[1]
  const content = await sys.read(src)
  const destStat = await sys.stat(dest).catch(() => null)
  if (destStat?.type === 'dir') {
    dest = dest.replace(/\/$/, '') + '/' + sys.resolve(src).split('/').pop()
  }
  sys.write(dest, content)
}
