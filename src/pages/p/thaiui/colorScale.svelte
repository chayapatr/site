<script>
	export let org = '#000'
	export let shades = []
	export let show = false

	import chroma from "chroma-js"

	// const getTone500 = variation => variation.filter(x => x.split(",")[2].slice(0,-1) === " 50%")
	//
	const f = (color) => {
	 let s = color.split(" ")
	 // return chroma.oklch([s[0].split("(")[1], s[1], s[2].split(")")[0]]
	 //return Math.round(+s[0].split("(")[1] * 100) / 100
		return Math.round(
		  chroma(
				chroma.oklch([s[0].split("(")[1], s[1], s[2].split(")")[0]].map(x => +x)
			)).oklch()[0] * 100) / 100
	}
</script>

<div class="flex">
	<div class={`w-10 aspect-square text-xs mr-4`} style={`background-color: ${org}`}></div>
	<!-- <div
    class={`mr-5 w-10 aspect-square text-xs`}
    style={`background-color: ${getTone500(shades)}`}
    ></div> -->
	{#each shades as color}
		<div
			class={`w-10 aspect-square text-xs flex justify-center items-center`}
			style={`background-color: ${color}`}
		>
			{#if show}{color[0] === "o" ? f(color) :  Math.round(chroma(color).oklch()[0] * 100) / 100}{/if}
		</div>
	{/each}
</div>
