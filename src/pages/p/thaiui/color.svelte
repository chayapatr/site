<script>
	import chroma from 'chroma-js'

	import Draggable from '../../../components/Draggable.svelte'
	import ColorScale from './colorScale.svelte'
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

	const colorsFull = Object.entries({
		'th-red': '#c9242b', // แดงชาด
		'th-dark-red': '#951519', // แดงตัด
		'th-orange': '#f36e31', // หมากสุก
		'th-yellow': '#f4d25d', // จันทร์
		'th-dark-yellow': '#f2c04e', // ลูกจันทร์
		'th-green': '#356740', // เขียวดิน
		'th-dark-green': '#17372a', // เขียวก้ามปู
		'th-teal': '#69b496', // ก้านมะลิ
		'th-dark-teal': '#00968f', // ไข่ครุฑ
		'th-light-blue': '#3476ae', // กรมท่า
		'th-blue': '#0c4da2', // ครามฝรั่ง
		'th-dark-blue': '#1b2c55', // ฟ้า
		'th-purple': '#695095', // ดอกอัญชัน
		'th-dark-gray': '#29241b', // ดำหมึก
		'th-gray': '#b3b3ba', // ดอกเลา
		'th-light-gray': '#d0cfcf', // เหล็ก
		'th-lighter-gray': '#f1efef',
		'th-white': '#FAFAFA',
		'th-black': '#00080b' // นิลกาฬ
	}).map(([k, v]) => v)

	const ap = ['#FE6F5C', '#F8D147', '#56D25B', '#0088CB', '#387AE6', '#66788E', '#808080']

	let show = false

	const RGBCodeToArray = (rgb) => {
		let removeHash = rgb[0] === '#' ? rgb.slice(1) : rgb
		let split = removeHash.match(/../g)
		return split.map((x) => parseInt(x, 16))
	}

	const RGBToHSL = ([r, g, b]) => {
		r /= 255
		g /= 255
		b /= 255
		const l = Math.max(r, g, b)
		const s = l - Math.min(r, g, b)
		const h = s ? (l === r ? (g - b) / s : l === g ? 2 + (b - r) / s : 4 + (r - g) / s) : 0

		return [
			60 * h < 0 ? 60 * h + 360 : 60 * h,
			100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
			(100 * (2 * l - s)) / 2
		].map((x) => Math.round(x))
	}

	const HSLToRGB = ([h, s, l]) => {
		s /= 100
		l /= 100
		const k = (n) => (n + h / 30) % 12
		const a = s * Math.min(l, 1 - l)
		const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
		return [255 * f(0), 255 * f(8), 255 * f(4)].map((x) => Math.round(x))
	}

	const HSLToString = (arr) => {
		return `hsl(${arr[0]}, ${arr[1]}%, ${arr[2]}%)`
	}

	const lChange = (code) => {
		const hsl = RGBToHSL(RGBCodeToArray(code))
		return [...Array(21).keys()]
			.map((x) => HSLToString([hsl[0], `${hsl[1]}`, `${(x - 1) * 5}`]))
			.slice(2)
			.reverse()
	}

	const scssMix = (code) => {
		const normalize = (code) => {
			const hsl = RGBToHSL(RGBCodeToArray(code))
			return HSLToRGB([hsl[0], hsl[1], 50])
				.map((x) => x.toString(16).padStart(2, '0'))
				.join('')
		}

		// modified from https://gist.github.com/jedfoster/7939513
		const mix = function (color_1, color_2, weight) {
			const v1 = RGBCodeToArray(normalize(color_1))
			const v2 = RGBCodeToArray(color_2)

			const res = v1
				.map((x, i) => Math.floor(v2[i] + (x - v2[i]) * (weight / 100.0)))
				.map((x) => x.toString(16).padStart(2, '0'))
				.join('')

			return '#' + res
		}

		const black = '000000'
		const white = 'ffffff'

		return [
			...[...Array(9).keys()].map((x) => (x + 1) * 10).map((x) => mix(code, white, x)),
			mix(code, white, 100),
			...[...Array(9).keys()].map((x) => 100 - (x + 1) * 10).map((x) => mix(code, black, x))
		]
	}

	const round = (x) => {
		return Math.round(x * 1000) / 1000
	}

	const oklch = (color) => {
		let arr = chroma(color).oklch()
		arr[0] = 0.5
		return arr
		// return [Math.round(lch[0] * 10) / 10, lch[1], lch[2]]
	}

	const preset = [98.2, 93, 85.1, 76.5, 67.65, 57.8, 47.6, 40.4, 32.4, 23.55].map((x) => x * 0.01)

	const oklchLShift = (rgb) => {
		const arr = oklch(rgb)
		const range = [...Array(19).keys()].map((x) => x * 0.05).reverse()
		return range
			.map((x) => [x, round(arr[1]), round(arr[2]) || 0])
			.map((x) => `oklch(${x.join(' ')})`)
	}

	const chromaShift = (rgb) => {
		const arr = oklch(rgb)
		const range = [...Array(19).keys()].map((x) => x * 0.05).reverse()
		const changeL = preset.map((x) => [x, round(arr[1]), round(arr[2])])

		// .map(x => chroma.oklch(...[x, round(arr[1]), round(arr[2])]))

		const chromaShift = [
			...[...Array(9).keys()]
				.map((x) => x + 1)
				.map((x) => x * 0.3)
				.reverse()
				.map((x) => chroma.oklch(...arr).brighten(x)),
			chroma.oklch(...arr),
			...[...Array(9).keys()]
				.map((x) => x + 1)
				.map((x) => x * 0.3)
				.map((x) => chroma.oklch(...arr).darken(x))
		]

		return chromaShift
	}


	// const shades = [98.2, 93.95, 85.1, 76.5, 67.65, 57.8, 47.6, 40.4, 32.4, 23.55]
	const shades = [...Array(19).keys()].map((x) => x * 5).reverse()
	const accessiblePalette = (color) => {
	       const clean = (color) => color[0] === "#" ? color.slice(1) : color
			const scale = chroma.scale(['black', clean(color), 'white']).correctLightness()

			const getColorFromScale = (scale, lightness) => {
				const color = scale(lightness / 100)
				return chroma(color)
			}

			const applyHueCorrection = (chromaColor, hueCorrection, index) => {
				const totalShades = shades.length
				const hueAdjustment = (hueCorrection / totalShades) * (index + 1)
				return chromaColor.set('lch.h', chromaColor.lch()[2] + hueAdjustment)
			}

			return shades.map((shade) => {
				const chromaColorWithLightness = getColorFromScale(scale, shade)
				const chromaColorWithCorrectedHue = applyHueCorrection(chromaColorWithLightness, 0, shade)
				return chromaColorWithCorrectedHue.hex()
			})
		}

	const fns = [lChange, scssMix, chromaShift, oklchLShift, accessiblePalette] // lChange

	// https://gist.github.com/jedfoster/7939513
	// https://tailwind-color-analytics.netlify.app/
	// https://notes.dt.in.th/OklchPlot
	// check grayscale with ibm tone
	// https://accessiblepalette.com/
	//

	let gray = false
