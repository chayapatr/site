// noise — perlin-style noise field, reacts to system activity
setup((canvas, ctx) => {
  ctx._activity = 0
  ctx._hue = 220
})

on('proc:spawn',    (_, canvas, ctx) => { ctx._activity = Math.min(1, (ctx._activity || 0) + 0.3) })
on('proc:kill',     (_, canvas, ctx) => { ctx._activity = Math.min(1, (ctx._activity || 0) + 0.2) })
on('fs:create',     (_, canvas, ctx) => { ctx._activity = Math.min(1, (ctx._activity || 0) + 0.15); ctx._hue = ((ctx._hue || 220) + 15) % 360 })
on('fs:modify',     (_, canvas, ctx) => { ctx._activity = Math.min(1, (ctx._activity || 0) + 0.08) })
on('fs:delete',     (_, canvas, ctx) => { ctx._activity = Math.min(1, (ctx._activity || 0) + 0.12); ctx._hue = ((ctx._hue || 220) - 20 + 360) % 360 })
on('fs:dir-change', (_, canvas, ctx) => { ctx._activity = Math.min(1, (ctx._activity || 0) + 0.1) })
on('win:open',      (_, canvas, ctx) => { ctx._hue = ((ctx._hue || 220) + 30) % 360 })
on('win:close',     (_, canvas, ctx) => { ctx._hue = ((ctx._hue || 220) - 15 + 360) % 360 })

frame((t) => {
  const w = canvas.width, h = canvas.height
  const activity = ctx._activity || 0
  const hue = ctx._hue || 220
  const speed = 0.0003 + activity * 0.001
  const scale = 0.003

  ctx.fillStyle = `hsl(${hue}, 15%, 4%)`
  ctx.fillRect(0, 0, w, h)

  // simple value noise grid
  const cols = 80, rows = 50
  const cw = w / cols, ch = h / rows

  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      const nx = x * scale + t * speed
      const ny = y * scale + t * speed * 0.7

      // pseudo-noise using sin harmonics
      const n = (
        Math.sin(nx * 7.3 + ny * 3.1) +
        Math.sin(nx * 13.7 - ny * 5.9 + t * 0.0001) +
        Math.sin((nx + ny) * 4.1 + t * 0.00015)
      ) / 3

      const brightness = (n + 1) / 2
      const alpha = brightness * (0.12 + activity * 0.15)
      ctx.fillStyle = `hsla(${hue + n * 40}, 40%, ${30 + brightness * 40}%, ${alpha})`
      ctx.fillRect(x * cw, y * ch, cw + 0.5, ch + 0.5)
    }
  }

  // decay activity
  ctx._activity = Math.max(0, (ctx._activity || 0) - 0.002)
})
