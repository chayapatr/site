const target = args[0] ?? '~'
const resolved = sys.resolve(target)
const stat = await sys.stat(resolved).catch(() => null)
if (!stat) { print('cd: ' + target + ': no such file or directory') }
else if (stat.type !== 'dir') { print('cd: ' + target + ': not a directory') }
else { sys.setenv('CWD', resolved) }
