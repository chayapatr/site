<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0a0a0a; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; gap: 8px; font-family: ui-monospace, monospace; }
  canvas { border: 1px solid #262626; }
  .hud { display: flex; gap: 16px; }
  span { color: #404040; font-size: 10px; }
  #msg { color: #737373; font-size: 11px; min-height: 16px; }
</style>
</head>
<body>
<canvas id="c"></canvas>
<div class="hud"><span id="score">score 0</span><span id="hi">best 0</span></div>
<div id="msg">press any arrow to start</div>
<script>
  const C = document.getElementById('c'), ctx = C.getContext('2d')
  const S = 12, W = 50, H = 40
  C.width = W * S; C.height = H * S

  let snake, dir, nextDir, food, score, hi = 0, running = false, dead = false

  function rand(max) { return Math.floor(Math.random() * max) }

  function placeFood() {
    const taken = new Set(snake.map(([x,y]) => x+','+y))
    let fx, fy
    do { fx = rand(W); fy = rand(H) } while (taken.has(fx+','+fy))
    food = [fx, fy]
  }

  function init() {
    const cx = Math.floor(W/2), cy = Math.floor(H/2)
    snake = [[cx,cy],[cx-1,cy],[cx-2,cy]]
    dir = [1,0]; nextDir = [1,0]
    score = 0; dead = false
    placeFood()
    document.getElementById('score').textContent = 'score 0'
    document.getElementById('msg').textContent = ''
  }

  function step() {
    dir = nextDir
    const [hx, hy] = snake[0]
    const nx = (hx + dir[0] + W) % W, ny = (hy + dir[1] + H) % H
    if (snake.some(([x,y]) => x===nx && y===ny)) { die(); return }
    snake.unshift([nx, ny])
    if (nx === food[0] && ny === food[1]) {
      score++
      if (score > hi) hi = score
      document.getElementById('score').textContent = 'score ' + score
      document.getElementById('hi').textContent = 'best ' + hi
      placeFood()
    } else {
      snake.pop()
    }
  }

  function die() {
    dead = true; running = false
    document.getElementById('msg').textContent = 'press any arrow to restart'
    draw()
  }

  function draw() {
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, C.width, C.height)
    ctx.fillStyle = '#404040'
    ctx.fillRect(food[0]*S+1, food[1]*S+1, S-2, S-2)
    snake.forEach(([x,y], i) => {
      ctx.fillStyle = i === 0 ? '#e5e5e5' : '#525252'
      ctx.fillRect(x*S+1, y*S+1, S-2, S-2)
    })
  }

  let lastTime = 0
  const SPEED = 100
  function loop(ts) {
    if (!running) return
    if (ts - lastTime > SPEED) { lastTime = ts; step() }
    draw()
    requestAnimationFrame(loop)
  }

  const DIRS = { ArrowUp:[0,-1], ArrowDown:[0,1], ArrowLeft:[-1,0], ArrowRight:[1,0] }
  window.addEventListener('keydown', e => {
    const d = DIRS[e.key]
    if (!d) return
    e.preventDefault()
    if (!running) {
      if (dead || !snake) init()
      running = true
      requestAnimationFrame(loop)
      return
    }
    if (d[0] !== -dir[0] || d[1] !== -dir[1]) nextDir = d
  })

  // init display
  init(); draw()
  document.getElementById('msg').textContent = 'press any arrow to start'

  if (typeof sys !== 'undefined') sys.setTitle('Snake')
</script>
</body>
</html>
