<script lang="ts">
	import { kernel } from '$lib/os/kernel/store';
	import { executeCommand } from '$lib/os/kernel/commands';
	import { onMount, tick } from 'svelte';
	import hljs from 'highlight.js/lib/core';
	import javascript from 'highlight.js/lib/languages/javascript';
	import markdown from 'highlight.js/lib/languages/markdown';
	import bash from 'highlight.js/lib/languages/bash';

	hljs.registerLanguage('javascript', javascript);
	hljs.registerLanguage('markdown', markdown);
	hljs.registerLanguage('bash', bash);

	let { pid, args = [] }: { pid: number; args?: string[] } = $props();

	type Line =
		| { kind: 'output' | 'error' | 'dir'; text: string; html?: string }
		| { kind: 'cmd'; prefix: string; text: string; html: string };

	let input = $state('');
	let inputHighlight = $derived(input ? hljs.highlight(input, { language: 'bash' }).value : '');
	let lines = $state<Line[]>([]);
	let history = $state<string[]>([]);
	let historyIdx = $state(-1);
	let scrollEl = $state<HTMLDivElement | null>(null);

	// buffer for multi-line highlighted blocks (cat output)
	let codeBuffer: string[] = [];
	let codeLang = '';
	let inCodeBlock = false;

	function flushCode() {
		if (!codeBuffer.length) return;
		const src = codeBuffer.join('\n');
		const result = codeLang
			? hljs.highlight(src, { language: codeLang }).value
			: hljs.highlightAuto(src).value;
		lines = [...lines, { kind: 'output', text: src, html: result }];
		codeBuffer = [];
		codeLang = '';
		inCodeBlock = false;
	}

	function print(text: string) {
		// special marker from cat: __code:lang__
		const codeStart = text.match(/^__code:(\w*)__$/);
		if (codeStart) {
			inCodeBlock = true;
			codeLang = codeStart[1];
			return;
		}
		if (text === '__endcode__') {
			flushCode();
			return;
		}
		if (inCodeBlock) {
			codeBuffer.push(text);
			return;
		}
		if (text.startsWith('__readonly__: ')) {
			lines = [...lines, { kind: 'error', text: '🔒 ' + text.slice('__readonly__: '.length) }];
			return;
		}
		const isDir = /^\S.*\/$/.test(text.trim()) && !text.includes(' $ ');
		lines = [...lines, { kind: isDir ? 'dir' : 'output', text }];
	}

	async function scrollToBottom() {
		await tick();
		if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight;
	}

	async function submit() {
		const cmd = input.trim();
		if (!cmd) return;
		history = [cmd, ...history];
		historyIdx = -1;
		lines = [
			...lines,
			{
				kind: 'cmd',
				prefix: `${$kernel.env.CWD} $ `,
				text: cmd,
				html: hljs.highlight(cmd, { language: 'bash' }).value
			}
		];
		input = '';

		if (cmd === 'clear') {
			lines = [];
			return;
		}

		await executeCommand(cmd, kernel, print, pid);
		flushCode(); // flush any unterminated block
		await scrollToBottom();
	}

	async function tabComplete() {
		const parts = input.split(/\s+/);
		const isFirstWord = parts.length === 1;

		if (isFirstWord) {
			// complete command names from /bin and /home/user/bin
			const word = parts[0];
			const bins = await Promise.all([
				kernel.list('/bin').catch(() => [] as string[]),
				kernel.list('/home/user/bin').catch(() => [] as string[])
			]);
			const cmds = [...new Set(bins.flat().map((n) => n.replace(/\.js$/, '')))];
			const matches = cmds.filter((c) => c.startsWith(word));
			if (matches.length === 1) {
				input = matches[0] + ' ';
			} else if (matches.length > 1) {
				print(matches.join('  '));
			}
		} else {
			// complete file/dir paths
			const word = parts[parts.length - 1];
			const isAbsolute = word.startsWith('/');
			const slashIdx = word.lastIndexOf('/');
			const dir =
				slashIdx === -1
					? kernel.env.CWD
					: isAbsolute
						? word.slice(0, slashIdx) || '/'
						: kernel.env.CWD + '/' + word.slice(0, slashIdx);
			const prefix = slashIdx === -1 ? word : word.slice(slashIdx + 1);

			const entries = await kernel.list(dir).catch(() => [] as string[]);
			const matches = entries.filter((e) => e.startsWith(prefix));
			if (matches.length === 1) {
				const full =
					slashIdx === -1
						? (isAbsolute ? '/' : '') + matches[0]
						: word.slice(0, slashIdx + 1) + matches[0];
				const stat = await kernel
					.stat((dir === '/' ? '' : dir) + '/' + matches[0])
					.catch(() => null);
				parts[parts.length - 1] = full + (stat?.type === 'dir' ? '/' : '');
				input = parts.join(' ');
			} else if (matches.length > 1) {
				print(matches.join('  '));
			}
		}
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Tab') {
			e.preventDefault();
			tabComplete();
			return;
		}
		if (e.key === 'Enter') {
			submit();
			return;
		}
		if (e.key === 'ArrowUp') {
			e.preventDefault();
			historyIdx = Math.min(historyIdx + 1, history.length - 1);
			input = history[historyIdx] ?? '';
		}
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			historyIdx = Math.max(historyIdx - 1, -1);
			input = historyIdx === -1 ? '' : history[historyIdx];
		}
	}

	onMount(async () => {
		const motd = await kernel.read('/etc/motd').catch(() => '');
		if (motd) for (const t of motd.split('\n')) lines = [...lines, { kind: 'output', text: t }];

		// source /etc/profile — export is a builtin, safe to run directly
		const profile = await kernel.read('/etc/profile').catch(() => '')
		for (const line of profile.split('\n')) {
			const trimmed = line.trim()
			if (!trimmed || trimmed.startsWith('#')) continue
			await executeCommand(trimmed, kernel, () => {}, pid)
		}
	});
