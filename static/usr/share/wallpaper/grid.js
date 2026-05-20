// grid — geometric pulse grid, each event type has a distinct shape
setup((canvas, ctx) => {
  ctx._pulses = []
})

// shape types:
// 'circle'   — euclidean distance ring (default)
// 'square'   — chebyshev distance (square ring)
// 'diamond'  — manhattan distance (diamond ring)
// 'cross'    — only activates cells on axis-aligned cross
// 'x'        — only activates cells on diagonals
// 'star'     — cross + x combined
// 'inward'   — circle but pulses collapse inward instead of outward

function pulse(ctx, shape, hue) {
  ctx._pulses.push({ x: Math.random(), y: Math.random(), r: 0, hue, shape })
}

on('win:open',      (_, canvas, ctx) => pulse(ctx, 'square',  120))
on('win:close',     (_, canvas, ctx) => pulse(ctx, 'square',  0  ))
on('fs:create',     (_, canvas, ctx) => pulse(ctx, 'cross',   180))
on('fs:modify',     (_, canvas, ctx) => pulse(ctx, 'circle',  210))
on('fs:delete',     (_, canvas, ctx) => pulse(ctx, 'x',       10 ))
on('fs:dir-change', (_, canvas, ctx) => pulse(ctx, 'diamond', 160))
on('proc:spawn',    (_, canvas, ctx) => pulse(ctx, 'star',    140))
on('proc:kill',     (_, canvas, ctx) => pulse(ctx, 'inward',  20 ))

frame((t) => {
  const w = canvas.width, h = canvas.height
  const pulses = ctx._pulses || []

  ctx.fillStyle = 'rgba(6, 6, 10, 0.4)'
  ctx.fillRect(0, 0, w, h)

  const cols = 40, rows = 25
  const cw = w / cols, ch = h / rows

  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      const cx = (x + 0.5) / cols
      const cy = (y + 0.5) / rows

      // base ambient
      const base = (Math.sin(t * 0.0008 + x * 0.3) + Math.sin(t * 0.0005 + y * 0.4)) / 2
      let brightness = (base + 1) / 2 * 0.06
      let pulseHue = 200

      for (const p of pulses) {
        const dx = cx - p.x, dy = cy - p.y
        const adx = Math.abs(dx), ady = Math.abs(dy)

        let dist
        switch (p.shape) {
          case 'square':  dist = Math.max(adx, ady); break
          case 'diamond': dist = adx + ady; break
          case 'cross':
            // only light up cells near the axes
            if (Math.min(adx, ady) > 0.04) continue
            dist = Math.max(adx, ady); break
          case 'x':
            // only light up cells near the diagonals
            if (Math.abs(adx - ady) > 0.04) continue
            dist = Math.sqrt(dx * dx + dy * dy); break
          case 'star':
            if (Math.min(adx, ady) > 0.04 && Math.abs(adx - ady) > 0.04) continue
            dist = Math.sqrt(dx * dx + dy * dy); break
          case 'inward':
            dist = 0.7 - Math.sqrt(dx * dx + dy * dy); break
          default:
            dist = Math.sqrt(dx * dx + dy * dy)
        }

        const wave = Math.sin((dist - p.r) * 18) * Math.exp(-Math.abs(dist - p.r) * 6)
        if (wave > 0) {
          brightness += wave * 0.35
          pulseHue = p.hue
        }
      }

      brightness = Math.max(0, Math.min(1, brightness))
      if (brightness > 0.02) {
        ctx.fillStyle = `hsla(${pulseHue}, 55%, ${20 + brightness * 60}%, ${brightness})`
        ctx.fillRect(x * cw + 1, y * ch + 1, cw - 2, ch - 2)
      }
    }
  }

  // advance and cull
  for (let i = pulses.length - 1; i >= 0; i--) {
    pulses[i].r += 0.014
    if (pulses[i].r > 1.5) pulses.splice(i, 1)
  }
})
