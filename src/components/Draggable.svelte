<script>
    import { onMount } from 'svelte'
    import {slide, fly} from 'svelte/transition'

    export let x = 10
    export let y = 10
    export let right = false
    export let bottom = false

    export let show = true
    export let rand = false

    export let color
    export let p

    let el
    let drag = false

    const g = (e) => {
      if(drag) {
          right ? x -= e.movementX : x += e.movementX
          bottom ? y -= e.movementY : y += e.movementY
        }
    }

    onMount(() => {
      let pos = {
        x, y
      }

      const c = {
        maxw: 768,
        s: 10,
      }
      const dp = {
        w: document.documentElement.clientWidth,
        h: document.documentElement.clientHeight,
        sh: document.documentElement.scrollHeight
      }
      const elp = {
        w: el.offsetWidth,
        h: el.offsetHeight
      }
      const sp = {
        w: (dp.w - c.maxw) / 2 - elp.w,
        h: dp.h - elp.h
      }

      const r1 = (pos, v) => {
        console.log(sp.sh)
        const r = {
          x: Math.floor((Math.random() * sp.w + c.s) / v),
          y: Math.floor((Math.random() * sp.h + c.s) / v)
        }
        console.log(r)
        return r
      }

      const r2 = (pos, v) => {
        const r = {
          x: pos.x + Math.floor(Math.random() * v),
          y: pos.y + Math.floor(Math.random() * v)
        }
        return r
      }

      if(rand) pos = r1(pos, 2)
      else pos = r2(pos, 10)

      x = pos.x
      y = pos.y

    })
</script>

<svelte:window on:mousemove={g}  on:mouseup={() => drag = false} />

<div
    class={`relative md:absolute hover:cursor-grab select-none md:border md:shadow-sm md:hover:shadow-md md:border-neutral-300 transition-shadow ${p || "md:p-4" } border-dashed md:border-2  ${color ? color : "md:bg-white"}`}
    bind:this={el}
    on:mousedown={() => drag = true}
    style={`${right ? "right:" : "left:"} ${x}px; ${bottom ? "bottom: " : "top: "} ${y}px`}
    transition:slide
>
    {#if drag && show}
        <div transition:slide class="text-xs text-teal-500 mb-2">X: {x}, Y: {y}</div>
    {/if}
    <slot />
    {#if drag && show}
        <div transition:slide class="text-xs text-teal-500 mt-2">drag: {drag}</div>
    {/if}
</div>
