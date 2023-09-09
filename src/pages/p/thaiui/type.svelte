<script>
    // [ 6, 7, 8, 9, 10, 12, 14, 16, 18, 21, 24, 28, 32, 36, 42, 48, 55, 63, 73, 84, 96 ]
    import Draggable from "../../../components/Draggable.svelte"

    let f0 = 12
    let r = 2
    let n = 5
    let steps = 21
    const step = (f0, r, n, i) => f0 * Math.pow(r, i/n)
    // let sizes = [...Array(21).keys()].map(x => x - 5).map(x => Math.round(step(f0, r, n ,x)))
</script>

<!-- https://spencermortensen.com/articles/typographic-scale/ -->

<h1 class="text-4xl">Typography</h1>
    <div>Formula = f0 * Math.pow(r, i/n) → {f0} * Math.pow({r}, i/{n})</div>
    <div id="setting" class="grid grid-cols-2 gap-4">
        <div>
            <input type="range" id="f0" name="f0" min="10" max="20" bind:value={f0} />
            <label for="f0">f0 (base size) = {f0}</label>
            </div>
        <div>
            <input type="range" id="n" name="n" min="1" max="15" bind:value={n} />
            <label for="n">n (steps to * 2) = {n}</label>
        </div>
        <div>
            <input type="range" id="r" name="r" min="1" max="3" step="0.05" bind:value={r} />
            <label for="r">ratio = {r}</label>
        </div>
        <div>
            <input type="range" id="steps" name="steps" min="1" max="60" bind:value={steps} />
            <label for="steps">steps = {steps}</label>
        </div>
    </div>
    <button class="px-2 py-1 bg-neutral-100 border-2" on:click={() => {
      f0 = 12; r = 2; n = 5; steps = 21;
    }}>Reset (f0 = 12, r = 2, n = 5, steps = 21)</button>
    <div class="">
        <h1 class="text-2xl">Typographic Setting</h1>
    </div>
<div class="flex flex-wrap items-end leading-none gap-x-4 overflow-y-hidden">
    {#each [...Array(steps).keys()].map(x => x - 5).map(x => Math.round(step(f0, r, n ,x))) as size}
        <div style={`font-size: ${size}px;`} class="grid gap-2">
            <div>
                a
            </div>
            <div class="text-[9px]">
                 {size}
            </div>
        </div>
    {/each}
</div>

<style>
    #setting > div {
        @apply flex flex-col gap-2;
    }
</style>
