<script lang="ts">
	import { generateBlock } from '$lib';
	import { Frame, Blocks } from './store';
	import type { BlockType } from '$lib';
	const strToBlock = (str: string): BlockType => str as BlockType;
	let { btn } = $props();
</script>

<button
	title={btn.title}
	class="dot"
	onclick={async () => {
		if (!$Blocks.find((x) => x.type === btn.type)) {
			$Frame.currentIndex += 1;
			$Blocks = [
				...$Blocks,
				await generateBlock(
					btn.title,
					strToBlock(btn.type),
					-1,
					undefined,
					$Frame.currentIndex || 0
				)
			];
			requestAnimationFrame(() => {
				$Frame.cur = $Frame.currentIndex;
			});
		} else {
			const { x, y, height, width } = $Blocks.find((x) => x.type === btn.type) ?? {
				x: 0,
				y: 0,
				height: 0,
				width: 0
			};
			$Frame = {
				...$Frame,
				x: -Number(x) + $Frame.width / 2 - width / 2,
				y: -Number(y) + $Frame.height / 2 - height / 2,
				scale: 1
			};
			$Frame.cur = $Blocks.findIndex((x) => x.type === btn.type);
		}
	}}>{btn.icon}</button
>
