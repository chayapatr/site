// conway — game of life with grid.js-style event pulses
setup((canvas, ctx) => {
  const CELL = 48
  let cols = Math.floor(canvas.width / CELL)
  let rows = Math.floor(canvas.height / CELL)
  let cellW = canvas.width / cols
  let cellH = canvas.height / rows
  let grid = []
  let lastCell = null

  function initGrid() {
    grid = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => Math.floor(Math.random() * 1.2))
    )
    lastCell = null
  }

  function countNeighbors(i, j) {
    let n = 0, eventN = 0
    for (let x = -1; x < 2; x++) {
      for (let y = -1; y < 2; y++) {
        if (x === 0 && y === 0) continue
        const ni = i + x, nj = j + y
        if (ni < 0 || nj < 0 || ni >= rows || nj >= cols) continue
        if (grid[ni][nj]) { n++; if (grid[ni][nj] === 2) eventN++ }
      }
    }
    return { n, eventN }
  }

  function tick() {
    const next = grid.map((row, i) => row.map((cell, j) => {
      const { n, eventN } = countNeighbors(i, j)
      const alive = cell ? (n === 2 || n === 3) : n === 3
      if (!alive) return 0
      // born from event neighbors → event color; existing event cell stays event for one more gen
      if (cell === 2) return 1
      return eventN > n / 2 ? 2 : 1
    }))
    grid = next
  }

  const PATTERNS = {
    glider:       [[0,1],[1,2],[2,0],[2,1],[2,2]],
    lwss:         [[0,1],[0,2],[0,3],[0,4],[1,0],[1,4],[2,4],[3,0],[3,3]],
    blinker:      [[0,0],[0,1],[0,2]],
    toad:         [[0,1],[0,2],[0,3],[1,0],[1,1],[1,2]],
    beacon:       [[0,0],[0,1],[1,0],[2,3],[3,2],[3,3]],
    pulsar:       [[0,2],[0,3],[0,4],[0,8],[0,9],[0,10],[2,0],[2,5],[2,7],[2,12],[3,0],[3,5],[3,7],[3,12],[4,0],[4,5],[4,7],[4,12],[5,2],[5,3],[5,4],[5,8],[5,9],[5,10],[7,2],[7,3],[7,4],[7,8],[7,9],[7,10],[8,0],[8,5],[8,7],[8,12],[9,0],[9,5],[9,7],[9,12],[10,0],[10,5],[10,7],[10,12],[12,2],[12,3],[12,4],[12,8],[12,9],[12,10]],
    rpentomino:   [[0,1],[0,2],[1,0],[1,1],[2,1]],
    diehard:      [[0,6],[1,0],[1,1],[2,1],[2,5],[2,6],[2,7]],
    acorn:        [[0,1],[1,3],[2,0],[2,1],[2,4],[2,5],[2,6]],
  }

  const PATTERN_KEYS = Object.keys(PATTERNS)

  function placePattern(ci, cj, pattern, value) {
    for (const [di, dj] of pattern) {
      const ni = ci + di, nj = cj + dj
      if (ni >= 0 && ni < rows && nj >= 0 && nj < cols)
        grid[ni][nj] = value
    }
  }

  function theme() {
    const attr = document.documentElement.getAttribute('data-theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const dark = attr === 'dark' || (attr !== 'light' && prefersDark)
    return dark
      ? { bg: '#0a0a0a', dead: '#141414', live: '#262626', event: '#525252', border: '#1a1a1a' }
      : { bg: '#fafafa', dead: '#f5f5f5', live: '#d4d4d4', event: '#a3a3a3', border: '#d4d4d4' }
  }

  function draw() {
    const c = theme()
    ctx.fillStyle = c.bg
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const x = j * cellW
        const y = i * cellH
        const cell = grid[i][j]
        ctx.fillStyle = cell === 2 ? c.event : cell === 1 ? c.live : c.dead
        ctx.fillRect(x, y, cellW, cellH)
        ctx.strokeStyle = c.border
        ctx.lineWidth = 0.5
        ctx.strokeRect(x, y, cellW, cellH)
      }
    }
  }

  initGrid()

  window.addEventListener('resize', () => {
    cols = Math.floor(canvas.width / CELL)
    rows = Math.floor(canvas.height / CELL)
    cellW = canvas.width / cols
    cellH = canvas.height / rows
    initGrid()
  })

  window.addEventListener('mousemove', e => {
    const j = Math.floor(e.clientX / cellW)
    const i = Math.floor(e.clientY / cellH)
    if (i < 0 || i >= rows || j < 0 || j >= cols) return
    const key = `${i},${j}`
    if (key === lastCell) return
    lastCell = key
    grid[i][j] = grid[i][j] ? 0 : 1
  })

  function spawnPatterns(count, value) {
    for (let k = 0; k < count; k++) {
      const key = PATTERN_KEYS[Math.floor(Math.random() * PATTERN_KEYS.length)]
      placePattern(
        Math.floor(Math.random() * (rows - 15)),
        Math.floor(Math.random() * (cols - 15)),
        PATTERNS[key], value
      )
    }
  }

  let pendingPatterns = []

  ctx._seedClusters = (count) => {
    for (let k = 0; k < count; k++) {
      const key = PATTERN_KEYS[Math.floor(Math.random() * PATTERN_KEYS.length)]
      pendingPatterns.push({
        i: Math.floor(Math.random() * (rows - 15)),
        j: Math.floor(Math.random() * (cols - 15)),
        pattern: PATTERNS[key],
        value: 2
      })
    }
  }

  let lastTick = -1
  let lastSpawn = -1
  frame(t => {
    if (lastTick < 0) { lastTick = t; lastSpawn = t }
    if (t - lastTick > 800) {
      for (const p of pendingPatterns) placePattern(p.i, p.j, p.pattern, p.value)
      pendingPatterns = []
      tick()
      lastTick = t
    }
    if (t - lastSpawn > 4000) {
      spawnPatterns(2, 1)
      lastSpawn = t
    }
    draw()
  })
})

on('win:open',      (_, canvas, ctx) => ctx._seedClusters?.(6))
on('win:close',     (_, canvas, ctx) => ctx._seedClusters?.(4))
on('fs:create',     (_, canvas, ctx) => ctx._seedClusters?.(5))
on('fs:modify',     (_, canvas, ctx) => ctx._seedClusters?.(3))
on('fs:delete',     (_, canvas, ctx) => ctx._seedClusters?.(3))
on('fs:dir-change', (_, canvas, ctx) => ctx._seedClusters?.(4))
on('proc:spawn',    (_, canvas, ctx) => ctx._seedClusters?.(8))
on('proc:kill',     (_, canvas, ctx) => ctx._seedClusters?.(4))
