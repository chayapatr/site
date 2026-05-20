<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0a0a0a; color: #ccc; font-family: 'Zed Mono Extended', ui-monospace, monospace; height: 100vh; display: flex; flex-direction: column; font-size: 12px; }

  /* Tab bar */
  #tabbar {
    display: flex;
    align-items: center;
    overflow-x: auto;
    border-bottom: 1px solid #262626;
    flex-shrink: 0;
  }
  #tabbar::-webkit-scrollbar { display: none; }
  .tab {
    display: flex;
    align-items: center;
    gap: 6px;
    max-width: 144px;
    padding: 6px 12px;
    font-size: 11px;
    border-right: 1px solid #262626;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    color: #525252;
    background: none;
    border-top: none;
    border-left: none;
    border-bottom: none;
    flex-shrink: 0;
    transition: color 0.15s;
    font-family: inherit;
  }
  .tab.active { color: #d4d4d4; background: #171717; }
  .tab-label { overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0; }
  .tab-loading { color: #404040; flex-shrink: 0; }
  .tab-close { opacity: 0.4; flex-shrink: 0; }
  .tab-close:hover { opacity: 1; }
  #newtab {
    padding: 6px 12px;
    font-size: 11px;
    color: #404040;
    background: none;
    border: none;
    cursor: pointer;
    flex-shrink: 0;
    font-family: inherit;
    transition: color 0.15s;
  }
  #newtab:hover { color: #a3a3a3; }

  /* Address bar */
  #toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid #262626;
    padding: 6px 12px;
    flex-shrink: 0;
  }
  #back {
    font-size: 11px;
    color: #525252;
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
    transition: color 0.15s;
    flex-shrink: 0;
  }
  #back:hover { color: #a3a3a3; }
  #urlbar {
    flex: 1;
    background: #171717;
    border: 1px solid #262626;
    color: #a3a3a3;
    font-family: inherit;
    font-size: 11px;
    padding: 2px 8px;
    outline: none;
    transition: border-color 0.15s;
  }
  #urlbar:focus { border-color: #404040; }

  /* Content */
  #content { flex: 1; overflow-y: auto; overflow-x: hidden; }

  /* Homepage */
  #homepage { padding: 24px; display: flex; flex-direction: column; gap: 24px; }
  .section-label { font-size: 10px; color: #525252; margin-bottom: 4px; }
  .hp-link {
    display: block;
    font-size: 11px;
    color: #a3a3a3;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    padding: 2px 0;
    font-family: inherit;
    transition: color 0.15s;
  }
  .hp-link:hover { color: #e5e5e5; }

  /* Document view */
  #docview { padding: 12px 16px; }
  #docview pre { font-size: 11px; color: #737373; white-space: pre-wrap; word-break: break-all; }
  #docview h1, #docview h2, #docview h3 { color: #e5e5e5; margin: 12px 0 6px; font-size: 13px; }
  #docview h2 { font-size: 12px; }
  #docview h3 { font-size: 11px; }
  #docview p { color: #a3a3a3; font-size: 11px; line-height: 1.6; margin-bottom: 8px; }
  #docview a { color: #a3a3a3; }
  #docview a:hover { color: #e5e5e5; }
  #docview code { color: #d4d4d4; }
  #docview li { color: #a3a3a3; font-size: 11px; line-height: 1.6; margin-left: 16px; }
  #docview strong { color: #d4d4d4; }

  #error { padding: 16px; font-size: 11px; color: rgba(239,68,68,0.8); }

  #webframe { width: 100%; height: 100%; border: none; flex: 1; display: block; }
</style>
</head>
<body>

<div id="tabbar">
  <div id="tabs" style="display:flex;align-items:center;"></div>
  <button id="newtab">+</button>
</div>
<div id="toolbar">
  <button id="back">←</button>
  <input id="urlbar" placeholder="search or enter url" />
</div>
<div id="content">
  <div id="homepage" style="display:none"></div>
  <div id="docview" style="display:none"></div>
  <div id="error" style="display:none"></div>
  <iframe id="webframe" style="display:none" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
</div>

<script>
const VFS_ROOTS = ['/bin','/etc','/usr','/home','/proc','/dev','/sys','/net']

function normalizeUrl(s) {
  if (!s) return ''
  if (!s) return ''
  if (s.startsWith('file://') || s.startsWith('http://') || s.startsWith('https://')) return s
  if (s.startsWith('/')) return 'file://' + s
  if (/^[\w-]+(\.[\w-]+)+(\/|$)/.test(s)) return 'https://' + s
  return 'https://' + s
}

let tabs = []
let activeIdx = 0

function newTab(url) {
  return { url: url || '', html: '', blob: null, error: '', loading: false, history: [] }
}

function renderTabs() {
  const container = document.getElementById('tabs')
  container.innerHTML = ''
  tabs.forEach((t, i) => {
    const btn = document.createElement('button')
    btn.className = 'tab' + (i === activeIdx ? ' active' : '')

    const label = document.createElement('span')
    label.className = 'tab-label'
    label.textContent = t.url ? t.url.replace('file://','') : 'new tab'
    btn.appendChild(label)

    if (t.loading) {
      const ld = document.createElement('span')
      ld.className = 'tab-loading'
      ld.textContent = '...'
      btn.appendChild(ld)
    }

    const cl = document.createElement('span')
    cl.className = 'tab-close'
    cl.textContent = '×'
    cl.onclick = e => { e.stopPropagation(); closeTab(i) }
    btn.appendChild(cl)

    btn.onclick = () => { activeIdx = i; renderTabs(); renderContent() }
    container.appendChild(btn)
  })
}

function showOnly(id) {
  for (const el of ['homepage','docview','error','webframe']) {
    document.getElementById(el).style.display = 'none'
  }
  const target = document.getElementById(id)
  target.style.display = id === 'webframe' ? 'block' : (id === 'homepage' || id === 'docview' ? 'block' : 'block')
  if (id === 'webframe') {
    document.getElementById('content').style.overflow = 'hidden'
    document.getElementById('content').style.display = 'flex'
    document.getElementById('content').style.flexDirection = 'column'
  } else {
    document.getElementById('content').style.overflow = ''
    document.getElementById('content').style.display = ''
  }
}

function renderContent() {
  const t = tabs[activeIdx]
  document.getElementById('urlbar').value = t.url

  if (t.error) {
    showOnly('error')
    document.getElementById('error').textContent = t.error
  } else if (!t.url && !t.html && !t.blob) {
    showOnly('homepage')
    renderHomepage()
  } else if (t.blob || t.url.startsWith('http://') || t.url.startsWith('https://')) {
    showOnly('webframe')
    document.getElementById('webframe').src = t.blob || t.url
  } else if (t.html) {
    showOnly('docview')
    document.getElementById('docview').innerHTML = t.html
    document.getElementById('content').scrollTop = 0
  }
}

function renderHomepage() {
  const hp = document.getElementById('homepage')
  const sites = ['info.cern.ch','wikipedia.org','from.pub','wiby.me','poolsuite.net','archive.org','theuselessweb.com','example.com']
  hp.innerHTML = `
    <div>
      <div class="section-label">https://</div>
      ${sites.map(s => `<button class="hp-link" data-url="https://${s}">${s}</button>`).join('')}
    </div>
  `
  hp.querySelectorAll('[data-url]').forEach(btn => {
    btn.onclick = () => navigate(btn.dataset.url)
  })
}

async function renderMarkdown(text) {
  const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  let html = esc(text)
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  html = html.replace(/`(.+?)`/g, '<code>$1</code>')
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>')
  html = html.replace(/\n\n+/g, '</p><p>')
  return '<p>' + html + '</p>'
}

async function loadTab(idx, url) {
  tabs[idx].error = ''
  tabs[idx].url = url
  tabs[idx].loading = true
  renderTabs()
  if (!url) { tabs[idx].loading = false; renderTabs(); renderContent(); return }

  try {
    if (url.startsWith('file://')) {
      const path = url.slice('file://'.length)
      const raw = await sys.read(path)
      if (path.endsWith('.md')) {
        tabs[idx].html = await renderMarkdown(raw)
        tabs[idx].blob = null
      } else if (path.endsWith('.html') || path.endsWith('.htm')) {
        const blob = new Blob([raw], { type: 'text/html' })
        tabs[idx].blob = URL.createObjectURL(blob)
        tabs[idx].html = ''
      } else {
        tabs[idx].html = '<pre>' + raw.replace(/&/g,'&amp;').replace(/</g,'&lt;') + '</pre>'
        tabs[idx].blob = null
      }
    } else if (url.startsWith('http://') || url.startsWith('https://')) {
      tabs[idx].html = ''
      tabs[idx].blob = null
    } else {
      throw new Error('unknown scheme: ' + url)
    }
  } catch(e) {
    tabs[idx].error = String(e)
  }

  tabs[idx].loading = false
  renderTabs()
  renderContent()
  sys.setTitle(tabs[idx].url.replace('file://','') || 'Browser')
}

function navigate(url, idx) {
  if (idx === undefined) idx = activeIdx
  const normalized = normalizeUrl(url)
  tabs[idx].history = [tabs[idx].url, ...tabs[idx].history]
  loadTab(idx, normalized)
}

function goBack() {
  const t = tabs[activeIdx]
  if (!t.history.length) return
  const prev = t.history[0]
  tabs[activeIdx].history = t.history.slice(1)
  loadTab(activeIdx, prev)
}

function openTab(url) {
  tabs.push(newTab(url ? normalizeUrl(url) : ''))
  activeIdx = tabs.length - 1
  renderTabs()
  loadTab(activeIdx, tabs[activeIdx].url)
}

function closeTab(idx) {
  if (tabs.length === 1) return
  tabs.splice(idx, 1)
  activeIdx = Math.min(activeIdx, tabs.length - 1)
  renderTabs()
  renderContent()
}

document.getElementById('back').onclick = goBack
document.getElementById('newtab').onclick = () => openTab()
document.getElementById('urlbar').addEventListener('keydown', e => {
  if (e.key === 'Enter') navigate(e.target.value)
})
document.getElementById('docview').addEventListener('click', e => {
  const a = e.target.closest('a')
  if (!a) return
  e.preventDefault()
  navigate(a.getAttribute('href'))
})

const initUrl = sys.args[0] ? normalizeUrl(sys.args[0]) : ''
tabs.push(newTab(initUrl))
renderTabs()
loadTab(0, initUrl)
</script>
</body>
</html>
