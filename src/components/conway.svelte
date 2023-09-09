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

      for(let x=-1;x<2;x++) {
        for(let y=-1;y<2;y++) {
          if(x === 0 && y === 0) continue
          if(i+x < min || j+y < min || i+x > maxRow || j+y > maxCell) continue
          neighbor += grid[i+x][j+y] ? 1 : 0
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
            else newGrid[i][j] = 0
          } else {
            if (neighbor === 3) newGrid[i][j] = 1
          }
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

<div>Hello world!</div>
