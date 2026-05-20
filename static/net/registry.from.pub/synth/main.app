<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0a0a0a; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; gap: 16px; font-family: ui-monospace, monospace; user-select: none; }
  .keys { display: flex; position: relative; height: 120px; }
  .w { width: 36px; height: 120px; background: #1a1a1a; border: 1px solid #262626; border-radius: 0 0 3px 3px; cursor: pointer; position: relative; transition: background 0.05s; }
  .w:hover { background: #262626; }
  .w.on { background: #404040; }
  .b { width: 22px; height: 72px; background: #0a0a0a; border: 1px solid #333; border-radius: 0 0 2px 2px; cursor: pointer; position: absolute; top: 0; z-index: 1; transition: background 0.05s; }
  .b:hover { background: #1a1a1a; }
  .b.on { background: #262626; }
  .label { position: absolute; bottom: 6px; left: 0; right: 0; text-align: center; font-size: 9px; color: #404040; pointer-events: none; }
  .b .label { bottom: 4px; color: #333; }
  .controls { display: flex; gap: 12px; align-items: center; }
  label { font-size: 10px; color: #525252; display: flex; flex-direction: column; align-items: center; gap: 4px; }
  input[type=range] { width: 60px; accent-color: #525252; }
  select { background: #171717; border: 1px solid #262626; color: #737373; font-family: inherit; font-size: 10px; padding: 2px 4px; }
  .hint { font-size: 9px; color: #2a2a2a; }
</style>
</head>
<body>
<div class="keys" id="keys"></div>
<div class="controls">
  <label>wave<select id="wave"><option>sine</option><option>square</option><option selected>sawtooth</option><option>triangle</option></select></label>
  <label>attack<input type="range" id="atk" min="0" max="500" value="10"></label>
  <label>release<input type="range" id="rel" min="50" max="2000" value="300"></label>
  <label>vol<input type="range" id="vol" min="0" max="100" value="60"></label>
</div>
<div class="hint">keyboard: a s d f g h j k l — w e t y u o p</div>
<script>
  const ctx = new AudioContext()
  const masterGain = ctx.createGain()
  masterGain.gain.value = 0.6
  masterGain.connect(ctx.destination)

  const notes = [
    {note:'C4', freq:261.63, type:'w', key:'a'},
    {note:'C#4',freq:277.18,type:'b',key:'w'},
    {note:'D4', freq:293.66,type:'w',key:'s'},
    {note:'D#4',freq:311.13,type:'b',key:'e'},
    {note:'E4', freq:329.63,type:'w',key:'d'},
    {note:'F4', freq:349.23,type:'w',key:'f'},
    {note:'F#4',freq:369.99,type:'b',key:'t'},
    {note:'G4', freq:392.00,type:'w',key:'g'},
    {note:'G#4',freq:415.30,type:'b',key:'y'},
    {note:'A4', freq:440.00,type:'w',key:'h'},
    {note:'A#4',freq:466.16,type:'b',key:'u'},
    {note:'B4', freq:493.88,type:'w',key:'j'},
    {note:'C5', freq:523.25,type:'w',key:'k'},
    {note:'C#5',freq:554.37,type:'b',key:'o'},
    {note:'D5', freq:587.33,type:'w',key:'l'},
    {note:'D#5',freq:622.25,type:'b',key:'p'},
    {note:'E5', freq:659.25,type:'w',key:';'},
  ]

  const active = new Map()
  const keyMap = {}

  const keysEl = document.getElementById('keys')
  let wIdx = 0
  notes.forEach((n, i) => {
    const el = document.createElement('div')
    el.className = n.type
    el.dataset.i = i
    const label = document.createElement('span')
    label.className = 'label'
    label.textContent = n.key
    el.appendChild(label)
    if (n.type === 'w') {
      el.style.left = (wIdx * 37) + 'px'
      keysEl.style.width = ((wIdx + 1) * 37) + 'px'
      wIdx++
    } else {
      el.style.left = ((wIdx * 37) - 13) + 'px'
    }
    keysEl.appendChild(el)
    keyMap[n.key] = i

    el.addEventListener('mousedown', e => { e.preventDefault(); startNote(i) })
    el.addEventListener('mouseup', () => stopNote(i))
    el.addEventListener('mouseleave', () => { if (active.has(i)) stopNote(i) })
  })

  function getEl(i) { return keysEl.querySelector(`[data-i="${i}"]`) }

  function startNote(i) {
    if (active.has(i)) return
    ctx.resume()
    const n = notes[i]
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = document.getElementById('wave').value
    osc.frequency.value = n.freq
    const atk = document.getElementById('atk').value / 1000
    g.gain.setValueAtTime(0, ctx.currentTime)
    g.gain.linearRampToValueAtTime(1, ctx.currentTime + atk)
    osc.connect(g); g.connect(masterGain)
    osc.start()
    active.set(i, {osc, g})
    getEl(i)?.classList.add('on')
  }

  function stopNote(i) {
    const node = active.get(i)
    if (!node) return
    const rel = document.getElementById('rel').value / 1000
    node.g.gain.cancelScheduledValues(ctx.currentTime)
    node.g.gain.setValueAtTime(node.g.gain.value, ctx.currentTime)
    node.g.gain.linearRampToValueAtTime(0, ctx.currentTime + rel)
    node.osc.stop(ctx.currentTime + rel)
    active.delete(i)
    getEl(i)?.classList.remove('on')
  }

  document.getElementById('vol').addEventListener('input', e => {
    masterGain.gain.value = e.target.value / 100
  })

  window.addEventListener('keydown', e => {
    if (e.repeat || e.metaKey || e.ctrlKey) return
    const i = keyMap[e.key]
    if (i !== undefined) { e.preventDefault(); startNote(i) }
  })
  window.addEventListener('keyup', e => {
    const i = keyMap[e.key]
    if (i !== undefined) stopNote(i)
  })

  if (typeof sys !== 'undefined') sys.setTitle('Synth')
</script>
</body>
</html>
