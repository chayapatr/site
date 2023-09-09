<script>
    export let org = "#000"
    export let shades = []
    export let show = false

    // const getTone500 = variation => variation.filter(x => x.split(",")[2].slice(0,-1) === " 50%")
</script>


<div class="flex">
    <div
    class={`w-10 aspect-square text-xs mr-4`}
    style={`background-color: ${org}`}
    ></div>
    <!-- <div
    class={`mr-5 w-10 aspect-square text-xs`}
    style={`background-color: ${getTone500(shades)}`}
    ></div> -->
{#each shades as color}
    <div
        class={`w-10 aspect-square text-xs flex justify-center items-center`}
        style={`background-color: ${color}`}
        ><!--{#if show}{color.split(",")[2].slice(0,-1)}{/if}--></div>
    {/each}
</div>
