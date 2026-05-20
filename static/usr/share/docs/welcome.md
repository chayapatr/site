# Welcome to tidbitOS

tidbitOS is a minimal web OS.

## Getting started

- `ls /` — list the root filesystem
- `cat /etc/motd` — read the welcome message
- `open finder` — open the file browser
- `ps` — list running processes

## Creating commands

Write a JS file to `/home/user/bin/mycommand`:

    print('hello, ' + kernel.env.USER)

Then run `mycommand` from the terminal.
