const target = args[0] ?? sys.env().HOME
const raw = target.startsWith('/') ? target : sys.env().CWD + '/' + target

const parts = []
for (const seg of raw.split('/')) {
  if (seg === '' || seg === '.') continue
  if (seg === '..') { parts.pop() }
  else { parts.push(seg) }
}
const resolved = '/' + parts.join('/')

const exists = await sys.exists(resolved || '/')
if (!exists) { print('cd: ' + target + ': no such directory') }
else { sys.setenv('CWD', resolved || '/') }
