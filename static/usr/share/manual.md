# pubOS manual

pubOS is a toy operating system that runs entirely in a web browser. it simulates a Unix-like environment — processes, a filesystem, a window manager — using only JavaScript, Svelte, and localStorage.

---

## architecture

### kernel

the kernel is a single Svelte writable store (`src/lib/kernel/store.ts`). it holds all system state in one object:

- `processes` — a Map of pid → process records
- `windows` — a Map of windowId → window records
- `env` — environment variables (`CWD`, `HOME`, `USER`, `PATH`, `HOSTNAME`)
- `nextPid` — auto-incrementing process id counter
- `fsRev` — filesystem revision counter; incremented on every write or remove; components watch this to detect changes (analogous to Linux `inotify`)

because it is a Svelte store, any component can subscribe to it with `$kernel` and react to state changes automatically.

---

### filesystem (VFS)

the virtual filesystem has three backends, unified behind a single interface (`src/lib/kernel/vfs.ts`):

**static** — files under `static/` are served by the web server and fetched on demand. the directory tree is pre-built into `static/fs-manifest.json` at build time by `scripts/build-manifest.js`. paths: `/bin`, `/etc`, `/usr`.

**localStorage** — files under `/home/` are stored in the browser's localStorage under keys prefixed with `pubOS:fs:`. they persist across sessions. this is where user files, config, and custom commands live.

**computed** — virtual paths that reflect live kernel state:

- `/proc/<pid>/name` — process name
- `/proc/<pid>/status` — process status
- `/proc/<pid>/ctl` — write `kill`, `stop`, or `resume` to signal a process; soundd (pid 2) also accepts `reload`, `mute`, `unmute`
- `/dev/screen` — lists all open windows
- `/dev/audio` — write a cue name to play a sound; read returns `active` or `muted`
- `/sys/version` — os version string
- `/sys/uptime` — seconds since boot
- `/sys/hostname` — hostname

all VFS operations (`read`, `write`, `list`, `stat`, `exists`) route through the same interface regardless of which backend handles them.

write access is restricted to `/home/` and special device paths like `/dev/audio` and `/proc/<pid>/ctl`. writing to any other path throws `read-only filesystem`; the terminal shows a 🔒 prefix on those errors.

---

### boot sequence

on first boot, pubOS:

1. loads `static/fs-manifest.json` to index the static filesystem
2. reads `/etc/environment` and loads env vars (`USER`, `HOME`, `PATH`, `HOSTNAME`, `EDITOR`)
3. copies `/etc/skel/` into `/home/user/` (only files not already in localStorage)
4. sources `/etc/profile` in the terminal (sets up shell environment)
5. starts `soundd` (pid 2) which loads the sound theme from `/usr/share/sounds/default/`

`/etc/skel/` contains the default home directory layout — desktop icons, finder bookmarks, etc. to reset your home directory, clear localStorage and reload.

---

### syscall interface

scripts do not have direct access to the kernel. they receive a `sys` object — a restricted facade — with these methods:

- `sys.read(path)` — read file contents
- `sys.write(path, content)` — write file
- `sys.remove(path)` — delete file
- `sys.list(path)` — list directory
- `sys.stat(path)` — get file metadata
- `sys.exists(path)` — check if path exists
- `sys.resolve(path)` — normalize path against CWD (handles `./`, `../`, relative)
- `sys.spawn(app, args)` — open an app window
- `sys.kill(pid)` — terminate a process
- `sys.ps()` — list processes
- `sys.env()` — get a copy of environment variables
- `sys.setenv(key, value)` — set an environment variable
- `sys.setTitle(title)` — set the window title
- `sys.exit()` — kill the current process
- `sys.reload()` — reload the page

all path arguments are automatically normalized — relative paths, `./`, and `../` all work correctly.

---

### commands

commands are plain JavaScript files stored on the filesystem — not compiled binaries, but readable and editable scripts.

when you type a command in the terminal, the kernel searches `PATH`:

```
/home/user/bin/<cmd>
/home/user/bin/<cmd>.js
/bin/<cmd>
/bin/<cmd>.js
```

scripts also support `.sh` extension — lines are executed sequentially as shell commands.

shell builtins (handled before file lookup): `export`, `clear`

---

### system commands

| command | description |
|---------|-------------|
| `ls [path]` | list directory. dirs shown with `/` suffix |
| `cd [path]` | change directory. supports `..` and relative paths |
| `cat <path>` | print file contents with syntax highlighting |
| `pwd` | print working directory |
| `touch <path>` | create empty file |
| `mkdir <path>` | create directory |
| `rm <path>` | remove file or directory (only `/home/`) |
| `cp <src> <dest>` | copy file; dest can be a directory |
| `ps` | list running processes |
| `top` | show processes, windows, and env |
| `kill <pid>` | terminate a process and close its window |
| `open <app>` | spawn an app window |
| `export KEY=val` | set environment variable |
| `echo <text>` | print text |
| `clear` | clear the terminal |
| `reboot` | reload the page |
| `help` | show command list |
| `pkg list` | list available packages from the network registry |
| `pkg install <name>` | install a package to `/usr/share/applications/` |
| `pkg remove <name>` | uninstall a package |
| `soundd [status\|reload\|mute\|unmute\|play <cue>]` | control the sound daemon |

tab completion: press Tab to complete commands (first word) or file/dir paths (subsequent words).

