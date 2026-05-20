if (!args[0]) { print('rm: missing operand') }
else { sys.remove(sys.resolve(args[0])) }
