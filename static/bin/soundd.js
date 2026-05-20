const sub = args[0]

if (!sub || sub === 'status') {
  const status = await sys.read('/proc/2/status')
  const muted = await sys.read('/dev/audio')
  print('soundd: ' + status)
  print('audio:  ' + muted)
  try {
    // list loaded cues by reading theme file and extracting cue names
    const theme = await sys.read('/usr/share/sounds/default/theme.strudel')
    const cues = [...theme.matchAll(/^cue\("([^"]+)"/gm)].map(m => m[1])
    if (cues.length) print('cues:   ' + cues.join(', '))
  } catch { /* theme unreadable */ }
} else if (sub === 'reload') {
  sys.write('/proc/2/ctl', 'reload')
  print('soundd: reloading theme...')
} else if (sub === 'mute') {
  sys.write('/proc/2/ctl', 'mute')
  print('soundd: muted')
} else if (sub === 'unmute') {
  sys.write('/proc/2/ctl', 'unmute')
  print('soundd: unmuted')
} else if (sub === 'play') {
  const cue = args[1]
  if (!cue) { print('usage: soundd play <cue>'); sys.exit() }
  sys.write('/dev/audio', cue)
  print('soundd: playing ' + cue)
} else {
  print('usage: soundd [status|reload|mute|unmute|play <cue>]')
}
