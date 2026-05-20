<script lang="ts">
	import { kernel } from '$lib/os/kernel/store';
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
		entries = withStats;
		try {
			const cfg = JSON.parse(await kernel.read((cwd === '/' ? '' : cwd) + '/.directory'));
			view = cfg.view === 'grid' ? 'grid' : 'list';
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
						class="flex w-full items-center gap-2 border-b border-neutral-900 px-4 py-1.5 text-left font-mono text-xs transition-colors hover:bg-neutral-900"
						class:text-neutral-500={entry.isDir}
						class:text-neutral-400={!entry.isDir}
						onclick={() => openEntry(entry)}
						oncontextmenu={(e) => onEntryContextMenu(e, entry)}
					>
						<span class="text-neutral-600">{entry.isDir ? '/' : ' '}</span>
						{displayName(entry)}
					</button>
				{/each}
			{/if}
		</div>
	</div>
</div>
