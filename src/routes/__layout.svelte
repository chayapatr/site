<script>
  import "../app.css";
  import Header from "$lib/header/Header.svelte";
  import Footer from "$lib/Footer.svelte";
</script>

<Header/>
<div class="p-2 pt-12">
  <slot />
</div>
<Footer />
