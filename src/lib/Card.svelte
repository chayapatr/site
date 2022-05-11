<script lang="ts">
  // export let amount
  export let items: {name: string, link: string, img?: string}[]
  export let path: string
  // const items = Array.from('x'.repeat(parseInt(amount)))
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
  {#each items as item}
  <div class="group pb-2 border-2 border-neutral-900 hover:shadow-md transition-all hover:bg-slate-900">
    <a href={path}{item.link}>
      <div class="bg-gray-300 aspect-video">
        {#if item.img}
          <img src={item.img} class="w-full h-full object-cover" alt="" />
        {/if}
      </div>
      <div class="text-2xl p-4 group-hover:text-neutral-100">{item.name}</div>
    </a>
  </div>
  {/each}
</div>