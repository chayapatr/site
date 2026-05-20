<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #0a0a0a;
    color: #ccc;
    font-family: monospace;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }
  #toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border-bottom: 1px solid #222;
    font-size: 11px;
    color: #555;
    flex-shrink: 0;
  }
  #filename { color: #888; }
  #dims { margin-left: auto; }
  #container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    cursor: grab;
    user-select: none;
  }
  #container.grabbing { cursor: grabbing; }
  #img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    transform-origin: center center;
    transition: transform 0.1s ease;
    image-rendering: auto;
    pointer-events: none;
  }
  #empty {
    color: #333;
    font-size: 12px;
  }
  #zoom-hint {
    font-size: 10px;
    color: #333;
  }
</style>
</head>
<body>
<div id="toolbar">
  <span id="filename">no file</span>
  <span id="dims"></span>
  <span id="zoom-hint">scroll to zoom · drag to pan</span>
</div>
<div id="container">
  <div id="empty">no image loaded</div>
  <img id="img" style="display:none" />
</div>
<script>
  let scale = 1
  let offsetX = 0, offsetY = 0
  let dragging = false
  let lastX = 0, lastY = 0

  const img = document.getElementById('img')
  const container = document.getElementById('container')
  const filenameEl = document.getElementById('filename')
  const dimsEl = document.getElementById('dims')
  const emptyEl = document.getElementById('empty')

  async function load(path) {
    if (!path) return
    filenameEl.textContent = path.split('/').pop()
    try {
      const data = await sys.read(path)
      img.src = data
      img.style.display = 'block'
      emptyEl.style.display = 'none'
      img.onload = () => {
        dimsEl.textContent = img.naturalWidth + ' × ' + img.naturalHeight
        scale = 1; offsetX = 0; offsetY = 0
        applyTransform()
      }
      await sys.setTitle(filenameEl.textContent)
    } catch (e) {
      emptyEl.textContent = 'error: ' + e.message
      emptyEl.style.display = 'block'
      img.style.display = 'none'
    }
  }

  function applyTransform() {
    img.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`
  }

  container.addEventListener('wheel', e => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    scale = Math.max(0.1, Math.min(20, scale * delta))
    applyTransform()
  }, { passive: false })

  container.addEventListener('mousedown', e => {
    dragging = true
    lastX = e.clientX; lastY = e.clientY
    container.classList.add('grabbing')
  })
  window.addEventListener('mousemove', e => {
    if (!dragging) return
    offsetX += e.clientX - lastX
    offsetY += e.clientY - lastY
    lastX = e.clientX; lastY = e.clientY
    applyTransform()
  })
  window.addEventListener('mouseup', () => {
    dragging = false
    container.classList.remove('grabbing')
  })

  // double-click to reset
  container.addEventListener('dblclick', () => {
    scale = 1; offsetX = 0; offsetY = 0
    applyTransform()
  })

  load(sys.args[0])
</script>
</body>
</html>
