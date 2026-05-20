const app = args[0]
if (!app) { print('open: specify an app (finder, terminal, browser, notepad, settings, monitor)') }
else { sys.spawn(app, args.slice(1)) }