</script>

<!-- Dracula palette via CSS vars on the container -->
<div
	class="flex h-full flex-col font-mono text-xs"
	style="
    --hl-bg: transparent;
    --hl-comment: #6272a4;
    --hl-keyword: #ff79c6;
    --hl-string: #f1fa8c;
    --hl-number: #bd93f9;
    --hl-function: #50fa7b;
    --hl-tag: #ff5555;
    --hl-attr: #ffb86c;
    --hl-built_in: #8be9fd;
  "
>
	<div bind:this={scrollEl} class="flex-1 space-y-0.5 overflow-y-auto p-3">
		{#each lines as line, i (i)}
			{#if line.kind === 'cmd'}
				<div class="leading-relaxed break-all whitespace-pre-wrap">
					<span class="text-neutral-200">{line.prefix}</span><span class="hljs"
						>{@html line.html}</span
					>
				</div>
			{:else if line.html}
				<pre
					class="hljs m-0 bg-transparent p-0 text-xs leading-relaxed break-all whitespace-pre-wrap">{@html line.html}</pre>
			{:else}
				<div
					class="leading-relaxed break-all whitespace-pre-wrap"
					class:text-neutral-200={line.kind === 'dir'}
					class:text-neutral-500={line.kind === 'output'}
					class:text-red-400={line.kind === 'error'}
				>
					{line.text}
				</div>
			{/if}
		{/each}
	</div>

	<div class="flex shrink-0 items-center border-t border-neutral-800 px-3 py-2">
		<span class="mr-2 shrink-0 text-neutral-600">{$kernel.env.CWD} $</span>
		<div class="relative flex-1">
			<!-- highlighted layer behind -->
			<pre
				class="hljs pointer-events-none absolute inset-0 m-0 bg-transparent p-0 text-xs leading-normal whitespace-pre">{@html inputHighlight}</pre>
			<!-- real input on top, transparent text so highlight layer shows through -->
			<input
				class="relative w-full bg-transparent outline-none placeholder:text-neutral-700"
				style="color: transparent; caret-color: #f8f8f2; font-size: inherit; font-family: inherit; line-height: normal;"
				bind:value={input}
				onkeydown={onKeydown}
				autofocus
			/>
		</div>
	</div>
</div>
