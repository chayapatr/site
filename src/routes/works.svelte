<script>
  import Card from "$lib/Card.svelte";
  import { projects, background } from "../data"
</script>

<section>
  <h1 class="pb-4">Projects</h1>
  <Card path="projects" items={projects} />
</section>

<section>
  <h1 class="pb-4">Backgroud</h1>
  <Card path="backgroud" items={background} />
</section>