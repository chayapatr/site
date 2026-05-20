// Sound daemon — loads /usr/share/sounds/default/theme.strudel and plays named cues
// on kernel events. Acts as PID 2 in /proc.

interface CueFn {
	(): void;
}

interface StrudelAPI {
	evaluate(code: string): Promise<void>;
}

declare global {
	interface Window {
		__strudelRepl?: StrudelAPI;
	}
}

const THEME_PATH = '/usr/share/sounds/default/theme.strudel';
const EVENTS_PATH = '/usr/share/sounds/default/events.json';
const STRUDEL_CDN = 'https://unpkg.com/@strudel/repl@latest/dist/index.js';

type ReadFn = (path: string) => Promise<string>;

class SoundDaemon {
	private cues: Map<string, CueFn> = new Map();
	private eventMap: Record<string, string> = {};
	private loaded = false;
	private loading = false;
	private muted = false;
	private _read: ReadFn | null = null;
	private AudioContext: typeof window.AudioContext | null = null;
	private ctx: AudioContext | null = null;

	setReader(read: ReadFn) {
		this._read = read;
	}

	private async read(path: string): Promise<string> {
		if (!this._read) throw new Error('soundd: no reader set');
		return this._read(path);
	}

	async start(read: ReadFn) {
		this.setReader(read);
		await this.load();
	}

	async load() {
		if (this.loading) return;
		this.loading = true;
		try {
			const [themeRaw, eventsRaw] = await Promise.all([
				this.read(THEME_PATH),
				this.read(EVENTS_PATH).catch(() => '{}')
			]);
			this.eventMap = JSON.parse(eventsRaw);
			this.parseCues(themeRaw);
			this.loaded = true;
		} catch (e) {
			console.warn('soundd: failed to load theme', e);
		} finally {
			this.loading = false;
		}
	}

	private parseCues(source: string) {
		this.cues.clear();
		// execute the theme file in a sandboxed context
		// theme format: cue("name", () => { /* tone.js or web audio */ })
		const register = (name: string, fn: CueFn) => {
			this.cues.set(name, fn);
		};
		try {
			// eslint-disable-next-line no-new-func
			const fn = new Function('cue', source);
			fn(register);
		} catch (e) {
			console.warn('soundd: theme parse error', e);
		}
	}

	private getAudioContext(): AudioContext {
		if (!this.ctx) {
			this.ctx = new AudioContext();
		}
		if (this.ctx.state === 'suspended') {
			this.ctx.resume();
		}
		return this.ctx;
	}

	play(event: string) {
		if (this.muted || !this.loaded) return;
		const cueName = this.eventMap[event] ?? event;
		const cue = this.cues.get(cueName);
		if (!cue) return;
		try {
			// inject AudioContext into the cue call
			(cue as (ctx: AudioContext) => void)(this.getAudioContext());
		} catch (e) {
			console.warn(`soundd: cue "${cueName}" error`, e);
		}
	}

	mute() {
		this.muted = true;
	}

	unmute() {
		this.muted = false;
	}

	get isMuted() {
		return this.muted;
	}

	get isLoaded() {
		return this.loaded;
	}

	getCues(): string[] {
		return Array.from(this.cues.keys());
	}

	getEventMap(): Record<string, string> {
		return { ...this.eventMap };
	}
}

export const soundd = new SoundDaemon();
