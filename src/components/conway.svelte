<script>
    import { onMount } from "svelte"

    export let stats = false;

    let dp = {}
    let grid = []
    const updateDP = () => {
      return {
        w: document.documentElement.clientWidth,
        h: document.documentElement.clientHeight,
        sh: document.documentElement.scrollHeight
      }
    }
    const updateGrid = () => {
      const h = Math.floor(dp.h / 25)
      const w = Math.floor(dp.w / 25)
      return [...Array(h)].map(e => Array.from({length: w}, () => Math.floor(Math.random() * 1.2)));
    }

    const checkNeighbor = (i, j, grid) => {
      const min = 0
      const maxRow = grid.length - 1
      const maxCell = grid[i].length - 1

      let neighbor = 0

      // console.log("new loop!")
      for(let x=-1;x<2;x++) {
        for(let y=-1;y<2;y++) {
          if(x === 0 && y === 0) continue
          if(i+x < min || j+y < min || i+x > maxRow || j+y > maxCell) continue
          neighbor += grid[i+x][j+y] ? 1 : 0
          // grid[i+x][j+y] ? console.log(`neighbor of [${i},${j}] found at [${ i+x},${y+j}] it [${x}, ${y}]`) : null
          // if(grid[i+x][j+y]) console.log(`check cell [${i},${j}] at [${i+x},${j+y}] = ${grid[i+x][j+y]}`)
        }
      }
      return neighbor
    }

    const updateStep = (grid) => {
      let newGrid = structuredClone(grid)
      for(let i = 0; i < grid.length; i++) {
        for(let j = 0; j < grid[i].length; j++) {
          const neighbor = checkNeighbor(i, j, grid)
          if(grid[i][j] === 1) {
            if (neighbor < 2) newGrid[i][j] = 0
            else if (neighbor === 2 || neighbor === 3) newGrid[i][j] = 1
            else {
              // console.log(`rip cell ${i}, ${j}`)
              newGrid[i][j] = 0
            }
          } else {
            if (neighbor === 3) newGrid[i][j] = 1
          }
          if(neighbor > 3) console.log("akjsdfhapsdfhlasjhdflajks;df", i, j)
        }
      }
      return newGrid
    }

    onMount(() => {
      dp = updateDP()
      grid = updateGrid()
      setInterval(() => {
        grid = structuredClone(updateStep(grid))
        // console.log(grid)
      }, 500)
    })

    // Any live cell with fewer than two live neighbours dies, as if by underpopulation.
    // Any live cell with two or three live neighbours lives on to the next generation.
    // Any live cell with more than three live neighbours dies, as if by overpopulation.
    // Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
</script>

<svelte:window on:resize={() => {dp = updateDP(); grid = updateGrid()}} />

<div
    class="absolute bg-neutral-50 top-0 left-0 flex justify-start items-start flex-col"
    style={dp ? `height: ${dp.h}px; width: ${dp.w}px` : null}
>
    {#each grid as row, i}
        <div class="flex">
            {#each row as cell, j}
                <div
                    class={`cell ${grid[i][j] ? "bg-neutral-300" : "bg-neutral-100"}`}
                    style={dp ? `width: ${dp.w / grid[0].length}px` : null}
                    on:mouseenter={() => {
                      grid[i][j] = grid[i][j] ? 0 : 1
                      console.log(`add cell at [${i}, ${j}]`)
                    }}
                />
            {/each}
        </div>
    {/each}
</div>

{#if stats}
<div class="absolute top-0 left-0 m-4 p-4 border-2 border-neutral-300 rounded-md shadow-md bg-white">
    <h2 class="text-xl">Stats for nerds</h2>
    <p class="font-['Basier_Circle']">{JSON.stringify(dp)}</p>
</div>
{/if}

<style>
    .cell {
        @apply aspect-square border-[0.5px] border-neutral-300 flex justify-center items-center text-xs text-neutral-200;
    }
</style>
