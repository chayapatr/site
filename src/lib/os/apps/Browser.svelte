<script lang="ts">
	import { kernel } from '$lib/os/kernel/store';
	import { marked } from 'marked';

	let { pid, args = [] }: { pid: number; args?: string[] } = $props();
	const arg0 = args[0];

	const VFS_ROOTS = ['/bin', '/etc', '/usr', '/home', '/proc', '/dev', '/sys'];

	function normalizeUrl(s: string): string {
		if (!s) return 'https://';
		if (
			s.startsWith('pub://') ||
			s.startsWith('file://') ||
			s.startsWith('http://') ||
			s.startsWith('https://')
		)
			return s;
		if (s.startsWith('/') && VFS_ROOTS.some((r) => s.startsWith(r))) return `file://${s}`;
		if (s.startsWith('/')) return `pub://${s.slice(1)}`;
		if (/^[\w-]+(\.[\w-]+)+(\/|$)/.test(s)) return `https://${s}`;
		return `pub://${s}`;
	}

	type Tab = { url: string; html: string; error: string; loading: boolean; history: string[] };

	function newTab(url: string): Tab {
		return { url, html: '', error: '', loading: false, history: [] };
	}

	const firstUrl = arg0 ? normalizeUrl(arg0) : '';
	let tabs = $state<Tab[]>([newTab(firstUrl)]);
	let activeIdx = $state(0);

	let tab = $derived(tabs[activeIdx]);
	let contentEl: HTMLDivElement;

	async function loadTab(idx: number, url: string) {
		tabs[idx].error = '';
		tabs[idx].url = url;
		if (!url) {
			tabs[idx].loading = false;
			return;
		}
		try {
			let raw: string;
			let renderAsMarkdown = false;

			if (url.startsWith('pub://')) {
				const slug = url.slice('pub://'.length);
				const res = await fetch(`https://garden.from.pub/${slug}.md`);
				if (!res.ok) throw new Error(`pub://${slug}: not found`);
				raw = await res.text();
				renderAsMarkdown = true;
			} else if (url.startsWith('file://')) {
				const path = url.slice('file://'.length);
				raw = await kernel.read(path);
				renderAsMarkdown = path.endsWith('.md');
			} else if (url.startsWith('http://') || url.startsWith('https://')) {
				tabs[idx].html =
					`<iframe src="${url}" class="w-full h-full border-none" style="min-height:500px;" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>`;
				tabs[idx].loading = false;
				return;
			} else {
				throw new Error(`unknown scheme: ${url}`);
			}

			tabs[idx].html = renderAsMarkdown ? String(await marked(raw)) : `<pre>${raw}</pre>`;
		} catch (e) {
			tabs[idx].error = String(e);
		} finally {
			tabs[idx].loading = false;
			if (contentEl) contentEl.scrollTop = 0;
		}
	}

	function navigate(target: string, idx = activeIdx) {
		const url = normalizeUrl(target);
		tabs[idx].history = [tabs[idx].url, ...tabs[idx].history];
		loadTab(idx, url);
	}

	function goBack() {
		const prev = tab.history[0];
		if (!prev) return;
		tabs[activeIdx].history = tab.history.slice(1);
		loadTab(activeIdx, prev);
	}

	function openTab(url = '') {
		const normalized = url ? normalizeUrl(url) : '';
		tabs = [...tabs, newTab(normalized)];
		activeIdx = tabs.length - 1;
		loadTab(activeIdx, normalized);
	}

	function closeTab(idx: number) {
		if (tabs.length === 1) return;
		tabs = tabs.filter((_, i) => i !== idx);
		activeIdx = Math.min(activeIdx, tabs.length - 1);
	}

	function handleClick(e: MouseEvent) {
		const a = (e.target as HTMLElement).closest('a') as HTMLAnchorElement | null;
		if (!a) return;
		const href = a.getAttribute('href');
		if (!href) return;
		e.preventDefault();
		navigate(href);
	}

	const initialTabUrl = tabs[0].url;
	loadTab(0, initialTabUrl);
