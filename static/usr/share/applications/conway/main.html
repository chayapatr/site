<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0a0a0a; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; gap: 8px; font-family: ui-monospace, monospace; }
  canvas { border: 1px solid #262626; image-rendering: pixelated; }
  .controls { display: flex; gap: 8px; align-items: center; }
  button { background: #171717; border: 1px solid #262626; color: #737373; font-family: inherit; font-size: 10px; padding: 3px 8px; cursor: pointer; }
  button:hover { color: #e5e5e5; border-color: #404040; }
  button.active { color: #e5e5e5; border-color: #525252; }
  span { color: #404040; font-size: 10px; }
</style>
</head>
<body>
<canvas id="c"></canvas>
<div class="controls">
  <button id="btn">run</button>
  <button id="clr">clear</button>
  <button id="rnd">random</button>
  <span id="gen">gen 0</span>
  <span id="pop">pop 0</span>
</div>
<script>
  const C = document.getElementById('c')
  const ctx = C.getContext('2d')
  const W = 80, H = 60, S = 8
  C.width = W * S; C.height = H * S

  let cells = new Uint8Array(W * H)
  let running = false, gen = 0, animId = null

  function idx(x, y) { return ((y + H) % H) * W + ((x + W) % W) }
  function get(x, y) { return cells[idx(x, y)] }
  function set(x, y, v) { cells[idx(x, y)] = v }

  function step() {
    const next = new Uint8Array(W * H)
    let pop = 0
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      let n = 0
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++)
        if (dx || dy) n += get(x + dx, y + dy)
      const alive = get(x, y)
      next[idx(x, y)] = alive ? (n === 2 || n === 3 ? 1 : 0) : (n === 3 ? 1 : 0)
      if (next[idx(x, y)]) pop++
    }
    cells = next; gen++
    document.getElementById('gen').textContent = 'gen ' + gen
    document.getElementById('pop').textContent = 'pop ' + pop
  }

  function draw() {
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, C.width, C.height)
    ctx.fillStyle = '#e5e5e5'
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++)
      if (get(x, y)) ctx.fillRect(x * S + 1, y * S + 1, S - 1, S - 1)
  }

  function loop() { step(); draw(); if (running) animId = requestAnimationFrame(loop) }

  function toggle() {
    running = !running
    document.getElementById('btn').textContent = running ? 'pause' : 'run'
    document.getElementById('btn').classList.toggle('active', running)
    if (running) loop()
  }

  document.getElementById('btn').onclick = toggle
  document.getElementById('clr').onclick = () => { cells.fill(0); gen = 0; draw(); document.getElementById('gen').textContent = 'gen 0'; document.getElementById('pop').textContent = 'pop 0' }
  document.getElementById('rnd').onclick = () => { for (let i = 0; i < cells.length; i++) cells[i] = Math.random() < 0.3 ? 1 : 0; gen = 0; draw() }

  let painting = false, paintVal = 0
  C.addEventListener('mousedown', e => {
    painting = true
    const x = Math.floor(e.offsetX / S), y = Math.floor(e.offsetY / S)
    paintVal = get(x, y) ? 0 : 1
    set(x, y, paintVal); draw()
  })
  C.addEventListener('mousemove', e => {
    if (!painting) return
    const x = Math.floor(e.offsetX / S), y = Math.floor(e.offsetY / S)
    set(x, y, paintVal); draw()
  })
  window.addEventListener('mouseup', () => painting = false)

  // glider to start
  const glider = [[1,0],[2,1],[0,2],[1,2],[2,2]]
  glider.forEach(([x,y]) => set(x + 5, y + 5, 1))
  draw()

  if (typeof sys !== 'undefined') sys.setTitle('Conway')
</script>
</body>
</html>
