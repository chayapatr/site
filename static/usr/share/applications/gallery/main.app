<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { height: 100%; background: #0a0a0a; font-family: 'Zed Mono Extended', ui-monospace, monospace; color: #a3a3a3; overflow: hidden; }

  #app { display: flex; flex-direction: column; height: 100%; }

  /* toolbar */
  #toolbar {
    display: flex; align-items: center; gap: 8px;
    padding: 6px 12px; border-bottom: 1px solid #1a1a1a;
    font-size: 11px; color: #555; flex-shrink: 0;
  }
  #toolbar button {
    padding: 2px 8px; border: 1px solid #2a2a2a; background: transparent;
    color: #666; font-family: inherit; font-size: 11px; cursor: pointer;
  }
  #toolbar button:hover { border-color: #444; color: #a3a3a3; }
  #count { margin-left: auto; }

  /* grid */
  #grid-view {
    flex: 1; overflow-y: auto; padding: 12px;
    display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 8px;
    align-content: start;
  }
  .thumb {
    aspect-ratio: 1; overflow: hidden; border: 1px solid #1a1a1a; cursor: pointer;
    background: #111; position: relative;
  }
  .thumb:hover { border-color: #404040; }
  .thumb.selected { border-color: #737373; }
  .thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .thumb .name {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 3px 5px; font-size: 9px; color: #555;
    background: linear-gradient(transparent, rgba(0,0,0,0.7));
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  /* lightbox */
  #lightbox {
    display: none; flex-direction: column; flex: 1; overflow: hidden;
  }
  #lightbox.active { display: flex; }
  #grid-view.hidden { display: none; }

  #lb-toolbar {
    display: flex; align-items: center; gap: 8px;
    padding: 6px 12px; border-bottom: 1px solid #1a1a1a;
    font-size: 11px; color: #555; flex-shrink: 0;
  }
  #lb-toolbar button {
    padding: 2px 8px; border: 1px solid #2a2a2a; background: transparent;
    color: #666; font-family: inherit; font-size: 11px; cursor: pointer;
  }
  #lb-toolbar button:hover { border-color: #444; color: #a3a3a3; }
  #lb-filename { flex: 1; color: #666; }
  #lb-dims { color: #404040; }

  #lb-stage {
    flex: 1; display: flex; align-items: center; justify-content: center;
    overflow: hidden; cursor: grab; user-select: none; position: relative;
  }
  #lb-stage.grabbing { cursor: grabbing; }
  #lb-img { max-width: 100%; max-height: 100%; object-fit: contain; pointer-events: none; transform-origin: center; }

  #lb-nav-left, #lb-nav-right {
    position: absolute; top: 50%; transform: translateY(-50%);
    padding: 8px 10px; border: 1px solid #2a2a2a; background: rgba(10,10,10,0.8);
    color: #555; font-family: inherit; font-size: 11px; cursor: pointer;
  }
  #lb-nav-left:hover, #lb-nav-right:hover { border-color: #444; color: #a3a3a3; }
  #lb-nav-left { left: 8px; }
  #lb-nav-right { right: 8px; }

  /* filmstrip */
  #filmstrip {
    display: flex; gap: 4px; padding: 6px 8px; overflow-x: auto;
    border-top: 1px solid #1a1a1a; background: #0a0a0a; flex-shrink: 0;
    scrollbar-width: none;
  }
  #filmstrip::-webkit-scrollbar { display: none; }
  .film-thumb {
    width: 52px; height: 40px; flex-shrink: 0; overflow: hidden;
    border: 1px solid #1a1a1a; cursor: pointer; opacity: 0.5;
  }
  .film-thumb:hover { opacity: 0.8; }
  .film-thumb.active { border-color: #737373; opacity: 1; }
  .film-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }

  /* empty state */
  #empty {
    flex: 1; display: flex; align-items: center; justify-content: center;
    flex-direction: column; gap: 8px; font-size: 11px; color: #303030;
  }
  #empty a {
    color: #404040; text-decoration: none; border-bottom: 1px solid #2a2a2a; cursor: pointer;
  }
  #empty a:hover { color: #666; }

  #delete-confirm {
    display: none; position: absolute; bottom: 60px; left: 50%; transform: translateX(-50%);
    background: #111; border: 1px solid #333; padding: 8px 12px; font-size: 11px;
    display: none; gap: 8px; align-items: center; z-index: 10;
  }
  #delete-confirm.show { display: flex; }
  #delete-confirm button {
    padding: 2px 8px; border: 1px solid #333; background: transparent;
    color: #a3a3a3; font-family: inherit; font-size: 11px; cursor: pointer;
  }
  #delete-confirm button.danger { border-color: #5a1a1a; color: #c07070; }
  #delete-confirm button.danger:hover { border-color: #8a2a2a; color: #e07070; }
