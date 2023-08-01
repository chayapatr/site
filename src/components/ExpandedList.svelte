<script>
  import List from "./List.svelte";

  export let title;
  export let list;

  let expand = false;
</script>

<div class="grid gap-3">
  <div
    class={`list-el hover:cursor-pointer ${expand && "font-medium"}`}
    on:click={() => (expand = !expand)}
  >
    [{expand ? "-" : "+"}] {title} ({list.length}{" "} items)
  </div>
  <div class={`grid gap-5  mb-2 ${expand || "hidden"}`}>
    {#each list as el}
      <List l={"• " + el?.l} r1={el?.r1} r2={el?.r2} />
    {/each}
  </div>
</div>
