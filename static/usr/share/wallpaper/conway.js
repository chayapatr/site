// conway — game of life, mouse seeds new cells, ticks run continuously
setup((canvas, ctx) => {
  const CELL = 8
  let cols = Math.ceil(canvas.width / CELL)
  let rows = Math.ceil(canvas.height / CELL)
  let grid = new Uint8Array(cols * rows)
  let next = new Uint8Array(cols * rows)

  function idx(x, y) { return y * cols + x }

  function seed(cx, cy, radius) {
    const gx = Math.floor(cx / CELL)
    const gy = Math.floor(cy / CELL)
    const r = radius ?? 2
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.random() < 0.55) continue
        const nx = (gx + dx + cols) % cols
        const ny = (gy + dy + rows) % rows
        grid[idx(nx, ny)] = 1
      }
    }
  }

  function tick() {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        let n = 0
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue
            n += grid[idx((x + dx + cols) % cols, (y + dy + rows) % rows)]
          }
        }
        const alive = grid[idx(x, y)]
        next[idx(x, y)] = alive ? (n === 2 || n === 3 ? 1 : 0) : (n === 3 ? 1 : 0)
      }
    }
    const tmp = grid; grid = next; next = tmp
  }

  function draw() {
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#ffffff18'
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (grid[idx(x, y)]) {
          ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 1, CELL - 1)
        }
      }
    }
  }

  // resize
  window.addEventListener('resize', () => {
    cols = Math.ceil(canvas.width / CELL)
    rows = Math.ceil(canvas.height / CELL)
    grid = new Uint8Array(cols * rows)
    next = new Uint8Array(cols * rows)
  })

  // seed on mouse move
  let lastX = -1, lastY = -1
  canvas.addEventListener('mousemove', e => {
    const dx = e.clientX - lastX
    const dy = e.clientY - lastY
    if (lastX < 0 || dx * dx + dy * dy > 16) {
      seed(e.clientX, e.clientY, 1)
      lastX = e.clientX
      lastY = e.clientY
    }
  })

  let tickAcc = 0
  frame(dt => {
    tickAcc += dt
    if (tickAcc > 80) {
      tick()
      tickAcc = 0
    }
    draw()
  })
})
