<script lang="ts">
  import { kernel } from '$lib/os/kernel/store'
  import { onMount, onDestroy } from 'svelte'

  let { pid }: { pid: number } = $props()

  let tick = $state(0)
  let interval: ReturnType<typeof setInterval>

  onMount(() => {
    interval = setInterval(() => tick++, 1000)
  })
  onDestroy(() => clearInterval(interval))

  let procs = $derived([...$kernel.processes.values()])
  let wins = $derived([...$kernel.windows.values()])
  // tick is read here to force re-evaluation every second for uptime
  let uptimeSec = $derived(tick >= 0 ? Math.floor((Date.now() - $kernel.startedAt) / 1000) : 0)
  let uptimeStr = $derived(`${Math.floor(uptimeSec / 60)}m ${uptimeSec % 60}s`)

  function killProc(p: number) {
    kernel.kill(p)
  }

  function focusWin(windowId: string | null) {
    if (!windowId) return
    kernel.update(s => {
      for (const [id, w] of s.windows) {
        w.focused = id === windowId
        if (id === windowId) {
          w.minimized = false
          let maxZ = 0
          for (const ww of s.windows.values()) maxZ = Math.max(maxZ, ww.zIndex)
          w.zIndex = maxZ + 1
        }
      }
      return s
    })
  }
</script>

<div class="flex h-full flex-col font-mono text-xs">
  <!-- system bar -->
  <div class="flex shrink-0 items-center gap-4 border-b border-neutral-800 px-3 py-2 text-neutral-600">
    <span>uptime <span class="text-neutral-400">{uptimeStr}</span></span>
    <span>processes <span class="text-neutral-400">{procs.length}</span></span>
    <span>windows <span class="text-neutral-400">{wins.length}</span></span>
    <span>next pid <span class="text-neutral-400">{$kernel.nextPid}</span></span>
  </div>

  <div class="flex flex-1 overflow-hidden">
    <!-- processes -->
    <div class="flex w-1/2 flex-col border-r border-neutral-800">
      <div class="shrink-0 border-b border-neutral-800 px-3 py-1.5 text-neutral-600">processes</div>
      <div class="flex-1 overflow-y-auto">
        {#each procs as p (p.pid)}
          <div
            class="flex items-center justify-between border-b border-neutral-900 px-3 py-1.5"
            class:text-neutral-400={p.status === 'running'}
            class:text-neutral-700={p.status === 'stopped'}
          >
            <div class="flex items-center gap-3">
              <span class="w-6 text-neutral-600">{p.pid}</span>
              <span>{p.name}</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-neutral-700">{p.status}</span>
              {#if p.pid !== pid}
                <button
                  class="text-neutral-700 hover:text-red-400 transition-colors"
                  onclick={() => killProc(p.pid)}
                >[x]</button>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- right column: windows + env -->
    <div class="flex w-1/2 flex-col overflow-hidden">
      <!-- windows -->
      <div class="shrink-0 border-b border-neutral-800 px-3 py-1.5 text-neutral-600">windows</div>
      <div class="flex-1 overflow-y-auto border-b border-neutral-800">
        {#each wins as w (w.id)}
          <button
            class="flex w-full items-center justify-between border-b border-neutral-900 px-3 py-1.5 text-left transition-colors hover:bg-neutral-800/30"
            class:text-amber-400={w.focused}
            class:text-neutral-400={!w.focused}
            class:opacity-40={w.minimized}
            onclick={() => focusWin(w.id)}
          >
            <span>{w.title}</span>
            <span class="text-neutral-600">{w.size.width}×{w.size.height}</span>
          </button>
        {/each}
      </div>

      <!-- env -->
      <div class="shrink-0 border-b border-neutral-800 px-3 py-1.5 text-neutral-600">env</div>
      <div class="flex-1 overflow-y-auto">
        {#each Object.entries($kernel.env) as [k, v]}
          <div class="flex items-center gap-2 border-b border-neutral-900 px-3 py-1.5">
            <span class="text-neutral-600">{k}</span>
            <span class="text-neutral-400">{v}</span>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
