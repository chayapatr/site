if (!args[0]) { print('cat: missing operand') }
else {
  const path = sys.resolve(args[0])
  const content = await sys.read(path)
  const ext = path.split('.').pop()
  const langMap = { js: 'javascript', md: 'markdown', sh: 'bash', ts: 'javascript', css: 'css', json: 'javascript', html: 'bash' }
  const lang = langMap[ext] ?? ''
  if (lang) {
    print('__code:' + lang + '__')
    for (const line of content.split('\n')) print(line)
    print('__endcode__')
  } else {
    print(content)
  }
}
