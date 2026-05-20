if (!args[0]) { print('touch: missing operand') }
else {
  if (!await sys.exists(args[0])) sys.write(args[0], '')
}
