<script>
  import { onMount } from "svelte";
  import { isDrawable, erase } from "../state";

  let clear = () => {};
  let init = () => {};

  onMount(() => {
    let canvas,
      ctx,
      flag = false,
      prevX = 0,
      currX = 0,
      prevY = 0,
      currY = 0,
      dot_flag = false,
      w,
      h;

    let x = "black",
      y = 2;

    init = () => {
      const bw = window.innerWidth;
      const bh = window.innerHeight;

      canvas = document.getElementById("can");
      ctx = canvas.getContext("2d");

      canvas.width = bw;
      canvas.height = bh;

      w = canvas.width;
      h = canvas.height;

      document.addEventListener(
        "mousemove",
        function (e) {
          findxy("down", e);
        },
        false,
      );
    };

    // function draw() {
    //   ctx.beginPath();
    //   ctx.moveTo(prevX, prevY);
    //   ctx.lineTo(currX, currY);
    //   ctx.strokeStyle = x;
    //   ctx.lineWidth = y;
    //   ctx.stroke();
    //   ctx.closePath();
    // }

    clear = () => {
      ctx.clearRect(0, 0, w, h);
    };

    function findxy(res, e) {
      if (res == "down") {
        prevX = currX;
        prevY = currY;
        currX = e.clientX - canvas.offsetLeft;
        currY = e.clientY - canvas.offsetTop;

        flag = true;
        dot_flag = true;
        if (dot_flag && ($isDrawable === "true" || $isDrawable === undefined)) {
          ctx.beginPath();
          ctx.fillStyle = x;
          ctx.fillRect(currX, currY, 2, 2);
          ctx.closePath();
          dot_flag = false;
        }
      }

      //   if (res == "move") {
      //     if (flag) {
      //       prevX = currX;
      //       prevY = currY;
      //       currX = e.clientX - canvas.offsetLeft;
      //       currY = e.clientY - canvas.offsetTop;
      //       draw();
      //     }
      //   }
    }

    init();
  });

  $: $erase || $isDrawable, clear();

  // adapt from https://stackoverflow.com/questions/2368784/draw-on-html5-canvas-using-a-mouse
</script>

<div class="disable pointer-events-none -z-20">
  <canvas id="can" class="opacity-15 pointer-events-none" width="0" height="0"
  ></canvas>
</div>
