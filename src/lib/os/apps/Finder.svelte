<script lang="ts">
	import { kernel } from '$lib/os/kernel/store';
	import { bus } from '$lib/os/kernel/events';
	import type { AppType } from '$lib/os/kernel/types';
	import type { MenuItem } from '$lib/os/desktop/ContextMenu.svelte';
	import { showContextMenu } from '$lib/os/desktop/contextmenu';

	let { pid, args = [] }: { pid: number; args?: string[] } = $props();

	type Entry = { name: string; isDir: boolean; icon?: string };
	type DesktopFile = { label: string; icon: string } & (
		| { app: AppType }
		| { folder: string }
		| { launch: string }
		| { webapp: string }
	);
	type ViewMode = 'list' | 'grid';

	type Bookmark = { label: string; path: string };

	let cwd = $state(args[0] ?? '/home/user');
	let entries = $state<Entry[]>([]);
	let view = $state<ViewMode>('list');
	let error = $state('');
	let loaded = $state(false);
	let sidebar = $state<Bookmark[]>([]);
	let showDotfiles = $state(true);

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

	kernel.read('/home/user/.config/show-dotfiles')
		.then(v => { showDotfiles = v.trim() !== 'false' })
		.catch(() => { showDotfiles = true });

	$effect(() => {
		const dir = cwd;
		return bus.watch(dir, (_event, _path) => reload());
	});

	$effect(() => {
		return bus.on('dotfiles:change', ({ show }) => { showDotfiles = show; reload(); });
	});

	async function reload() {
		const allNames = await kernel.list(cwd).catch(() => [] as string[]);
		const names = showDotfiles ? allNames : allNames.filter(n => !n.startsWith('.'));
		const withStats = await Promise.all(
			names.map(async (n) => {
				const full = cwd === '/' ? `/${n}` : `${cwd}/${n}`;
				try {
					const s = await kernel.stat(full);
					const isDir = s.type === 'dir';
					let icon = isDir ? '/usr/share/icons/folder.svg' : '/usr/share/icons/file.svg';
					if (isDir) {
						try {
							const m = JSON.parse(await kernel.read(full + '/manifest.json'));
							icon = m.icon ?? '/usr/share/icons/app.svg';
						} catch {
							/* keep folder icon */
						}
					} else if (n.endsWith('.desktop')) {
						try {
							const def = JSON.parse(await kernel.read(full)) as DesktopFile;
							if (def.icon) icon = def.icon;
						} catch {
							/* keep default */
						}
					}
					return { name: n, isDir, icon };
				} catch {
					return { name: n, isDir: false, icon: '/usr/share/icons/file.svg' };
				}
			})
		);
		try {
			const cfg = parseDirFile(await kernel.read((cwd === '/' ? '' : cwd) + '/.directory'));
			view = cfg.view === 'grid' ? 'grid' : 'list';
			if (cfg.order === 'alpha') {
				withStats.sort((a, b) => a.name.localeCompare(b.name));
			} else if (cfg.order === 'type') {
				withStats.sort((a, b) => (a.isDir === b.isDir ? a.name.localeCompare(b.name) : a.isDir ? -1 : 1));
			}
		} catch {
			view = 'list';
		}
		entries = withStats;
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
				if ('launch' in def) {
					kernel.spawnApp(def.launch);
					return;
				}
				if ('webapp' in def) {
					kernel.spawnApp(def.webapp);
					return;
				}
			} catch {
				/* fall through */
			}
		}
		if (ext && ['png','jpg','jpeg','gif','webp','svg','bmp'].includes(ext)) kernel.spawnApp('/usr/share/applications/preview', path)
		else if (ext && ['md','html','js','ts','css','json'].includes(ext)) kernel.spawnApp('/usr/share/applications/editor', path)
		else kernel.spawnApp('/usr/share/applications/editor', path);
	}

	async function openEntry(entry: Entry) {
		const path = fullPath(entry.name);
		if (entry.isDir) {
			const hasManifest = await kernel.exists(path + '/manifest.json');
			if (hasManifest) {
				kernel.spawnApp(path);
				return;
			}
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

	async function onEntryContextMenu(e: MouseEvent, entry: Entry) {
		e.preventDefault();
		e.stopPropagation();
		const path = fullPath(entry.name);
		const ext = entry.name.split('.').pop() ?? '';
		const items: MenuItem[] = [];

		// Open (default)
		items.push({ label: 'Open', action: () => openEntry(entry) });

		// Open With
		const openWith: MenuItem[] = [];
		if (entry.isDir) {
			openWith.push({ label: 'Browse Folder', action: () => navigate(path) });
			const hasManifest = await kernel.exists(path + '/manifest.json');
			if (hasManifest) openWith.push({ label: 'Launch App', action: () => kernel.spawnApp(path) });
		} else if (['png','jpg','jpeg','gif','webp','bmp'].includes(ext)) {
			openWith.push({ label: 'Preview', action: () => kernel.spawnApp('/usr/share/applications/preview', path) });
			openWith.push({ label: 'Editor', action: () => kernel.spawnApp('/usr/share/applications/editor', path) });
		} else if (['html','htm'].includes(ext)) {
			openWith.push({ label: 'Browser', action: () => kernel.spawnApp('/usr/share/applications/browser', path) });
			openWith.push({ label: 'Editor', action: () => kernel.spawnApp('/usr/share/applications/editor', path) });
		} else if (['md','js','ts','css','json','txt'].includes(ext)) {
			openWith.push({ label: 'Editor', action: () => kernel.spawnApp('/usr/share/applications/editor', path) });
			openWith.push({ label: 'Browser', action: () => kernel.spawnApp('/usr/share/applications/browser', 'file://' + path) });
		}
		if (openWith.length > 1) items.push({ label: 'Open With', children: openWith });

		items.push({ separator: true });

		// Rename
		items.push({
			label: 'Rename',
			action: async () => {
				const newName = prompt('Rename to:', displayName(entry));
				if (!newName || newName === displayName(entry)) return;
				const newPath = `${cwd === '/' ? '' : cwd}/${newName}`;
				try {
					const content = await kernel.read(path);
					kernel.write(newPath, content);
					kernel.remove(path);
				} catch {
					/* dir or unreadable */
				}
			}
		});

		// Delete
		items.push({ label: 'Delete', danger: true, action: () => kernel.remove(path) });

		showContextMenu(e.clientX, e.clientY, items);
	}

	function dirFile() { return (cwd === '/' ? '' : cwd) + '/.directory' }

	function parseDirFile(raw: string): Record<string, string> {
		const cfg: Record<string, string> = {}
		for (const line of raw.split('\n')) {
			const colon = line.indexOf(':')
			if (colon === -1) continue
			cfg[line.slice(0, colon).trim()] = line.slice(colon + 1).trim()
		}
		return cfg
	}

	async function writeDirFile(cfg: Record<string, string>) {
		const lines = Object.entries(cfg).map(([k, v]) => `${k}: ${v}`).join('\n')
		kernel.write(dirFile(), lines + '\n')
	}

	async function onBgContextMenu(e: MouseEvent) {
		if ((e.target as HTMLElement).closest('button')) return
		e.preventDefault()
		e.stopPropagation()
		let cfg: Record<string, string> = {}
		try { cfg = parseDirFile(await kernel.read(dirFile())) } catch {}
		const isGrid = cfg.view === 'grid'
		showContextMenu(e.clientX, e.clientY, [
			{
				label: isGrid ? 'View: List' : 'View: Grid',
				action: async () => {
					const c = parseDirFile(await kernel.read(dirFile()).catch(() => ''))
					c.view = isGrid ? 'list' : 'grid'
					await writeDirFile(c)
					reload()
				}
			},
			{
				label: 'Order',
				children: [
					{
						label: 'Alphabetical' + (cfg.order === 'alpha' ? ' ✓' : ''),
						action: async () => { const c = parseDirFile(await kernel.read(dirFile()).catch(() => '')); c.order = 'alpha'; await writeDirFile(c); reload() }
					},
					{
						label: 'Type' + (cfg.order === 'type' ? ' ✓' : ''),
						action: async () => { const c = parseDirFile(await kernel.read(dirFile()).catch(() => '')); c.order = 'type'; await writeDirFile(c); reload() }
					},
					{
						label: 'None' + (!cfg.order || cfg.order === 'none' ? ' ✓' : ''),
						action: async () => { const c = parseDirFile(await kernel.read(dirFile()).catch(() => '')); delete c.order; await writeDirFile(c); reload() }
					},
				]
			},
			{ separator: true as const },
			{
				label: 'New Folder',
				action: async () => {
					const name = prompt('Folder name:', 'New Folder')
					if (!name) return
					kernel.write(`${cwd === '/' ? '' : cwd}/${name}/.directory`, 'view: list\n')
				}
			},
			{
				label: 'New File',
				action: async () => {
					const name = prompt('File name:', 'untitled.txt')
					if (!name) return
					kernel.write(`${cwd === '/' ? '' : cwd}/${name}`, '')
				}
			},
		])
	}

	navigate(cwd);
</script>

<div class="flex h-full">
	<!-- Sidebar -->
	<div class="flex w-32 shrink-0 flex-col border-r py-2" style="border-color: var(--os-border);">
		{#each sidebar as item}
			<button
				class="px-3 py-1.5 text-left font-mono text-xs transition-colors"
				style={cwd === item.path
					? 'color: var(--os-text); background: var(--os-selected);'
					: 'color: var(--os-text-dim);'}
				onclick={() => navigate(item.path)}>{item.label}</button
			>
		{/each}
	</div>

	<!-- Main area -->
	<div class="flex flex-1 flex-col overflow-hidden">
		<!-- Toolbar -->
		<div class="flex shrink-0 items-center gap-2 border-b px-3 py-2" style="border-color: var(--os-border);">
			<button
				class="font-mono text-xs transition-colors"
				style="color: var(--os-text-dim);"
				onclick={goUp}>↑</button
			>
			<span class="flex-1 truncate font-mono text-xs" style="color: var(--os-text-dim);">{cwd}</span>
		</div>

		<!-- Content -->
		<div class="flex-1 overflow-y-auto" oncontextmenu={onBgContextMenu} role="none">
			{#if error}
				<div class="p-3 font-mono text-xs text-red-500/80">{error}</div>
			{:else if !loaded}
				<div class="p-3 font-mono text-xs text-neutral-700">loading...</div>
			{:else if view === 'grid'}
				<div class="flex flex-wrap gap-4 p-4">
					{#each entries as entry}
						<button
							class="group flex w-16 flex-col items-center gap-1.5 text-center"
							onclick={() => openEntry(entry)}
							oncontextmenu={(e) => onEntryContextMenu(e, entry)}
						>
							<img
								src={entry.icon ?? '/usr/share/icons/file.svg'}
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
						class="finder-row flex w-full items-center gap-2 border-b px-4 py-1.5 text-left font-mono text-xs transition-colors"
						style="border-color: var(--os-border-subtle); color: var(--os-text);"
						onclick={() => openEntry(entry)}
						oncontextmenu={(e) => onEntryContextMenu(e, entry)}
					>
						<span style="color: var(--os-text-dim);">{entry.isDir ? '/' : ' '}</span>
						{displayName(entry)}
					</button>
				{/each}
			{/if}
		</div>
	</div>
</div>
