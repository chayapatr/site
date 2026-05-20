<script lang="ts">
	import { kernel } from '$lib/os/kernel/store';
	import type { AppType } from '$lib/os/kernel/types';

	let { pid, args = [] }: { pid: number; args?: string[] } = $props();

	type Entry = { name: string; isDir: boolean; icon?: string };
	type DesktopFile = { label: string; icon: string } & (
		| { app: AppType }
		| { folder: string }
		| { webapp: string }
	);
	type ViewMode = 'list' | 'icon-grid';

	type Bookmark = { label: string; path: string };

	let cwd = $state(args[0] ?? '/home/user');
	let entries = $state<Entry[]>([]);
	let view = $state<ViewMode>('list');
	let error = $state('');
	let loaded = $state(false);
	let sidebar = $state<Bookmark[]>([]);

	async function loadSidebar() {
		try {
			sidebar = JSON.parse(await kernel.read('/home/user/.config/finder/bookmarks'));
		} catch {
			sidebar = [
				{ label: 'home', path: '/home/user' },
				{ label: '/', path: '/' }
			];
		}
	}

	loadSidebar();

	$effect(() => {
		void $kernel.fsRev;
		if (loaded) reload();
	});

	async function reload() {
		const names = await kernel.list(cwd).catch(() => [] as string[]);
		const withStats = await Promise.all(
			names.map(async (n) => {
				const full = cwd === '/' ? `/${n}` : `${cwd}/${n}`;
				try {
					const s = await kernel.stat(full);
					const isDir = s.type === 'dir';
					let icon = isDir ? '/usr/share/icons/folder.svg' : '/usr/share/icons/notepad.svg';
					if (!isDir && n.endsWith('.desktop')) {
						try {
							const def = JSON.parse(await kernel.read(full)) as DesktopFile;
							if (def.icon) icon = def.icon;
						} catch {
							/* keep default */
						}
					}
					return { name: n, isDir, icon };
				} catch {
					return { name: n, isDir: false, icon: '/usr/share/icons/notepad.svg' };
				}
			})
		);
		entries = withStats;
		try {
			const cfg = JSON.parse(await kernel.read((cwd === '/' ? '' : cwd) + '/.directory'));
			view = cfg.view === 'icon-grid' ? 'icon-grid' : 'list';
		} catch {
			view = 'list';
		}
		loaded = true;
		error = '';
	}

	async function navigate(path: string) {
		try {
			const stat = await kernel.stat(path);
			if (stat.type === 'dir') {
				cwd = path;
				await reload();
			} else {
				openFile(path);
			}
		} catch (e) {
			error = String(e);
			loaded = true;
		}
	}

	async function openFile(path: string) {
		const ext = path.split('.').pop();
		if (ext === 'desktop') {
			try {
				const raw = await kernel.read(path);
				const def = JSON.parse(raw) as DesktopFile;
				if ('app' in def) {
					kernel.spawn(def.app);
					return;
				}
				if ('folder' in def) {
					navigate(def.folder);
					return;
				}
				if ('webapp' in def) {
					kernel.spawnWebapp(def.webapp, def.label);
					return;
				}
			} catch {
				/* fall through */
			}
		}
		if (ext === 'md' || ext === 'html') kernel.spawn('browser', [path]);
		else kernel.spawn('notepad', [path]);
	}

	async function openEntry(entry: Entry) {
		const path = fullPath(entry.name);
		if (entry.isDir) {
			navigate(path);
			return;
		}
		openFile(path);
	}

	function goUp() {
		const parent = cwd === '/' ? '/' : cwd.split('/').slice(0, -1).join('/') || '/';
		navigate(parent);
	}

	function fullPath(name: string) {
		return cwd === '/' ? `/${name}` : `${cwd}/${name}`;
	}

	function displayName(entry: Entry): string {
		return entry.name.replace(/\.desktop$/, '');
	}

	navigate(cwd);
</script>

<div class="flex h-full">
	<!-- Sidebar -->
	<div class="flex w-32 shrink-0 flex-col border-r border-neutral-800 py-2">
		{#each sidebar as item}
			<button
				class="px-3 py-1.5 text-left font-mono text-xs transition-colors"
				class:text-neutral-300={cwd === item.path}
				class:bg-neutral-800={cwd === item.path}
				class:text-neutral-600={cwd !== item.path}
				class:hover:text-neutral-400={cwd !== item.path}
				onclick={() => navigate(item.path)}>{item.label}</button
			>
		{/each}
	</div>

	<!-- Main area -->
	<div class="flex flex-1 flex-col overflow-hidden">
		<!-- Toolbar -->
		<div class="flex shrink-0 items-center gap-2 border-b border-neutral-800 px-3 py-2">
			<button
				class="font-mono text-xs text-neutral-600 transition-colors hover:text-neutral-400"
				onclick={goUp}>↑</button
			>
			<span class="flex-1 truncate font-mono text-xs text-neutral-600">{cwd}</span>
		</div>

		<!-- Content -->
		<div class="flex-1 overflow-y-auto">
			{#if error}
				<div class="p-3 font-mono text-xs text-red-500/80">{error}</div>
			{:else if !loaded}
				<div class="p-3 font-mono text-xs text-neutral-700">loading...</div>
			{:else if view === 'icon-grid'}
				<div class="flex flex-wrap gap-4 p-4">
					{#each entries as entry}
						<button
							class="group flex w-16 flex-col items-center gap-1.5 text-center"
							onclick={() => openEntry(entry)}
						>
							<img
								src={entry.icon ?? '/usr/share/icons/notepad.svg'}
								alt={displayName(entry)}
								class="pointer-events-none h-10 w-10"
							/>
							<span
								class="font-mono text-[10px] leading-tight break-all text-neutral-300 transition-colors group-hover:text-neutral-100"
								>{displayName(entry)}</span
							>
						</button>
					{/each}
				</div>
			{:else}
				{#each entries as entry}
					<button
						class="flex w-full items-center gap-2 border-b border-neutral-900 px-4 py-1.5 text-left font-mono text-xs transition-colors hover:bg-neutral-900"
						class:text-neutral-500={entry.isDir}
						class:text-neutral-400={!entry.isDir}
						onclick={() => openEntry(entry)}
					>
						<span class="text-neutral-600">{entry.isDir ? '/' : ' '}</span>
						{displayName(entry)}
					</button>
				{/each}
			{/if}
		</div>
	</div>
</div>
