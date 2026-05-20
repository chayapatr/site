if (!args[0]) { print('mkdir: missing operand') }
else { sys.write(args[0] + '/.directory', '{}') }
