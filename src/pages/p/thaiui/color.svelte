<script>
    import Draggable from "../../../components/Draggable.svelte"
/*   	const colors = [
		'bg-th-dark-red',
		'bg-th-red',
		'bg-th-orange',
		'bg-th-yellow',
		'bg-th-dark-yellow',
		'bg-th-green',
		'bg-th-dark-green',
		'bg-th-dark-teal',
		'bg-th-teal',
		'bg-th-light-blue',
		'bg-th-blue',
		'bg-th-dark-blue',
		'bg-th-purple',
		'bg-th-black',
		'bg-th-dark-gray',
		'bg-th-gray',
		'bg-th-light-gray',
		'bg-th-lighter-gray',
		'bg-th-white'
		];  */
	const colors = Object.entries({
		'th-red': '#c9242b', // แดงชาด
		// 'th-dark-red': '#951519', // แดงตัด
		'th-orange': '#f36e31', // หมากสุก
		'th-yellow': '#f4d25d', // จันทร์
		// 'th-dark-yellow': '#f2c04e', // ลูกจันทร์
		'th-green': '#356740', // เขียวดิน
		// 'th-dark-green': '#17372a', // เขียวก้ามปู
		'th-teal': '#69b496', // ก้านมะลิ
		// 'th-dark-teal': '#00968f', // ไข่ครุฑ
		// 'th-light-blue': '#3476ae', // กรมท่า
		'th-blue': '#0c4da2', // ครามฝรั่ง
		// 'th-dark-blue': '#1b2c55', // ฟ้า
		'th-purple': '#695095', // ดอกอัญชัน
		// 'th-black': '#00080b', // นิลกาฬ
		// 'th-dark-gray': '#29241b', // ดำหมึก
		// 'th-gray': '#b3b3ba', // ดอกเลา
		// 'th-light-gray': '#d0cfcf', // เหล็ก
		// 'th-lighter-gray': '#f1efef',
		'th-white': '#FAFAFA'
	}).map(([k, v]) => v)

	const RGBCodeToArray = (rgb) => {
	    let removeHash = rgb[0] === "#" ? rgb.slice(1) : rgb
		let split = removeHash.match(/../g)
		console.log(split.map(x => parseInt(x, 16)))
		return split.map(x => parseInt(x, 16))
	}

	const RGBToHSL = ([r, g, b]) => {
      r /= 255;
      g /= 255;
      b /= 255;
      const l = Math.max(r, g, b);
      const s = l - Math.min(r, g, b);
      const h = s
          ? l === r
            ? (g - b) / s
            : l === g
              ? 2 + (b - r) / s
              : 4 + (r - g) / s
          : 0;
      return [
        60 * h < 0 ? 60 * h + 360 : 60 * h,
        100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
        (100 * (2 * l - s)) / 2,
        ].map(x => Math.round(x));
	};

	const HSLToString = (arr) => {
	   return `hsl(${arr[0]}, ${arr[1]}%, ${arr[2]}%)`
	}

	const transform = (rgb) => {
	   return HSLToString(RGBToHSL(RGBCodeToArray(rgb)))
	}

	let show = false

	const code = "#c9242b"
	const getVariation = (code) => {
	   const hsl = RGBToHSL(RGBCodeToArray(code))
		const nearestL = (parseInt(hsl[2]/10, 10)+1)*10;
		return [...Array(20).keys()].map(x => HSLToString([hsl[0], `${hsl[1]}`, `${(x)*5}`])).slice(2).reverse()
	}

	const getTone500 = variation => variation.filter(x => x.split(",")[2].slice(0,-1) === " 50%")
</script>

<div class="grid gap-4 mb-8">
    <Draggable rand={true}>
    <div class="">
        <h1 class="text-2xl">Stats for nerds</h1>
        <div><button class="px-2 py-1 border-2 bg-neutral-100 rounded-md" on:click={() => show = !show}>Show</button></div>
        {getTone500(getVariation(code))}
    </div>
    </Draggable>
    <h1 class="text-4xl">Color</h1>
    <div class="flex flex-wrap flex-col">
        {#each colors as color}
            <div class="flex">
                <div
                    class={`w-10 aspect-square text-xs`}
                    style={`background-color: ${color}`}
                ></div>
                <div
                    class={`mr-5 w-10 aspect-square text-xs`}
                    style={`background-color: ${getTone500(getVariation(color))}`}
                ></div>
            {#each getVariation(color) as code}
                <div
                    class={`w-10 aspect-square text-xs`}
                    style={`background-color: ${code}`}
                >{#if show}{code.split(",")[2].slice(0,-1)}{/if}</div>
            {/each}
            </div>
        {/each}
    </div>

    <!-- https://tailwind-color-analytics.netlify.app/ -->
    <!-- check grayscale with ibm tone -->
    <h1 class="text-2xl">Problem: grayscale test</h1>
    <div class="flex flex-wrap flex-col grayscale">
        {#each colors as color}
            <div class="flex">
                <div
                    class={`w-10 aspect-square text-xs`}
                    style={`background-color: ${color}`}
                ></div>
                <div
                    class={`mr-5 w-10 aspect-square text-xs`}
                    style={`background-color: ${getTone500(getVariation(color))}`}
                ></div>
            {#each getVariation(color) as code}
                <div
                    class={`w-10 aspect-square text-xs`}
                    style={`background-color: ${code}`}
                >{#if show}{code.split(",")[2].slice(0,-1)}{/if}</div>
            {/each}
            </div>
        {/each}
    </div>
</div>