</style>
</head>
<body>
<div id="app">
  <div id="toolbar">
    <span>Gallery</span>
    <button onclick="reload()">reload</button>
    <span id="count"></span>
  </div>

  <div id="grid-view"></div>

  <div id="lightbox">
    <div id="lb-toolbar">
      <button onclick="closeLightbox()">← back</button>
      <span id="lb-filename"></span>
      <span id="lb-dims"></span>
      <button onclick="openInPreview()">preview</button>
      <button onclick="confirmDelete()">delete</button>
    </div>
    <div id="lb-stage">
      <img id="lb-img" />
      <button id="lb-nav-left" onclick="navBy(-1)">←</button>
      <button id="lb-nav-right" onclick="navBy(1)">→</button>
      <div id="delete-confirm">
        <span>delete this photo?</span>
        <button class="danger" onclick="doDelete()">yes</button>
        <button onclick="cancelDelete()">no</button>
      </div>
    </div>
    <div id="filmstrip" id="filmstrip"></div>
  </div>

  <div id="empty" style="display:none">
    <span>no photos yet</span>
    <a onclick="openCamera()">open camera →</a>
  </div>
</div>

<script>
  if (typeof sys !== 'undefined') sys.setTitle('Gallery')

  const PICTURES = '/home/user/Pictures'
  const IMAGE_EXTS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'])

  let photos = []       // [{name, path}]
  let current = -1      // index in lightbox
  let lbScale = 1
  let lbOffsetX = 0, lbOffsetY = 0
  let dragging = false, lastX = 0, lastY = 0

  const gridEl = document.getElementById('grid-view')
  const lightboxEl = document.getElementById('lightbox')
  const emptyEl = document.getElementById('empty')
  const countEl = document.getElementById('count')
  const lbImg = document.getElementById('lb-img')
  const lbFilename = document.getElementById('lb-filename')
  const lbDims = document.getElementById('lb-dims')
  const filmstrip = document.getElementById('filmstrip')
  const deleteConfirm = document.getElementById('delete-confirm')

  async function reload() {
    photos = []
    gridEl.innerHTML = ''
    filmstrip.innerHTML = ''
    if (typeof sys === 'undefined') return

    let entries = []
    try { entries = await sys.list(PICTURES) } catch { /* dir doesn't exist yet */ }

    for (const name of entries) {
      const ext = name.split('.').pop()?.toLowerCase()
      if (!ext || !IMAGE_EXTS.has(ext)) continue
      photos.push({ name, path: PICTURES + '/' + name })
    }

    // sort by name descending (newest first for photo-<timestamp> naming)
    photos.sort((a, b) => b.name.localeCompare(a.name))

    if (photos.length === 0) {
      gridEl.style.display = 'none'
      emptyEl.style.display = 'flex'
      countEl.textContent = ''
      return
    }

    gridEl.style.display = 'grid'
    emptyEl.style.display = 'none'
    countEl.textContent = photos.length + ' photo' + (photos.length === 1 ? '' : 's')

    for (let i = 0; i < photos.length; i++) {
      const { name, path } = photos[i]
      const div = document.createElement('div')
      div.className = 'thumb'
      div.dataset.index = i

      const img = document.createElement('img')
      img.loading = 'lazy'
      // load async to avoid blocking
      loadThumb(img, path)

      const label = document.createElement('div')
      label.className = 'name'
      label.textContent = name

      div.appendChild(img)
      div.appendChild(label)
      div.onclick = () => openLightbox(i)
      gridEl.appendChild(div)

      // filmstrip entry
      const ft = document.createElement('div')
      ft.className = 'film-thumb'
      ft.dataset.index = i
      const ftImg = document.createElement('img')
      ftImg.loading = 'lazy'
      loadThumb(ftImg, path)
      ft.appendChild(ftImg)
      ft.onclick = () => openLightbox(i)
      filmstrip.appendChild(ft)
    }
  }

  async function loadThumb(imgEl, path) {
    try {
      const data = await sys.read(path)
      imgEl.src = data
    } catch { imgEl.src = '' }
  }

  function openLightbox(index) {
    current = index
    lightboxEl.classList.add('active')
    gridEl.classList.add('hidden')
    emptyEl.style.display = 'none'
    lbScale = 1; lbOffsetX = 0; lbOffsetY = 0
    showPhoto(index)
  }

  function closeLightbox() {
    lightboxEl.classList.remove('active')
    gridEl.classList.remove('hidden')
    if (photos.length === 0) emptyEl.style.display = 'flex'
    deleteConfirm.classList.remove('show')
  }

  function showPhoto(index) {
    if (index < 0 || index >= photos.length) return
    current = index
    lbScale = 1; lbOffsetX = 0; lbOffsetY = 0
    applyTransform()

    const { name, path } = photos[index]
    lbFilename.textContent = name
    lbDims.textContent = ''
    lbImg.src = ''

    sys.read(path).then(data => {
      lbImg.src = data
      lbImg.onload = () => {
        lbDims.textContent = lbImg.naturalWidth + ' × ' + lbImg.naturalHeight
      }
    }).catch(() => { lbFilename.textContent = name + ' (error)' })

    // update filmstrip
    const thumbs = filmstrip.querySelectorAll('.film-thumb')
    thumbs.forEach((t, i) => t.classList.toggle('active', i === index))
    const active = filmstrip.querySelector('.film-thumb.active')
    if (active) active.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' })

    deleteConfirm.classList.remove('show')
  }

  function navBy(delta) {
    const next = current + delta
    if (next < 0 || next >= photos.length) return
    showPhoto(next)
  }

  function applyTransform() {
    lbImg.style.transform = `translate(${lbOffsetX}px, ${lbOffsetY}px) scale(${lbScale})`
  }

  function openCamera() {
    if (typeof sys !== 'undefined') sys.spawnApp('/usr/share/applications/camera')
  }

  function openInPreview() {
    if (typeof sys !== 'undefined' && current >= 0) {
      sys.spawnApp('/usr/share/applications/preview', photos[current].path)
    }
  }

  function confirmDelete() {
    deleteConfirm.classList.add('show')
  }
  function cancelDelete() {
    deleteConfirm.classList.remove('show')
  }
  async function doDelete() {
    if (current < 0) return
    const path = photos[current].path
    try { await sys.remove(path) } catch {}
    photos.splice(current, 1)
    deleteConfirm.classList.remove('show')
    if (photos.length === 0) {
      closeLightbox()
      gridEl.innerHTML = ''
      filmstrip.innerHTML = ''
      gridEl.style.display = 'none'
      emptyEl.style.display = 'flex'
      countEl.textContent = ''
      return
    }
    // remove from grid + filmstrip
    const gridThumbs = gridEl.querySelectorAll('.thumb')
    const filmThumbs = filmstrip.querySelectorAll('.film-thumb')
    gridThumbs[current]?.remove()
    filmThumbs[current]?.remove()
    // re-index data attrs
    gridEl.querySelectorAll('.thumb').forEach((t, i) => { t.dataset.index = i; t.onclick = () => openLightbox(i) })
    filmstrip.querySelectorAll('.film-thumb').forEach((t, i) => { t.dataset.index = i; t.onclick = () => openLightbox(i) })
    countEl.textContent = photos.length + ' photo' + (photos.length === 1 ? '' : 's')
    // show prev photo or next
    showPhoto(Math.min(current, photos.length - 1))
  }

  // zoom + pan in lightbox
  const stage = document.getElementById('lb-stage')
  stage.addEventListener('wheel', e => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    lbScale = Math.max(0.2, Math.min(20, lbScale * delta))
    applyTransform()
  }, { passive: false })
  stage.addEventListener('mousedown', e => {
    if (e.target.tagName === 'BUTTON') return
    dragging = true; lastX = e.clientX; lastY = e.clientY
    stage.classList.add('grabbing')
  })
  window.addEventListener('mousemove', e => {
    if (!dragging) return
    lbOffsetX += e.clientX - lastX; lbOffsetY += e.clientY - lastY
    lastX = e.clientX; lastY = e.clientY
    applyTransform()
  })
  window.addEventListener('mouseup', () => { dragging = false; stage.classList.remove('grabbing') })
  stage.addEventListener('dblclick', () => {
    lbScale = 1; lbOffsetX = 0; lbOffsetY = 0; applyTransform()
  })

  // keyboard nav
  window.addEventListener('keydown', e => {
    if (!lightboxEl.classList.contains('active')) return
    if (e.key === 'ArrowLeft') navBy(-1)
    else if (e.key === 'ArrowRight') navBy(1)
    else if (e.key === 'Escape') closeLightbox()
  })

  reload()
</script>
</body>
</html>
