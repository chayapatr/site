<script>
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

	const fns = [lChange, scssMix]

	// https://gist.github.com/jedfoster/7939513
	// https://tailwind-color-analytics.netlify.app/
	// https://notes.dt.in.th/OklchPlot
	// check grayscale with ibm tone
</script>

<div class="grid gap-4 mb-8">
	<Draggable rand={true} show={false} fixed={true}>
		<div class="grid gap-2">
			<h1 class="text-2xl">Color Setting</h1>
			<div>
				<button class="px-2 py-1 border-2 bg-neutral-100 rounded-md" on:click={() => (show = !show)}
					>Show</button
				>
			</div>
		</div>
	</Draggable>
	<h1 class="text-4xl">Color</h1>

	{#each fns as fn}
		<div class="grid gap-8 my-4">
			<div class="flex flex-wrap flex-col">
				<h1 class="text-4xl mb-4">{fn.name}</h1>
				{#each colors as color}
					<ColorScale shades={fn(color)} org={color} {show} />
				{/each}
			</div>
			<div class="flex flex-wrap flex-col grayscale">
				<h1 class="text-2xl mb-4">Grayscale test</h1>
				{#each colors as color}
					<ColorScale shades={fn(color)} org={color} {show} />
				{/each}
			</div>
		</div>
	{/each}
</div>
