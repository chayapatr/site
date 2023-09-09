<script>
    const sizes = [
      6, 7, 8, 9, 10, 12, 14, 16, 18, 21, 24, 28, 32, 36, 42, 48, 55, 63, 73, 84, 96
   ]
</script>

<!-- https://spencermortensen.com/articles/typographic-scale/ -->

<h1 class="text-4xl">Typography</h1>
<div class="flex flex-wrap items-end leading-none gap-x-4">
    {#each sizes as size}
        <div style={`font-size: ${size}px`}>a</div>
    {/each}
</div>
