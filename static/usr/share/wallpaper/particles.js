// particles — distinct burst shapes per event type
const BASE_COUNT = 80

setup((canvas, ctx) => {
  ctx._particles = []
  for (let i = 0; i < BASE_COUNT; i++) {
    ctx._particles.push(drift(canvas))
  }
})

function drift(canvas) {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    r: Math.random() * 1.2 + 0.3,
    alpha: Math.random() * 0.2 + 0.05,
    hue: 210 + Math.random() * 40,
    base: true,
  }
}

function burst(ctx, canvas, n, ox, oy, vscale, hue, rmin, rmax, ttl, spread) {
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2 + Math.random() * spread
    const speed = (0.5 + Math.random() * 0.5) * vscale
    ctx._particles.push({
      x: ox ?? Math.random() * canvas.width,
      y: oy ?? Math.random() * canvas.height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: rmin + Math.random() * (rmax - rmin),
      alpha: 0.9,
      hue: hue + (Math.random() - 0.5) * 20,
      ttl: ttl + Math.floor(Math.random() * 20),
    })
  }
}

// fs:create — upward fountain, cyan
on('fs:create', (_, canvas, ctx) => {
  const x = Math.random() * canvas.width
  const y = canvas.height * (0.5 + Math.random() * 0.5)
  for (let i = 0; i < 18; i++) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2
    const speed = 2 + Math.random() * 3
    ctx._particles.push({
      x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      r: 1.5 + Math.random() * 2, alpha: 1, hue: 175 + Math.random() * 20,
      ttl: 60 + Math.floor(Math.random() * 30),
    })
  }
})

// fs:modify — horizontal sweep, blue
on('fs:modify', (_, canvas, ctx) => {
  const y = Math.random() * canvas.height
  for (let i = 0; i < 10; i++) {
    ctx._particles.push({
      x: Math.random() * canvas.width * 0.3,
      y: y + (Math.random() - 0.5) * 30,
      vx: 3 + Math.random() * 4, vy: (Math.random() - 0.5) * 0.5,
      r: 1 + Math.random() * 1.5, alpha: 0.85, hue: 210 + Math.random() * 20,
      ttl: 40 + Math.floor(Math.random() * 20),
    })
  }
})

// fs:delete — implosion toward center, red fragments
on('fs:delete', (_, canvas, ctx) => {
  const cx = Math.random() * canvas.width
  const cy = Math.random() * canvas.height
  for (let i = 0; i < 20; i++) {
    const angle = Math.random() * Math.PI * 2
    const dist = 80 + Math.random() * 120
    ctx._particles.push({
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
      vx: -Math.cos(angle) * (2 + Math.random() * 3),
      vy: -Math.sin(angle) * (2 + Math.random() * 3),
      r: 1.5 + Math.random() * 2.5, alpha: 0.9, hue: 5 + Math.random() * 25,
      ttl: 35 + Math.floor(Math.random() * 20),
    })
  }
})

// fs:dir-change — ring expansion, teal
on('fs:dir-change', (_, canvas, ctx) => {
  burst(ctx, canvas, 24, null, null, 2.5, 165, 1, 2, 50, Math.PI * 2)
})

// proc:spawn — radial explosion, green
on('proc:spawn', (_, canvas, ctx) => {
  burst(ctx, canvas, 30, null, null, 4, 130, 2, 4, 70, 0.3)
})

// proc:kill — downward scatter, orange-red
on('proc:kill', (_, canvas, ctx) => {
  const x = Math.random() * canvas.width
  const y = Math.random() * canvas.height * 0.5
  for (let i = 0; i < 22; i++) {
    const angle = Math.PI / 2 + (Math.random() - 0.5) * 2
    const speed = 2 + Math.random() * 4
    ctx._particles.push({
      x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      r: 2 + Math.random() * 3, alpha: 1, hue: 15 + Math.random() * 25,
      ttl: 55 + Math.floor(Math.random() * 25),
    })
  }
})

// win:open — spiral burst, green-white
on('win:open', (_, canvas, ctx) => {
  const cx = Math.random() * canvas.width
  const cy = Math.random() * canvas.height
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2
    const speed = 2 + i * 0.15
    ctx._particles.push({
      x: cx, y: cy,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      r: 2 + Math.random() * 2, alpha: 0.95, hue: 110 + Math.random() * 30,
      ttl: 50 + Math.floor(Math.random() * 30),
    })
  }
})

// win:close — inward spiral, dim
on('win:close', (_, canvas, ctx) => {
  burst(ctx, canvas, 16, null, null, 1.5, 0, 1, 2.5, 45, 0.4)
})

frame(() => {
  const w = canvas.width, h = canvas.height
  const particles = ctx._particles || []

  ctx.fillStyle = 'rgba(6, 8, 14, 0.18)'
  ctx.fillRect(0, 0, w, h)

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]

    if (p.base) {
      // base drifters wrap
      p.x += p.vx; p.y += p.vy
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0
      if (p.y < 0) p.y = h; if (p.y > h) p.y = 0
    } else {
      // event particles decay
      p.x += p.vx; p.y += p.vy
      p.vx *= 0.94; p.vy *= 0.94
      p.alpha *= 0.95
      p.ttl--
      if (p.ttl <= 0 || p.alpha < 0.015) {
        particles.splice(i, 1)
        // replace with a base drifter to keep density
        particles.push(drift(canvas))
        continue
      }
    }

    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${p.hue}, 70%, 65%, ${p.alpha})`
    ctx.fill()
  }
})
