if (!args[0]) { print('cat: missing operand') }
else {
  const content = await sys.read(args[0])
  const ext = args[0].split('.').pop()
  const langMap = { js: 'javascript', md: 'markdown', sh: 'bash', ts: 'javascript' }
  const lang = langMap[ext] ?? ''
  if (lang) {
    print('__code:' + lang + '__')
    for (const line of content.split('\n')) print(line)
    print('__endcode__')
  } else {
    print(content)
  }
}
