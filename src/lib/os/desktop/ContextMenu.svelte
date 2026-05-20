<script lang="ts">
  export type MenuItem =
    | { label: string; action: () => void; danger?: boolean }
    | { label: string; children: MenuItem[] }
    | { separator: true }

  let {
    x,
    y,
    items,
    onclose
  }: {
    x: number
    y: number
    items: MenuItem[]
    onclose: () => void
  } = $props()

  let submenuOpen = $state<string | null>(null)

  function handleClick(item: MenuItem) {
    if ('separator' in item) return
    if ('children' in item) return
    item.action()
    onclose()
  }
</script>

<svelte:window
  onmousedown={onclose}
  onkeydown={(e) => e.key === 'Escape' && onclose()}
/>

<div
  class="fixed z-[9999] min-w-40 border py-0.5 shadow-lg backdrop-blur-sm"
  style="left:{Math.min(x, window.innerWidth - 176)}px; top:{Math.min(y, window.innerHeight - 200)}px; background: var(--os-surface); border-color: var(--os-border);"
  onmousedown={(e) => e.stopPropagation()}
  role="menu"
>
  {#each items as item}
    {#if 'separator' in item}
      <div class="my-0.5 border-t border-neutral-800"></div>
    {:else if 'children' in item}
      <div
        class="group relative flex w-full items-center justify-between px-3 py-1.5 font-mono text-xs transition-colors"
        style="color: var(--os-text);"
        role="menuitem"
        onmouseenter={() => submenuOpen = item.label}
        onmouseleave={() => submenuOpen = null}
      >
        <span>{item.label}</span>
        <span class="text-neutral-600">›</span>
        {#if submenuOpen === item.label}
          <div
            class="absolute top-0 left-full min-w-40 border py-0.5 shadow-lg backdrop-blur-sm"
            style="background: var(--os-surface); border-color: var(--os-border);"
            onmouseenter={() => submenuOpen = item.label}
          >
            {#each item.children as child}
              {#if 'separator' in child}
                <div class="my-0.5 border-t border-neutral-800"></div>
              {:else if !('children' in child)}
                <button
                  class="menu-item flex w-full px-3 py-1.5 text-left font-mono text-xs transition-colors"
                  class:text-red-400={child.danger}
                  style={!child.danger ? 'color: var(--os-text);' : ''}
                  onclick={() => { child.action(); onclose() }}
                  role="menuitem"
                >{child.label}</button>
              {/if}
            {/each}
          </div>
        {/if}
      </div>
    {:else}
      <button
        class="menu-item flex w-full px-3 py-1.5 text-left font-mono text-xs transition-colors"
        class:text-red-400={item.danger}
        style={!item.danger ? 'color: var(--os-text);' : ''}
        onclick={() => handleClick(item)}
        role="menuitem"
      >{item.label}</button>
    {/if}
  {/each}
</div>
