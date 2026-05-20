const pid = parseInt(args[0])
if (isNaN(pid)) { print('kill: invalid pid') }
else { sys.kill(pid) }