</script>

<div class="grid gap-4 mb-8">
	<Draggable rand={true} show={false} fixed={true}>
		<div class="grid gap-2">
			<h1 class="text-2xl">Color Setting</h1>
			<div>
				<button class="px-2 py-1 border-2 bg-neutral-100 rounded-md" on:click={() => (show = !show)}
					>Show</button
				>
				<button class="px-2 py-1 border-2 bg-neutral-100 rounded-md" on:click={() => (gray = !gray)}
					>Gray</button
				>
			</div>
		</div>
	</Draggable>
	<h1 class="text-4xl">Color</h1>

	<!-- <div class={!gray || "grayscale"}>
	{#each colors as color}
	<div class="flex">
	   {#each oklchTransform(color) as code}
			<div class="w-10 aspect-square text-xs flex justify-center items-center"
			     style={`background-color: oklch(${code.join(" ")})`}>
					{#if show}{Math.round(code[0] * 100) / 100}{/if}
			</div>
		{/each}
	</div>
	{/each}
	</div> -->

	{#each fns as fn}
		<div class={`grid gap-8 my-4 ${!gray || 'grayscale'}`}>
			<div class="flex flex-wrap flex-col">
				<h1 class="text-4xl mb-4">{fn.name}</h1>
				{#each colors as color}
					<ColorScale shades={fn(color)} org={color} {show} />
				{/each}
			</div>

			<!--
			<div class="flex flex-wrap flex-col grayscale">
				<h1 class="text-2xl mb-4">Grayscale test</h1>
				{#each colors as color}
					<ColorScale shades={fn(color)} org={color} {show} />
				{/each}
			</div>
			-->
		</div>
	{/each}

	<h1 class="text-4xl mb-4">Comparison</h1>
	<div class={`flex flex-wrap ${!gray || 'grayscale'}`}>
		{#each colors as color}
			{#each fns as fn, i}
				<div class="flex gap-2">
					<ColorScale shades={fn(color)} org={color} {show} />
					{i + 1}
				</div>
			{/each}
		{/each}
	</div>
</div>