---

### apps

apps are Svelte components mounted inside window frames. each app receives a `pid` and optional `args` array as props.

| app | description |
|-----|-------------|
| `terminal` | interactive shell. executes commands from the VFS |
| `finder` | filesystem browser. sidebar from `~/.config/finder/bookmarks` |
| `settings` | wallpaper picker, light/dark/system theme |
| `monitor` | live process and window monitor |

webapps (app packages in `/usr/share/applications/`) run in sandboxed iframes with access to the `sys` bridge via `window.sys`. bundled webapps include **browser**, **editor**, and **preview**. installable packages (snake, conway, clock, synth) live in the network registry — install with `pkg install <name>`.

---

### finder

finder reads its sidebar bookmarks from `~/.config/finder/bookmarks` — a JSON array:

```json
[
  {"label": "home", "path": "/home/user"},
  {"label": "desktop", "path": "/home/user/Desktop"},
  {"label": "/", "path": "/"}
]
```

edit this file to customize your sidebar. each directory can also have a `.directory` file to control view mode:

```json
{ "view": "icon-grid" }
```

default is `list`.

---

### .desktop files

`.desktop` files are JSON descriptors. four forms:

```json
{ "app": "terminal", "label": "Terminal", "icon": "/usr/share/icons/terminal.svg" }
```

```json
{ "folder": "/usr/share/applications", "label": "Applications", "icon": "/usr/share/icons/folder.svg" }
```

```json
{ "launch": "/usr/share/applications/browser", "label": "Browser", "icon": "/usr/share/icons/browser.svg" }
```

```json
{ "file": "/home/user/notes.txt", "label": "Notes", "icon": "/usr/share/icons/file.svg" }
```

app packages: `/usr/share/applications/`. desktop icons: `/home/user/Desktop/`.

---

### webapps

webapps are app packages — directories with a `manifest.json` and `main.html` — that run inside a sandboxed iframe. they have access to `window.sys` — the same syscall interface as terminal scripts — via a postMessage bridge injected at load time. the system font and CSS variables are also injected automatically via `/usr/share/style.css`.

example webapp `main.html`:

```html
<script>
  sys.setTitle('My App')
  sys.read('/etc/motd').then(txt => document.body.textContent = txt)
</script>
```

`manifest.json` format:
```json
{ "name": "My App", "icon": "/usr/share/icons/app.svg", "version": "1.0" }
```

---

### sound system

pubOS has a live sound daemon (`soundd`, pid 2) that plays named audio cues on kernel events.

**theme file:** `/usr/share/sounds/default/theme.strudel`

each cue is a JavaScript function that receives a Web Audio `AudioContext`:

```javascript
cue("my-sound", (ctx) => {
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.connect(g); g.connect(ctx.destination)
  o.frequency.value = 440
  g.gain.setValueAtTime(0.1, ctx.currentTime)
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2)
  o.start(ctx.currentTime)
  o.stop(ctx.currentTime + 0.2)
})
```

**event map:** `/usr/share/sounds/default/events.json` — maps kernel event names to cue names:

```json
{ "window-open": "my-sound", "window-close": "fall", "error": "buzz" }
```

**playing sounds from the shell:**

```sh
echo "ping" > /dev/audio          # play the "ping" cue
soundd play notify                 # same thing
soundd reload                      # reload theme after editing
soundd mute                        # silence all sounds
soundd unmute
soundd status                      # show daemon status and loaded cues
```

**built-in events:** `window-open`, `window-close`, `notify`, `error`, `ping`, `boot`

to create a custom sound theme, edit `/usr/share/sounds/default/theme.strudel` in the editor and run `soundd reload`.

---

### window manager

windows support:
- **drag** — grab the titlebar
- **resize** — drag any edge or corner (8 directions)
- **minimize** — `[-]` button; click the taskbar entry to restore
- **fullscreen** — `[↗]` button; restores with `[↙]`
- **close** — `[x]` button; kills the process
- **focus** — click anywhere; focused window gets a brighter border

z-index is managed by the kernel — newly focused windows always get `max(zIndex) + 1`.

---

### themes

the settings app exposes three theme modes:

- **dark** — default dark theme
- **light** — light theme
- **system** — follows the OS `prefers-color-scheme` setting

theme is saved to `/home/user/.config/theme` and applied at boot.
wallpaper is saved to `/home/user/.config/wallpaper`.

---

### writing your own command

create a `.js` file anywhere on `PATH`. the simplest place is `/home/user/bin/`:

```js
// /home/user/bin/hello.js
print('hello, ' + (args[0] ?? 'world'))
```

run it with `hello` or `hello yourname`.

for multi-step scripts, use a `.sh` file:

```sh
mkdir /home/user/projects
cd /home/user/projects
touch readme.md
```

---

### persistence

| what | where | backend |
|------|-------|---------|
| user files | `/home/user/` | localStorage |
| finder bookmarks | `/home/user/.config/finder/bookmarks` | localStorage |
| wallpaper | `/home/user/.config/wallpaper` | localStorage |
| theme | `/home/user/.config/theme` | localStorage |
| system files | `/bin`, `/etc`, `/usr` | static (fetch) |
| process/window state | `/proc`, `/dev` | computed (in-memory) |

user data in localStorage survives page reloads. system files are read-only. computed paths reset on every boot.
