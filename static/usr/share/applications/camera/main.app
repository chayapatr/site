<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { height: 100%; background: #0a0a0a; font-family: 'Zed Mono Extended', ui-monospace, monospace; color: #a3a3a3; overflow: hidden; }
  #container { display: flex; flex-direction: column; height: 100%; }
  #preview { flex: 1; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
  video { width: 100%; height: 100%; object-fit: cover; }
  canvas { display: none; }
  #toolbar {
    display: flex; align-items: center; justify-content: center; gap: 12px;
    padding: 8px 12px; border-top: 1px solid #1a1a1a; background: rgba(10,10,10,0.8);
    font-size: 11px;
  }
  button {
    padding: 4px 12px; border: 1px solid #404040; background: transparent;
    color: #a3a3a3; font-family: inherit; font-size: 11px; cursor: pointer;
  }
  button:hover { border-color: #737373; color: #e5e5e5; }
  button.primary { border-color: #525252; color: #e5e5e5; }
  #status { font-size: 10px; color: #404040; position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); }
  #flash { position: absolute; inset: 0; background: white; opacity: 0; pointer-events: none; transition: opacity 0.1s; }
  #shots { display: flex; gap: 4px; padding: 4px 8px; overflow-x: auto; border-top: 1px solid #1a1a1a; max-height: 72px; background: #0a0a0a; }
  #shots img { height: 60px; width: auto; cursor: pointer; border: 1px solid #1a1a1a; }
  #shots img:hover { border-color: #525252; }
  #error { display: flex; align-items: center; justify-content: center; height: 100%; font-size: 11px; color: #525252; flex-direction: column; gap: 8px; }
</style>
</head>
<body>
<div id="container">
  <div id="preview">
    <video id="video" autoplay playsinline muted></video>
    <canvas id="canvas"></canvas>
    <div id="flash"></div>
    <div id="status"></div>
  </div>
  <div id="toolbar">
    <button onclick="switchCamera()">flip</button>
    <button class="primary" onclick="capture()">[capture]</button>
  </div>
  <div id="shots"></div>
</div>

<script>
  if (typeof sys !== 'undefined') sys.setTitle('Camera')

  const video = document.getElementById('video')
  const canvas = document.getElementById('canvas')
  const flash = document.getElementById('flash')
  const status = document.getElementById('status')
  const shots = document.getElementById('shots')

  let stream = null
  let facingMode = 'user'
  let lastDataUrl = null
  let shotCount = 0

  async function startCamera() {
    try {
      if (stream) stream.getTracks().forEach(t => t.stop())
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: false })
      video.srcObject = stream
      status.textContent = ''
    } catch (e) {
      video.style.display = 'none'
      document.getElementById('preview').innerHTML = '<div id="error"><span>camera unavailable</span><span style="color:#2a2a2a">' + e.message + '</span></div>'
    }
  }

  function switchCamera() {
    facingMode = facingMode === 'user' ? 'environment' : 'user'
    startCamera()
  }

  function capture() {
    if (!stream) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    lastDataUrl = canvas.toDataURL('image/jpeg', 0.9)
    shotCount++

    // flash
    flash.style.opacity = '0.8'
    setTimeout(() => { flash.style.opacity = '0' }, 100)

    // auto-save
    saveDataUrl(lastDataUrl, shotCount)

    // add thumbnail
    const img = document.createElement('img')
    img.src = lastDataUrl
    shots.appendChild(img)
    shots.scrollLeft = shots.scrollWidth
  }

  async function saveDataUrl(dataUrl, n) {
    if (typeof sys === 'undefined') return
    const path = '/home/user/Pictures/photo-' + Date.now() + '.jpg'
    await sys.write(path, dataUrl)
    status.textContent = 'saved → ' + path
    setTimeout(() => { status.textContent = '' }, 2000)
  }

  // ensure Pictures dir
  if (typeof sys !== 'undefined') {
    sys.exists('/home/user/Pictures').then(e => { if (!e) sys.write('/home/user/Pictures/.keep', '') })
  }

  startCamera()
</script>
</body>
</html>
