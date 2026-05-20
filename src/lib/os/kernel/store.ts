import { writable, get } from 'svelte/store';
import type { KernelState, Process, AppType, Kernel, FSManifestNode } from './types';
import { loadManifest, findNode } from './manifest';
import { vfsRead, vfsWrite, vfsRemove, vfsList, vfsStat, vfsExists } from './vfs';
import { soundd } from './soundd';
import { bus } from './events';

const APP_META: Record<AppType, { title: string; icon: string }> = {
	finder: { title: 'Finder', icon: '/usr/share/icons/finder.svg' },
	terminal: { title: 'Terminal', icon: '/usr/share/icons/terminal.svg' },
	settings: { title: 'Settings', icon: '/usr/share/icons/settings.svg' },
	monitor: { title: 'Monitor', icon: '/usr/share/icons/monitor.svg' },
	script: { title: 'Script', icon: '' },
	app: { title: 'App', icon: '/usr/share/icons/app.svg' }
};

function createKernel() {
	const initialState: KernelState = {
		processes: new Map(),
		windows: new Map(),
		nextPid: 1,
		startedAt: Date.now(),
		env: {
			USER: 'user',
			HOME: '/home/user',
			PATH: '/home/user/bin:/bin',
			CWD: '/home/user',
			HOSTNAME: 'pubOS'
		}
	};

	const { subscribe, update, set } = writable(initialState);

	let manifest: FSManifestNode | null = null;

	let initialized = false;

	async function copySkel(manifest: FSManifestNode) {
		// recursively collect all files under /etc/skel from the static manifest
		const files: { skelPath: string; destPath: string }[] = [];
		function walk(node: FSManifestNode, skelBase: string, destBase: string) {
			if (node.type === 'file') {
				files.push({ skelPath: skelBase, destPath: destBase });
			} else if (node.type === 'dir' && node.children) {
				for (const child of node.children) {
					walk(child, `${skelBase}/${child.name}`, `${destBase}/${child.name}`);
				}
			}
		}
		// find /etc/skel node in manifest
		const etcNode = (manifest as FSManifestNode & { children?: FSManifestNode[] }).children?.find(
			(n: FSManifestNode) => n.name === 'etc'
		);
		const skelNode = (etcNode as FSManifestNode & { children?: FSManifestNode[] })?.children?.find(
			(n: FSManifestNode) => n.name === 'skel'
		);
		if (!skelNode) return;
		walk(skelNode, '/etc/skel', '/home/user');

		for (const { skelPath, destPath } of files) {
			const key = 'pubOS:fs:' + destPath;
			if (localStorage.getItem(key) !== null) continue;
			try {
				const res = await fetch(skelPath);
				if (res.ok) localStorage.setItem(key, await res.text());
			} catch {
				/* skip */
			}
		}
	}

	async function init() {
		if (initialized) return;
		initialized = true;
		manifest = await loadManifest();
		await copySkel(manifest);
		// load /etc/environment into env
		try {
			const res = await fetch('/etc/environment');
			if (res.ok) {
				const env: Record<string, string> = {};
				for (const line of (await res.text()).split('\n')) {
					const eq = line.indexOf('=');
					if (eq === -1 || line.startsWith('#')) continue;
					env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
				}
				update((s) => {
					Object.assign(s.env, env);
					s.env.CWD = env.HOME ?? s.env.CWD;
					return s;
				});
			}
		} catch {
			/* use defaults */
		}
		update((s) => {
			s.processes.set(1, {
				pid: 1,
				name: 'init',
				app: 'script',
				status: 'running',
				windowId: null,
				startedAt: Date.now()
			});
			s.processes.set(2, {
				pid: 2,
				name: 'soundd',
				app: 'script',
				status: 'running',
				windowId: null,
				startedAt: Date.now()
			});
			s.nextPid = 3;
			return s;
		});

		// start sound daemon (non-blocking, loads theme in background)
		soundd.start((path) => vfsRead(path, get({ subscribe }), manifest!));
	}

	function getManifest(): FSManifestNode {
		if (!manifest) throw new Error('kernel not initialized');
		return manifest;
	}

	function getState(): KernelState {
		return get({ subscribe });
	}

	const kernel = {
		subscribe,
		update,
		init,

		get env(): Record<string, string> {
			return getState().env;
		},

		getState(): KernelState {
			return getState();
		},

		setEnv(key: string, value: string): void {
			update((s) => {
				s.env[key] = value;
				return s;
			});
		},

		async read(path: string): Promise<string> {
			return vfsRead(path, getState(), getManifest());
		},

		write(path: string, content: string): void {
			const state = getState();
			vfsWrite(path, content, state);
		},

		remove(path: string): void {
			vfsRemove(path);
		},

		async list(path: string): Promise<string[]> {
			return vfsList(path, getState(), getManifest());
		},

		async stat(path: string) {
			return vfsStat(path, getState(), getManifest());
		},

		async exists(path: string): Promise<boolean> {
			return vfsExists(path, getState(), getManifest());
		},

		emit(event: string): void {
			soundd.play(event);
		},

		spawn(app: AppType, args: string[] = []): number {
			let pid = 0;
			update((s) => {
				pid = s.nextPid++;
				const windowId = crypto.randomUUID();
				s.processes.set(pid, {
					pid,
					name: app,
					app,
					status: 'running',
					windowId,
					startedAt: Date.now()
				});
				const meta = APP_META[app];
				s.windows.set(windowId, {
					id: windowId,
					pid,
					title: meta.title,
					appType: app,
					appState: { args, icon: meta.icon },
					position: { x: 80 + Math.random() * 200, y: 60 + Math.random() * 100 },
					size: { width: 640, height: 440 },
					zIndex: Math.max(0, ...Array.from(s.windows.values()).map((w) => w.zIndex)) + 1,
					focused: true,
					minimized: false
				});
				for (const [id, win] of s.windows) {
					if (id !== windowId) win.focused = false;
				}
				return s;
			});
			soundd.play('window-open');
			const state = getState();
			const proc = state.processes.get(pid);
			if (proc) bus.emit('proc:spawn', { pid, name: proc.name });
			const win = Array.from(getState().windows.values()).find(w => w.pid === pid);
			if (win) bus.emit('win:open', { windowId: win.id, pid });
			return pid;
		},

		async spawnApp(path: string, fileArg?: string): Promise<number> {
			// if path is a directory, look for manifest.json + main.html
			let htmlPath = path;
			let icon = '/usr/share/icons/app.svg';
			let name = fileArg ? (fileArg.split('/').pop() ?? 'App') : (path.split('/').pop() ?? 'App');
			try {
				const manifestRaw = await vfsRead(path + '/manifest.json', get({ subscribe }), manifest!);
				const m = JSON.parse(manifestRaw);
				htmlPath = path + '/main.app';
				if (m.name) name = fileArg ? (fileArg.split('/').pop() ?? m.name) : m.name;
				if (m.icon) icon = m.icon;
			} catch {
				/* not a package dir, treat path as direct html file */
			}

			let pid = 0;
			update((s) => {
				pid = s.nextPid++;
				const windowId = crypto.randomUUID();
				s.processes.set(pid, {
					pid,
					name,
					app: 'app',
					status: 'running',
					windowId,
					startedAt: Date.now()
				});
				s.windows.set(windowId, {
					id: windowId,
					pid,
					title: name,
					appType: 'app',
					appState: { path: htmlPath, icon, fileArg: fileArg ?? null },
					position: { x: 80 + Math.random() * 200, y: 60 + Math.random() * 100 },
					size: { width: 640, height: 440 },
					zIndex: Math.max(0, ...Array.from(s.windows.values()).map((w) => w.zIndex)) + 1,
					focused: true,
					minimized: false
				});
				for (const [id, win] of s.windows) if (id !== windowId) win.focused = false;
				return s;
			});
			soundd.play('window-open');
			bus.emit('proc:spawn', { pid, name });
			bus.emit('win:open', { windowId: (getState().processes.get(pid)?.windowId ?? ''), pid });
			return pid;
		},

		kill(pid: number): void {
			const proc = getState().processes.get(pid);
			const windowId = proc?.windowId ?? null;
			const name = proc?.name ?? '';
			update((s) => {
				if (proc?.windowId) s.windows.delete(proc.windowId);
				s.processes.delete(pid);
				return s;
			});
			bus.emit('proc:kill', { pid, name });
			if (windowId) bus.emit('win:close', { windowId, pid });
			if (pid === 2) {
				soundd.mute();
			} else {
				soundd.play('window-close');
			}
		},

		ps(): Process[] {
			return Array.from(getState().processes.values());
		},

		patches(): string[] {
			const LS_PREFIX = 'pubOS:fs:';
			const patched: string[] = [];
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i)!;
				if (!key.startsWith(LS_PREFIX)) continue;
				const path = key.slice(LS_PREFIX.length);
				if (path.startsWith('/home/')) continue;
				if (manifest && findNode(manifest, path)?.type === 'file') patched.push(path);
			}
			return patched.sort();
		},

		setTitle(pid: number, title: string): void {
			update((s) => {
				const proc = s.processes.get(pid);
				if (proc?.windowId) {
					const win = s.windows.get(proc.windowId);
					if (win) win.title = title;
				}
				return s;
			});
		}
	};

	return kernel;
}

export const kernel = createKernel();
export type KernelStore = ReturnType<typeof createKernel>;
