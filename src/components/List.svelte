<script>
  export let l = "";
  export let r1 = "";
  export let r2 = "";
  export let a = "";
</script>

<a class="group list-el grid grid-cols-6 lg:grid-cols-10" href={`e/${a}`}>
  <h3
    class={`group-hover:font-medium text-lg ${
      r1 ? "col-span-4 lg:col-span-8" : "col-span-5 lg:col-span-9"
    }`}
  >
    {l}
  </h3>
  {#if r1}
    <h3 class="group-hover:font-medium text-lg text-end">{r1}</h3>
  {/if}
  <h3 class="group-hover:font-medium text-lg text-end">
    {r2}
  </h3>
</a>
