if (args.length < 2) { print('cp: usage: cp <src> <dest>') }
else {
  const src = sys.resolve(args[0])
  let dest = sys.resolve(args[1])
  const content = await sys.read(src)
  const destStat = await sys.stat(dest).catch(() => null)
  if (destStat?.type === 'dir') {
    dest = dest + '/' + src.split('/').pop()
  }
  sys.write(dest, content)
}
