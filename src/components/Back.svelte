<script>
  import { onMount } from "svelte";
  let h = undefined;
  onMount(() => {
    const history = JSON.parse(sessionStorage.getItem("history")) || [];
    sessionStorage.setItem("history", JSON.stringify(history));
    h = history.slice(-1)[0];
  });
  // fixed top-0 right-0 m-6
</script>

<li class="hover:font-medium"><a href={h}>back</a></li>
