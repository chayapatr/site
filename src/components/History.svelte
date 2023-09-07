<script>
    import { onMount } from 'svelte'
    let h = []
    onMount(() => {
      const url = window.location.pathname
      const history = JSON.parse(sessionStorage.getItem("history")) || []
      history.push(url)
      sessionStorage.setItem("history", JSON.stringify(history))
      h = history.slice(-5).reverse()
    })
</script>

<div class={`hidden md:block fixed top-0 right-0 m-6 text-lg`}>
 <ul class="text-purple-500 text-sm flex flex-col items-end">
     {#each h as m}
         <a href={m} class="hover:bg-yellow-300 hover:text-black"><li>{m}</li></a>
    {/each}
 </ul>
</div>
