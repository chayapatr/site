<script>
    let el
    export let left = 0
    export let top = 0
    let drag = false
    export let show = false

    const g = (e) => {
      if(drag) {
          left += e.movementX
          top += e.movementY
        }
    }
</script>

<svelte:window on:mousemove={g}  on:mouseup={() => drag = false} />
<div class={`fixed hover:cursor-grab select-none border shadow-md border-neutral-300 p-4 bg-gradient-to-b from-white to-neutral-50`} bind:this={el} on:mousedown={() => drag = true} style={`left: ${left}px; top: ${top}px`}>
    {#if show}
    <div>{left} {top} {drag}</div>
    {/if}
    <slot />
</div>