</script>

<div class="flex h-full flex-col">
	<!-- Tab bar -->
	<div class="flex shrink-0 items-center gap-0 overflow-x-auto border-b border-neutral-800">
		{#each tabs as t, i (i)}
			<button
				class="flex max-w-36 items-center gap-1.5 truncate border-r border-neutral-800 px-3 py-1.5 font-mono text-xs whitespace-nowrap transition-colors"
				class:text-neutral-300={i === activeIdx}
				class:bg-neutral-900={i === activeIdx}
				class:text-neutral-600={i !== activeIdx}
				onclick={() => (activeIdx = i)}
			>
				<span class="truncate"
					>{t.url ? t.url.replace('pub://', '').replace('file://', '') : 'new tab'}</span
				>
				{#if t.loading}<span class="shrink-0 text-neutral-700">...</span>{/if}
				<span
					class="shrink-0 opacity-40 hover:opacity-100"
					role="button"
					tabindex="0"
					onclick={(e) => {
						e.stopPropagation();
						closeTab(i);
					}}
					onkeydown={(e) => e.key === 'Enter' && closeTab(i)}>×</span
				>
			</button>
		{/each}
		<button
			class="shrink-0 px-3 py-1.5 font-mono text-xs text-neutral-700 transition-colors hover:text-neutral-400"
			onclick={() => openTab()}>+</button
		>
	</div>

	<!-- Address bar -->
	<div class="flex shrink-0 items-center gap-2 border-b border-neutral-800 px-3 py-2">
		<button
			class="shrink-0 font-mono text-xs text-neutral-600 transition-colors hover:text-neutral-400"
			onclick={goBack}>←</button
		>
		<input
			class="flex-1 border border-neutral-800 bg-neutral-900 px-2 py-0.5 font-mono text-xs text-neutral-400 transition-colors outline-none focus:border-neutral-700"
			value={tab.url}
			onkeydown={(e) => e.key === 'Enter' && navigate((e.target as HTMLInputElement).value)}
			placeholder="search or enter url"
		/>
	</div>

	<!-- Content -->
	<div
		bind:this={contentEl}
		class="flex-1 overflow-y-auto"
		role="presentation"
		onclick={handleClick}
		onkeydown={() => {}}
	>
		{#if !tab.html && !tab.error && !tab.loading}
			<div class="flex flex-col gap-6 p-6">
				<div class="flex flex-col gap-1">
					<div class="font-mono text-[10px] text-neutral-600">pub://</div>
					<button
						class="text-left font-mono text-xs text-neutral-400 transition-colors hover:text-neutral-200"
						onclick={() => navigate('pub://!@$')}>!@$</button
					>
				</div>
				<div class="flex flex-col gap-1">
					<div class="font-mono text-[10px] text-neutral-600">https://</div>
					{#each ['info.cern.ch', 'wikipedia.org', 'from.pub', 'wiby.me', 'poolsuite.net', 'archive.org', 'theuselessweb.com', 'example.com'] as site}
						<button
							class="text-left font-mono text-xs text-neutral-400 transition-colors hover:text-neutral-200"
							onclick={() => navigate(`https://${site}`)}>{site}</button
						>
					{/each}
				</div>
			</div>
		{:else if tab.error}
			<div class="p-4 font-mono text-xs text-red-500/80">{tab.error}</div>
		{:else if tab.url.startsWith('http://') || tab.url.startsWith('https://')}
			{@html tab.html}
		{:else}
			<div
				class="prose prose-sm max-w-none px-4 py-3 prose-invert select-text
        prose-headings:text-neutral-200 prose-p:text-neutral-400
        prose-a:text-neutral-400 prose-strong:text-neutral-300
        prose-code:text-neutral-300 prose-li:text-neutral-400"
			>
				{@html tab.html}
			</div>
		{/if}
	</div>
</div>
