<script lang="ts">
  export let amount = "20"
  const items = Array.from('x'.repeat(parseInt(amount)))
</script>

<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
  {#each items as item}
    <div class="bg-gray-300 aspect-square"></div>
  {/each}
</div>