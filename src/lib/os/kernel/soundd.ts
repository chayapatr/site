// Sound daemon — loads /usr/share/sounds/default/theme.js and plays named cues
// on kernel events. Acts as PID 2 in /proc.
// Theme cues receive (ctx: AudioContext, Tone) and can use either Web Audio or Tone.js.

interface CueFn {
	(): void;
}

const THEME_PATH = '/usr/share/sounds/default/theme.js';
const EVENTS_PATH = '/usr/share/sounds/default/events.json';
const TONE_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js';

type ReadFn = (path: string) => Promise<string>;

class SoundDaemon {
	private cues: Map<string, CueFn> = new Map();
	private eventMap: Record<string, string> = {};
	private loaded = false;
	private loading = false;
	private muted = false;
	private _read: ReadFn | null = null;
	private ctx: AudioContext | null = null;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private Tone: any = null;

	setReader(read: ReadFn) {
		this._read = read;
	}

	private async read(path: string): Promise<string> {
		if (!this._read) throw new Error('soundd: no reader set');
		return this._read(path);
	}

	async start(read: ReadFn) {
		this.setReader(read);
		await this.loadTone();
		await this.load();
	}

	private async loadTone() {
		if (typeof window === 'undefined') return;
		if ((window as any).Tone) { this.Tone = (window as any).Tone; return; }
		await new Promise<void>((resolve) => {
			const s = document.createElement('script');
			s.src = TONE_CDN;
			s.onload = () => { this.Tone = (window as any).Tone; resolve(); };
			s.onerror = () => resolve();
			document.head.appendChild(s);
		});
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
		const register = (name: string, fn: CueFn) => {
			this.cues.set(name, fn);
		};
		try {
			// eslint-disable-next-line no-new-func
			const fn = new Function('cue', 'Tone', source);
			fn(register, this.Tone);
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
			(cue as (ctx: AudioContext, Tone: unknown) => void)(this.getAudioContext(), this.Tone);
		} catch (e) {
			console.warn(`soundd: cue "${cueName}" error`, e);
		}
	}

	mute() {
		this.muted = true;
		window.dispatchEvent(new CustomEvent('soundd-mute-change', { detail: true }));
	}

	unmute() {
		this.muted = false;
		window.dispatchEvent(new CustomEvent('soundd-mute-change', { detail: false }));
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
