<script>
  import { isLock, erase } from "../state";
</script>

<div class="flex items-center h-[100svh]">
  <div class="flex flex-col p-2 rounded-full border bg-white shadow-sm w-min">
    <button
      on:click={() => {
        // erase();
        isLock.set((!($isLock === "true")).toString());
      }}>{$isLock === "true" ? "👀" : "🖌️"}</button
    >
    <button
      on:click={() => {
        const d = new Date();
        erase.set(d);
      }}>🧽</button
    >
  </div>
</div>
