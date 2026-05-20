const procs = sys.ps()
const env = sys.env()

print('=== processes ===')
print('PID\tSTATUS\t\tNAME')
for (const p of procs) {
  print(p.pid + '\t' + p.status + '\t\t' + p.name)
}

print('')
print('=== env ===')
for (const [k, v] of Object.entries(env)) {
  print(k + '=' + v)
}
