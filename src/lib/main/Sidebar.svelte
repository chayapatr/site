<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import {
		sidebar,
		persistSidebarPrefs,
		resetSidebarPrefs,
		type FontChoice,
		type Theme
	} from '$lib/main/sidebarPrefs.svelte';

	type Props = { contentEl: HTMLElement | null; isScrolling: boolean; isMobile: boolean };
	let { contentEl, isScrolling, isMobile }: Props = $props();

	type LineEntry = { key: string; num: number; top: number };
	let lineEntries = $state<LineEntry[]>([]);
	let scrollTop = $state(0);

	// positions are relative to contentEl's own scrollable content (not the
	// page/document), since content now scrolls in its own container rather
	// than the body — a line's offset within that content is its viewport
	// position plus however far contentEl has already scrolled
	function updateLines() {
		if (!contentEl) {
			lineEntries = [];
			return;
		}
		const containerTop = contentEl.getBoundingClientRect().top;
		const els = contentEl.querySelectorAll<HTMLElement>('[data-line]');
		lineEntries = Array.from(els).map((el, i) => ({
			key: String(i),
			num: Number(el.dataset.line),
			top: el.getBoundingClientRect().top - containerTop + contentEl!.scrollTop
		}));
	}

	onMount(() => {
		const mo = new MutationObserver(() => requestAnimationFrame(updateLines));
		mo.observe(document.body, { childList: true, subtree: true });
		updateLines();
		return () => mo.disconnect();
	});

	// "/" toggles the sidebar (matches the handle's own tooltip hint) — no-op
	// on mobile, where the handle/drawer don't exist, and skipped while
	// typing in a text input (e.g. the PubOS terminal) so a literal "/"
	// character isn't hijacked
	function handleKeydown(e: KeyboardEvent) {
		if (isMobile || e.key !== '/') return;
		const target = e.target as HTMLElement;
		const isTyping =
			target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
		if (isTyping) return;
		e.preventDefault();
		sidebar.open = !sidebar.open;
	}

	$effect(() => {
		if (!contentEl) return;
		const handler = () => {
			scrollTop = contentEl!.scrollTop;
		};
		handler();
		contentEl.addEventListener('scroll', handler);
		return () => contentEl!.removeEventListener('scroll', handler);
	});

	$effect(() => {
		void isScrolling;
		updateLines();
	});

	// pushes the chosen fonts into the CSS custom properties layout.css reads
	// for .prose headers/body — kept here (rather than duplicated per-page)
	// since this is the one place the typography preference is edited
	$effect(() => {
		if (typeof document === 'undefined') return;
		document.documentElement.style.setProperty(
			'--font-header-current',
			`var(--font-header-${sidebar.headerFont})`
		);
		document.documentElement.style.setProperty(
			'--font-body-current',
			`var(--font-body-${sidebar.bodyFont})`
		);
		// lets layout.css target "body font is serif" specifically (e.g. to
		// soften Source Serif 4's color in dark mode, since it has no lighter
		// weight file loaded and reads heavier than basier square there)
		document.documentElement.dataset.bodyFont = sidebar.bodyFont;
	});

	// drives the "dark:" variant across the main site (see the
	// @custom-variant in layout.css) — separate from PubOS's own always-dark
	// [data-theme], since this is an explicit user toggle for the Pub side
	$effect(() => {
		if (typeof document === 'undefined') return;
		document.documentElement.setAttribute('data-pub-theme', sidebar.theme);
	});

	const fontOptions: { value: FontChoice; label: string }[] = [
		{ value: 'sans', label: 'Sans Serif' },
		{ value: 'serif', label: 'Serif' },
		{ value: 'mono', label: 'Monospace' }
	];

	function setTheme(theme: Theme) {
		sidebar.theme = theme;
		persistSidebarPrefs();
	}

	function setDisplayMode(mode: typeof sidebar.displayMode) {
		sidebar.displayMode = mode;
		persistSidebarPrefs();
	}

	function setHeaderFont(font: FontChoice) {
		sidebar.headerFont = font;
		persistSidebarPrefs();
	}

	function setBodyFont(font: FontChoice) {
		sidebar.bodyFont = font;
		persistSidebarPrefs();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if !isMobile}
	<div
		class="pointer-events-none fixed top-0 left-0 z-40 h-svh w-8 overflow-hidden border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
		transition:fade={{ duration: 250 }}
	>
		{#if sidebar.displayMode === 'number'}
			{#each lineEntries as entry (entry.key)}
				<div
					class="absolute left-1/2 flex h-5 w-5 items-center justify-center rounded-full border border-neutral-900/20 font-mono text-[10px] text-neutral-900/50 tabular-nums dark:border-neutral-100/20 dark:text-neutral-100/50"
					style="top: {entry.top - scrollTop}px; transform: translate(-50%, -50%)"
				>
					{entry.num}
				</div>
			{/each}
		{:else}
			<!-- static ruler ticks, no numbers/position tracking — purely
			     decorative alternative to the line-number circles above.
			     Positioned in its own inset matching the right Ruler's own
			     bounds (top-9, navbar-height-adjusted) rather than this outer
			     container's viewport-relative bounds, which the number circles
			     above need instead since their `top` values are computed
			     relative to contentEl's own viewport position, not the navbar. -->
			<div
				class="absolute top-9 left-0 flex h-[calc(100svh-2.25rem)] w-full flex-col items-start justify-between px-1.5 py-2"
			>
				{#each Array.from({ length: 41 }, (_, i) => i) as i (i)}
					<div class="relative flex items-center justify-start">
						<div
							class={i % 10 === 0
								? 'h-px w-2.5 bg-neutral-600 dark:bg-neutral-400'
								: 'h-px w-1 bg-neutral-400 dark:bg-neutral-600'}
						></div>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- drawer-style drag handle, floating just outside whichever edge is
	     currently outermost — the sidebar column's right edge when closed,
	     or the open drawer panel's right edge (left-8 + w-56 = 264px) once
	     it's open, so the handle always stays reachable to close it again -->
	<div
		class="group fixed top-1/2 z-40 -translate-x-1/2 -translate-y-1/2 transition-[left] duration-200 {sidebar.open
			? 'left-66'
			: 'left-10'}"
		transition:fade={{ duration: 250 }}
	>
		<button
			class="block h-10 w-1 cursor-pointer rounded-full bg-neutral-300 transition-colors group-hover:bg-neutral-400 dark:bg-neutral-700 dark:group-hover:bg-neutral-600"
			aria-label="Toggle sidebar"
			onclick={() => (sidebar.open = !sidebar.open)}
		></button>
		{#if !sidebar.open}
			<div
				class="pointer-events-none absolute top-1/2 left-1/2 flex translate-y-6 items-center gap-1.5 rounded-sm border border-black bg-white px-2 py-1 font-mono text-[13px] whitespace-nowrap text-black opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100 dark:border-neutral-100 dark:bg-neutral-900 dark:text-neutral-100"
			>
				Open Sidebar
				<span class="rounded-sm border border-black px-1 dark:border-neutral-100">/</span>
			</div>
		{/if}
	</div>

	{#if sidebar.open}
		<div
			class="fixed top-9 left-8 z-40 h-[calc(100svh-2.25rem)] w-56 overflow-y-auto border-r border-neutral-200 bg-white px-3 py-5 text-black dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
			transition:fly={{ x: -12, duration: 200 }}
		>
			<div class="mb-2 text-[13px] font-medium text-neutral-700 dark:text-neutral-300">Display</div>
			<div class="mb-4 flex flex-col gap-1">
				<button
					class="cursor-pointer rounded-sm px-2 py-1.5 text-left text-[13px] transition-colors {sidebar.displayMode ===
					'number'
						? 'bg-neutral-100 dark:bg-neutral-800'
						: 'text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'}"
					onclick={() => setDisplayMode('number')}
				>
					Number
				</button>
				<button
					class="cursor-pointer rounded-sm px-2 py-1.5 text-left text-[13px] transition-colors {sidebar.displayMode ===
					'ruler'
						? 'bg-neutral-100 dark:bg-neutral-800'
						: 'text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'}"
					onclick={() => setDisplayMode('ruler')}
				>
					Ruler
				</button>
			</div>

			<div class="mb-2.5 text-[13px] font-medium text-neutral-500 dark:text-neutral-400">Theme</div>
			<div class="mb-6 flex flex-col gap-1">
				<button
					class="cursor-pointer rounded-sm px-2 py-1.5 text-left text-[13px] transition-colors {sidebar.theme ===
					'light'
						? 'bg-neutral-100 dark:bg-neutral-800'
						: 'text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'}"
					onclick={() => setTheme('light')}
				>
					Light
				</button>
				<button
					class="cursor-pointer rounded-sm px-2 py-1.5 text-left text-[13px] transition-colors {sidebar.theme ===
					'dark'
						? 'bg-neutral-100 dark:bg-neutral-800'
						: 'text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'}"
					onclick={() => setTheme('dark')}
				>
					Dark
				</button>
			</div>

			<div class="mt-2 mb-4 h-px bg-neutral-100 dark:bg-neutral-800"></div>

			<div class="mb-4 text-[13px] font-medium text-neutral-700 dark:text-neutral-300">Typography</div>

			<div class="mb-2.5 text-[13px] font-medium text-neutral-500 dark:text-neutral-400">Header</div>
			<div class="mb-4 flex flex-col gap-1">
				{#each fontOptions as opt (opt.value)}
					<button
						class="cursor-pointer rounded-sm px-2 py-1.5 text-left text-[13px] transition-colors {sidebar.headerFont ===
						opt.value
							? 'bg-neutral-100 dark:bg-neutral-800'
							: 'text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'}"
						style="font-family: var(--font-header-{opt.value})"
						onclick={() => setHeaderFont(opt.value)}
					>
						{opt.label}
					</button>
				{/each}
			</div>

			<div class="mb-2.5 text-[13px] font-medium text-neutral-500 dark:text-neutral-400">Body</div>
			<div class="flex flex-col gap-1">
				{#each fontOptions as opt (opt.value)}
					<button
						class="cursor-pointer rounded-sm px-2 py-1.5 text-left text-[13px] transition-colors {sidebar.bodyFont ===
						opt.value
							? 'bg-neutral-100 dark:bg-neutral-800'
							: 'text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'}"
						style="font-family: var(--font-body-{opt.value})"
						onclick={() => setBodyFont(opt.value)}
					>
						{opt.label}
					</button>
				{/each}
			</div>

			<div class="my-4 h-px bg-neutral-100 dark:bg-neutral-800"></div>

			<button
				class="w-full cursor-pointer rounded-sm px-2 py-1.5 text-left text-[13px] text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-400 dark:hover:bg-red-950/40"
				onclick={resetSidebarPrefs}
			>
				Reset all
			</button>
		</div>
	{/if}
{/if}
