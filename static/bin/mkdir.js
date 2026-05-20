if (!args[0]) { print('mkdir: missing operand') }
else { sys.write(sys.resolve(args[0]) + '/.directory', 'view: list\n') }
