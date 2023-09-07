<script>
    export let x = 10
    export let y = 10

    export let right = false
    export let bottom = false

    export let show = false
    export let color
    export let p = 4

    let el
    let drag = false

    const g = (e) => {
      if(drag) {
          right ? x -= e.movementX : x += e.movementX
          bottom ? y -= e.movementY : y += e.movementY
        }
    }
</script>

<svelte:window on:mousemove={g}  on:mouseup={() => drag = false} />
<div
    class={`relative md:absolute hover:cursor-grab select-none md:border md:shadow-md md:border-neutral-300 md:p-${p} border-dashed md:border-2  ${color ? color : "md:bg-gray-50"}`}
    bind:this={el}
    on:mousedown={() => drag = true}
    style={`${right ? "right:" : "left:"} ${x}px; ${bottom ? "bottom: " : "top: "} ${y}px`}
>
    {#if show}
        <div>{x} {y} {drag}</div>
    {/if}
    <slot />
</div>
