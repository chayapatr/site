<script lang="ts">
	// @ts-nocheck

	import ForceGraph3D from '3d-force-graph?client';

	import { onMount } from 'svelte';
	import { Frame, Path, Blocks, OpenBlocks, Log } from './store';
	import { generateBlock } from '$lib';

	export let width = 320;
	export let height = 250;
	export let blockId = -1;

	let el: HTMLElement;
	let Graph;

	const initGraph = () => {
		Graph = ForceGraph3D()(el)
			.graphData($Path)
			// .nodeAutoColorBy('group')
			.linkOpacity(0.8)
			.width(width)
			.height(height)
			.showNavInfo(false)
			.backgroundColor($Frame.dark ? '#101010' : '#efefef')
			.nodeRelSize(8)
			.nodeLabel(
				(node) =>
					`<div style="font-family: 'Basier Circle', sans-serif; color: ${$Frame.dark ? 'white' : 'black'}">${node.id}</div>`
			)
			.nodeColor((node) => {
				if (node.id === '!@$') return $Frame.dark ? '#FFFC79' : '#76BA1B';
				if ($Frame.dark) return $OpenBlocks.has(node.id) ? '#f0f0f0' : '#333333';
				return $OpenBlocks.has(node.id) ? '#2B5CC4' : '#e5e5e4';
			})
			.linkColor((node) => ($Frame.dark ? '#f0f0f0' : '#555555'))
			// .nodeLabel('id')
			.onNodeClick(async (node) => {
				const distance = 100;
				const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

				const newPos =
					node.x || node.y || node.z
						? { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }
						: { x: 0, y: 0, z: distance }; // special case if node is in (0,0,0)

				Graph.cameraPosition(newPos, node, 1000);

				if (!$OpenBlocks.has(node.id)) {
					const newIndex = $Frame.currentIndex + 1;
					$Frame.currentIndex = newIndex;
					$Blocks = [
						...$Blocks,
						await generateBlock(
							node.id,
							'page',
							blockId,
							$Blocks.filter((x) => x.id === blockId)[0],
							newIndex || 0
						)
					];
					$Log = [...$Log, `${node.id}.md`];
				}
			});
		// .linkAutoColorBy((d) => gData.nodes[d.source].group);
	};

	onMount(initGraph);

	$: {
		if (Graph) {
			Graph.graphData($Path)
				.width(width)
				.height(height)
				.backgroundColor($Frame.dark ? '#101010' : '#efefef');
		}
	}
</script>

<div bind:this={el} />
