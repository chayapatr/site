if (!args[0]) { print('touch: missing operand') }
else {
  const path = sys.resolve(args[0])
  if (!await sys.exists(path)) sys.write(path, '')
}
