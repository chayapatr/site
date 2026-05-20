const procs = sys.ps()
print('PID\tSTATUS\t\tNAME')
for (const p of procs) {
  print(p.pid + '\t' + p.status + '\t\t' + p.name)
}
