<script>
  import { onMount } from "svelte";
  let h = [];
  onMount(() => {
    const url = window.location.pathname;
    const history = JSON.parse(sessionStorage.getItem("history")) || [];
    history.push(url);
    sessionStorage.setItem("history", JSON.stringify(history));
    h = history.slice(-5).reverse();
  });
  // fixed top-0 right-0 m-6
</script>

<div class={`hidden md:block text-lg`}>
  <ul class="flex flex-col items-end text-sm">
    {#each h as m}
      <a href={m} class="hover:font-medium"><li>{m}</li></a>
    {/each}
  </ul>
</div>
