<script>
  import { isDrawable, erase } from "../state";
</script>

<div class="flex items-center h-[100svh]">
  <div class="flex flex-col p-2 rounded-full border bg-white shadow-sm w-min">
    <button
      on:click={() => {
        // erase();
        isDrawable.set((!($isDrawable === "true")).toString());
      }}
      >{$isDrawable === "true" || $isDrawable === undefined
        ? "🖌️"
        : "👀"}</button
    >
    <button
      on:click={() => {
        const d = new Date();
        erase.set(d);
      }}>🧽</button
    >
  </div>
</div>
