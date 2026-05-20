<script lang="ts">
  import { kernel } from '$lib/os/kernel/store'
  import { soundd } from '$lib/os/kernel/soundd'
  import { onMount } from 'svelte'

  let { pid, args = [] }: { pid: number; args?: string[] } = $props()

  const wallpapers = ['w1', 'w2', 'w3', 'w4']
  const WALLPAPER_PATH = '/home/user/.config/wallpaper'
  const THEME_PATH = '/home/user/.config/theme'
  const DOTFILES_PATH = '/home/user/.config/show-dotfiles'

  let wallpaper = $state('')
  let theme = $state<'dark' | 'light' | 'system'>('dark')
  let showDotfiles = $state(true)
  let muted = $state(false)
  let saved = $state(true)

  async function load() {
    try { wallpaper = (await kernel.read(WALLPAPER_PATH)).trim() } catch { wallpaper = '' }
    try { theme = (await kernel.read(THEME_PATH)).trim() as typeof theme } catch { theme = 'dark' }
    try { showDotfiles = (await kernel.read(DOTFILES_PATH)).trim() !== 'false' } catch { showDotfiles = true }
    muted = soundd.isMuted
  }

  function selectWallpaper(w: string) { wallpaper = w; saved = false }
  function selectTheme(t: typeof theme) { theme = t; saved = false }

  function toggleDotfiles() {
    showDotfiles = !showDotfiles
    kernel.write(DOTFILES_PATH, showDotfiles ? 'true' : 'false')
    window.dispatchEvent(new CustomEvent('dotfiles-change', { detail: showDotfiles }))
  }

  function toggleSound() {
    muted = !muted
    if (muted) soundd.mute(); else soundd.unmute()
  }

  function save() {
    kernel.write(WALLPAPER_PATH, wallpaper)
    kernel.write(THEME_PATH, theme)
    saved = true
    window.dispatchEvent(new CustomEvent('wallpaper-change', { detail: wallpaper }))
    window.dispatchEvent(new CustomEvent('theme-change', { detail: theme }))
  }

  onMount(() => {
    load()
    const handler = (e: Event) => { muted = (e as CustomEvent<boolean>).detail }
    window.addEventListener('soundd-mute-change', handler)
    return () => window.removeEventListener('soundd-mute-change', handler)
  })
</script>

<div class="flex h-full flex-col">
  <!-- header -->
  <div class="flex shrink-0 items-center justify-between border-b border-neutral-800 px-3 py-2">
    <span class="font-mono text-xs text-neutral-500">settings</span>
    <button
      class="font-mono text-xs transition-colors"
      class:text-neutral-600={saved}
      class:hover:text-neutral-400={saved}
      class:text-neutral-300={!saved}
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
            class:border-neutral-400={theme === t}
            class:text-neutral-300={theme === t}
            class:border-neutral-800={theme !== t}
            class:text-neutral-600={theme !== t}
            onclick={() => selectTheme(t)}
          >{t}</button>
        {/each}
      </div>
    </div>

    <!-- system section -->
    <div class="border-b border-neutral-800 p-3">
      <div class="mb-2 font-mono text-[10px] text-neutral-600">system</div>
      <div class="flex flex-col gap-1.5">
        <div class="flex items-center justify-between font-mono text-xs">
          <span class="text-neutral-500">show dot-files</span>
          <button
            class="w-8 text-right transition-colors"
            class:text-neutral-300={showDotfiles}
            class:text-neutral-700={!showDotfiles}
            onclick={toggleDotfiles}
          >{showDotfiles ? 'on' : 'off'}</button>
        </div>
        <div class="flex items-center justify-between font-mono text-xs">
          <span class="text-neutral-500">sound</span>
          <button
            class="w-8 text-right transition-colors"
            class:text-neutral-300={!muted}
            class:text-neutral-700={muted}
            onclick={toggleSound}
          >{muted ? 'off' : 'on'}</button>
        </div>
      </div>
    </div>

    <!-- wallpaper section -->
    <div class="p-3">
      <div class="mb-2 font-mono text-[10px] text-neutral-600">wallpaper</div>
      <div class="grid grid-cols-2 gap-2">
        <button
          class="relative overflow-hidden border transition-colors"
          class:border-neutral-400={wallpaper === ''}
          class:border-neutral-800={wallpaper !== ''}
          style="aspect-ratio: 16/9; background: black;"
          onclick={() => selectWallpaper('')}
        >
          <span class="font-mono text-xs text-neutral-700">none</span>
        </button>
        {#each wallpapers as w}
          <button
            class="relative overflow-hidden border transition-colors"
            class:border-neutral-400={wallpaper === w}
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
