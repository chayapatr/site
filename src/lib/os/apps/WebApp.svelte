<script lang="ts">
  import { kernel } from '$lib/os/kernel/store'
  import { onMount, onDestroy } from 'svelte'

  let { pid, args = [] }: { pid: number; args?: string[] } = $props()

  let iframeEl: HTMLIFrameElement | null = null
  let blobUrl = $state('')

  function makeBlobUrl(html: string): string {
    const bridgeCode = `(function(){
  let _id=0,_p={}
  window.addEventListener('message',e=>{
    const d=e.data
    if(!d||typeof d!=='object')return
    const{id,result,error}=d
    if(_p[id]){error?_p[id].reject(new Error(error)):_p[id].resolve(result);delete _p[id]}
  })
  function call(m,a){return new Promise((res,rej)=>{const id=++_id;_p[id]={resolve:res,reject:rej};parent.postMessage({id,method:m,args:a},'*')})}
  const _required={}
  window.sys={
    read:(p)=>call('read',[p]),write:(p,c)=>call('write',[p,c]),remove:(p)=>call('remove',[p]),
    list:(p)=>call('list',[p]),stat:(p)=>call('stat',[p]),exists:(p)=>call('exists',[p]),
    spawn:(a,r)=>call('spawn',[a,r]),kill:(p)=>call('kill',[p]),ps:()=>call('ps',[]),
    env:()=>call('env',[]),setenv:(k,v)=>call('setenv',[k,v]),
    setTitle:(t)=>call('setTitle',[t]),exit:()=>call('exit',[]),
    require:async(p)=>{
      if(_required[p])return _required[p]
      const code=await call('read',[p])
      const module={exports:{}}
      const fn=new Function('module','exports','define',code)
      fn(module,module.exports,undefined)
      _required[p]=module.exports
      return module.exports
    },
    fetch:(url,opts)=>call('fetch',[url,opts]),
  }
})()`
    const bridge = '<scr' + 'ipt>' + bridgeCode + '</scr' + 'ipt>'
    const injected = /<head[\s>]/i.test(html)
      ? html.replace(/<head([\s>])/i, `<head$1${bridge}`)
      : bridge + '\n' + html
    const blob = new Blob([injected], { type: 'text/html' })
    return URL.createObjectURL(blob)
  }

  function handleMessage(e: MessageEvent) {
    if (!iframeEl || e.source !== iframeEl.contentWindow) return
    const d = e.data
    if (!d || typeof d !== 'object') return
    const { id, method, args: a } = d
    if (!id || !method) return
    ;(async () => {
      try {
        let result: unknown
        switch (method) {
          case 'read':     result = await kernel.read(a[0]); break
          case 'write':    kernel.write(a[0], a[1]); result = null; break
          case 'remove':   kernel.remove(a[0]); result = null; break
          case 'list':     result = await kernel.list(a[0]); break
          case 'stat':     result = await kernel.stat(a[0]); break
          case 'exists':   result = await kernel.exists(a[0]); break
          case 'spawn':    result = kernel.spawn(a[0], a[1]); break
          case 'kill':     kernel.kill(a[0]); result = null; break
          case 'ps':       result = kernel.ps(); break
          case 'env':      result = { ...kernel.env }; break
          case 'setenv':   kernel.setEnv(a[0], a[1]); result = null; break
          case 'setTitle': kernel.setTitle(pid, a[0]); result = null; break
          case 'exit':     kernel.kill(pid); result = null; break
          case 'fetch': {
            const res = await fetch(a[0], a[1] ?? {})
            result = { ok: res.ok, status: res.status, text: await res.text() }
            break
          }
          default: throw new Error(`unknown syscall: ${method}`)
        }
        iframeEl?.contentWindow?.postMessage({ id, result }, '*')
      } catch (err) {
        iframeEl?.contentWindow?.postMessage({ id, error: err instanceof Error ? err.message : String(err) }, '*')
      }
    })()
  }

  onMount(async () => {
    window.addEventListener('message', handleMessage)
    const path = args[0] ?? ''
    if (path) {
      await kernel.init()
      const html = await kernel.read(path).catch((e) => `<p style="font-family:monospace;padding:1rem;color:#f88">${e.message}</p>`)
      blobUrl = makeBlobUrl(html)
    }
  })

  onDestroy(() => {
    window.removeEventListener('message', handleMessage)
    if (blobUrl) URL.revokeObjectURL(blobUrl)
  })
</script>

<iframe
  bind:this={iframeEl}
  class="h-full w-full border-none"
  src={blobUrl || undefined}
  sandbox="allow-scripts allow-same-origin allow-downloads"
  allow="camera; microphone; display-capture"
  title="webapp"
></iframe>
