<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { height: 100%; background: transparent; overflow: hidden; }
  #editor { width: 100%; height: 100%; }
  #toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px;
    border-bottom: 1px solid #262626;
    font-family: 'Zed Mono Extended', ui-monospace, monospace;
    font-size: 11px;
    color: #525252;
    background: #21222c;
  }
  #filename { color: #a3a3a3; }
  #save-btn {
    margin-left: auto;
    padding: 2px 8px;
    border: 1px solid #404040;
    background: transparent;
    color: #a3a3a3;
    font-family: inherit;
    font-size: 11px;
    cursor: pointer;
  }
  #save-btn:hover { border-color: #737373; color: #e5e5e5; }
  #container { height: calc(100% - 28px); }
</style>
</head>
<body>
<div id="toolbar">
  <span id="filename">untitled</span>
  <button id="save-btn">save</button>
</div>
<div id="container"></div>

<script src="https://cdn.jsdelivr.net/npm/monaco-editor@0.52.0/min/vs/loader.js"></script>
<script>
  const args = typeof sys !== 'undefined' ? sys.env().then(e => e) : Promise.resolve({})
  let filePath = null

  require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.0/min/vs' } })
  require(['vs/editor/editor.main'], function() {
    monaco.editor.defineTheme('dracula', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'ff79c6' },
        { token: 'string', foreground: 'f1fa8c' },
        { token: 'number', foreground: 'bd93f9' },
        { token: 'regexp', foreground: 'f1fa8c' },
        { token: 'type', foreground: '8be9fd', fontStyle: 'italic' },
        { token: 'class', foreground: '50fa7b' },
        { token: 'function', foreground: '50fa7b' },
        { token: 'variable', foreground: 'f8f8f2' },
        { token: 'constant', foreground: 'bd93f9' },
        { token: 'operator', foreground: 'ff79c6' },
        { token: 'delimiter', foreground: 'f8f8f2' },
        { token: 'tag', foreground: 'ff79c6' },
        { token: 'attribute.name', foreground: '50fa7b' },
        { token: 'attribute.value', foreground: 'f1fa8c' },
      ],
      colors: {
        'editor.background': '#282a36',
        'editor.foreground': '#f8f8f2',
        'editor.lineHighlightBackground': '#44475a',
        'editor.selectionBackground': '#44475a',
        'editor.inactiveSelectionBackground': '#44475a80',
        'editorLineNumber.foreground': '#6272a4',
        'editorLineNumber.activeForeground': '#f8f8f2',
        'editorCursor.foreground': '#f8f8f2',
        'editorWhitespace.foreground': '#44475a',
        'editorIndentGuide.background': '#44475a',
        'editor.findMatchBackground': '#ffb86c50',
        'editor.findMatchHighlightBackground': '#ffffff20',
        'editorWidget.background': '#21222c',
        'editorWidget.border': '#6272a4',
        'input.background': '#21222c',
        'input.foreground': '#f8f8f2',
        'scrollbarSlider.background': '#44475a80',
        'scrollbarSlider.hoverBackground': '#44475aaa',
      }
    })

    const editor = monaco.editor.create(document.getElementById('container'), {
      value: '',
      language: 'plaintext',
      theme: 'dracula',
      fontSize: 12,
      fontFamily: "'Zed Mono Extended', ui-monospace, monospace",
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      quickSuggestions: true,
      suggestOnTriggerCharacters: true,
      autoClosingBrackets: 'always',
      autoClosingQuotes: 'always',
      autoClosingTags: true,
      formatOnType: false,
      padding: { top: 8 },
    })

    if (typeof sys !== 'undefined') {
      sys.setTitle('Editor')

      // load file if passed via sys.args[0]
      const fileArg = sys.args && sys.args[0] ? sys.args[0] : null
      if (fileArg) {
        filePath = fileArg
        const name = fileArg.split('/').pop()
        document.getElementById('filename').textContent = name
        sys.read(fileArg).then(content => {
          editor.setValue(content)
          const ext = fileArg.split('.').pop()
          const langMap = { js: 'javascript', ts: 'typescript', md: 'markdown', html: 'html', app: 'html', css: 'css', json: 'json', sh: 'shell', py: 'python', strudel: 'javascript' }
          if (langMap[ext]) monaco.editor.setModelLanguage(editor.getModel(), langMap[ext])
          sys.setTitle('Editor — ' + name)
        }).catch(() => {})
      }

      function save() {
        if (!filePath) {
          const p = prompt('Save as:', '/home/user/untitled.js')
          if (!p) return
          filePath = p
          document.getElementById('filename').textContent = p.split('/').pop()
          sys.setTitle('Editor — ' + p.split('/').pop())
        }
        sys.write(filePath, editor.getValue())
        document.getElementById('save-btn').textContent = 'saved'
        setTimeout(() => { document.getElementById('save-btn').textContent = 'save' }, 1500)
      }

      document.getElementById('save-btn').onclick = save

      editor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
        save
      )

      // also catch at document level in case monaco doesn't have focus
      document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 's') {
          e.preventDefault()
          save()
        }
      })
    }
  })
</script>
</body>
</html>
