// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
	interface Window {
		getBlock:  (slug: string, parentIndex: number) => Promise<number>;
		jump: (x: string, y: string, width: string, height: string, id: string) => undefined;
	}
}

export {};
