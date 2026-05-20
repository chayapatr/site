<script lang="ts">
  import { kernel } from '$lib/os/kernel/store'

  let { pid, args = [] }: { pid: number; args?: string[] } = $props()

  let path = $state(args[0] ?? '/home/user/untitled.txt')
  let content = $state('')
  let saved = $state(true)
  let error = $state('')

  async function load() {
    try {
      content = await kernel.read(path)
    } catch {
      content = ''
    }
    saved = true
    kernel.setTitle(pid, path.split('/').pop() ?? path)
  }

  function save() {
    try {
      kernel.write(path, content)
      saved = true
      error = ''
    } catch (e) {
      error = String(e)
    }
  }

  function onInput() {
    saved = false
  }

  load()
</script>

<div class="flex h-full flex-col">
  <div class="flex shrink-0 items-center gap-2 border-b border-neutral-800 px-3 py-2">
    <span class="truncate font-mono text-xs text-neutral-600">{path}</span>
    {#if !saved}
      <span class="font-mono text-xs text-amber-600">*</span>
    {/if}
    <button
      class="ml-auto border border-neutral-800 px-2 py-0.5 font-mono text-xs text-neutral-500 hover:text-neutral-300 hover:border-neutral-600 transition-colors"
      onclick={save}
    >save</button>
  </div>

  {#if error}
    <div class="border-b border-neutral-800 px-3 py-1 font-mono text-xs text-red-500/80">{error}</div>
  {/if}

  <textarea
    class="flex-1 resize-none bg-transparent p-3 font-mono text-xs text-neutral-300 outline-none placeholder:text-neutral-700 select-text"
    bind:value={content}
    oninput={onInput}
  ></textarea>
</div>
