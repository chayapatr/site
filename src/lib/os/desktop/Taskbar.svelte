<script lang="ts">
  import { kernel } from '$lib/os/kernel/store'

  let time = $state(new Date().toLocaleTimeString())
  setInterval(() => { time = new Date().toLocaleTimeString() }, 1000)

  function focusWindow(windowId: string | null) {
    if (!windowId) return
    kernel.update(s => {
      for (const [id, win] of s.windows) {
        win.focused = id === windowId
        if (id === windowId) win.minimized = false
      }
      return s
    })
  }
</script>

<div
  class="glass-dark fixed top-0 left-0 right-0 z-9999 flex items-center gap-2 border-b border-neutral-800 px-3"
  style="height: 32px;"
>
  <span class="mr-2 shrink-0 font-mono text-xs text-neutral-400">tidbitOS</span>

  {#each [...$kernel.processes.values()] as proc}
    {#if proc.windowId}
      {@const focused = $kernel.windows.get(proc.windowId)?.focused}
      <button
        class="border px-2 py-0.5 font-mono text-xs transition-colors"
        class:border-neutral-600={focused}
        class:text-neutral-300={focused}
        class:border-neutral-800={!focused}
        class:text-neutral-500={!focused}
        class:hover:text-neutral-300={!focused}
        class:hover:border-neutral-600={!focused}
        onclick={() => focusWindow(proc.windowId)}
      >
        {proc.name}
      </button>
    {/if}
  {/each}

  <div class="ml-auto font-mono text-xs text-neutral-600">{time}</div>
</div>
