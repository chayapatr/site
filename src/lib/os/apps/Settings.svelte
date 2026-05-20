<script lang="ts">
  import { kernel } from '$lib/os/kernel/store'
  import { onMount } from 'svelte'

  let { pid, args = [] }: { pid: number; args?: string[] } = $props()

  const wallpapers = ['w1', 'w2', 'w3', 'w4']
  const WALLPAPER_PATH = '/home/user/.config/wallpaper'
  const THEME_PATH = '/home/user/.config/theme'

  let wallpaper = $state('')
  let theme = $state<'dark' | 'light' | 'system'>('dark')
  let saved = $state(true)

  async function load() {
    try { wallpaper = (await kernel.read(WALLPAPER_PATH)).trim() } catch { wallpaper = '' }
    try { theme = (await kernel.read(THEME_PATH)).trim() as typeof theme } catch { theme = 'dark' }
  }

  function selectWallpaper(w: string) { wallpaper = w; saved = false }
  function selectTheme(t: typeof theme) { theme = t; saved = false }

  function save() {
    kernel.write(WALLPAPER_PATH, wallpaper)
    kernel.write(THEME_PATH, theme)
    saved = true
    window.dispatchEvent(new CustomEvent('wallpaper-change', { detail: wallpaper }))
    window.dispatchEvent(new CustomEvent('theme-change', { detail: theme }))
  }

  onMount(load)
</script>

<div class="flex h-full flex-col">
  <!-- header -->
  <div class="flex shrink-0 items-center justify-between border-b border-neutral-800 px-3 py-2">
    <span class="font-mono text-xs text-neutral-500">settings</span>
    <button
      class="border border-neutral-800 px-2 py-0.5 font-mono text-xs transition-colors hover:border-neutral-600 hover:text-neutral-300"
      class:text-neutral-500={saved}
      class:text-amber-500={!saved}
      onclick={save}
    >{saved ? 'saved' : 'save'}</button>
  </div>

  <div class="flex-1 overflow-y-auto">
    <!-- theme section -->
    <div class="border-b border-neutral-800 p-3">
      <div class="mb-2 font-mono text-[10px] text-neutral-600">theme</div>
      <div class="flex gap-2">
        {#each (['dark', 'light', 'system'] as const) as t}
          <button
            class="flex-1 border py-1.5 font-mono text-xs transition-colors"
            class:border-amber-400={theme === t}
            class:text-amber-400={theme === t}
            class:border-neutral-800={theme !== t}
            class:text-neutral-500={theme !== t}
            onclick={() => selectTheme(t)}
          >{t}</button>
        {/each}
      </div>
    </div>

    <!-- wallpaper section -->
    <div class="p-3">
      <div class="mb-2 font-mono text-[10px] text-neutral-600">wallpaper</div>
      <div class="grid grid-cols-2 gap-2">
        <button
          class="relative overflow-hidden border transition-colors"
          class:border-amber-400={wallpaper === ''}
          class:border-neutral-800={wallpaper !== ''}
          style="aspect-ratio: 16/9; background: black;"
          onclick={() => selectWallpaper('')}
        >
          <span class="font-mono text-xs text-neutral-700">none</span>
        </button>
        {#each wallpapers as w}
          <button
            class="relative overflow-hidden border transition-colors"
            class:border-amber-400={wallpaper === w}
            class:border-neutral-800={wallpaper !== w}
            style="aspect-ratio: 16/9;"
            onclick={() => selectWallpaper(w)}
          >
            <img src="/usr/share/wallpaper/{w}.webp" alt={w} class="h-full w-full object-cover" />
            {#if wallpaper === w}
              <div class="absolute inset-0 flex items-end justify-end p-1">
                <span class="font-mono text-[10px] text-white" style="text-shadow: 0 1px 3px black;">{w}</span>
              </div>
            {/if}
          </button>
        {/each}
      </div>
    </div>
  </div>
</div>
