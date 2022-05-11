<script>
  import Card from "$lib/Card.svelte";
  import { works, projects, background } from "./things"
</script>

<section>
  <h1 class="pb-4">Works</h1>
  <Card path="" items={works} />
</section>

<section>
  <h1 class="pb-4">Projects</h1>
  <Card path="things" items={projects} />
</section>

<section>
  <h1 class="pb-4">Backgroud</h1>
  <Card path="things" items={background} />
</section>