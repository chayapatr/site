<script>
	// replicate: https://github.com/efedorenko/accessiblepalette/blob/master/src/generatePalette.ts
	import chroma from 'chroma-js'

	const shades = [98.2, 93.95, 85.1, 76.5, 67.65, 57.8, 47.6, 40.4, 32.4, 23.55]
	// const shades = [...Array(20).keys()].map((x) => x * 5).reverse()
	const color = '#387AE6'

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

	const generatePalette = ([shades, color]) => {
		const scale = chroma.scale(['black', color, 'white']).correctLightness()

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
	let gray = false
	let show = false
</script>


<div>
    <button class="px-2 py-1 border" on:click={() => { gray = !gray }}>gray</button>
    <button class="px-2 py-1 border" on:click={() => { show = !show }}>show</button>
</div>
<div class={`flex flex-col  ${!gray || "grayscale"}`}>
	{#each colors as code}
		<div class="flex">
			{#each generatePalette([shades, code]) as color}
				<div class="w-12 aspect-square flex justify-center items-center text-xs" style={`background-color: ${color}`}>
				    {#if show}
						<div>{Math.round(chroma(color).oklch()[0] * 100) / 100}</div>
					{/if}
				</div>
			{/each}
		</div>
	{/each}
</div>
