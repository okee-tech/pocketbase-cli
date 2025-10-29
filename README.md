pocketbase-cli
=================

A new CLI generated with oclif


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/pocketbase-cli.svg)](https://npmjs.org/package/pocketbase-cli)
[![Downloads/week](https://img.shields.io/npm/dw/pocketbase-cli.svg)](https://npmjs.org/package/pocketbase-cli)


<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @okee-tech/pocketbase-cli
$ pocketbase COMMAND
running command...
$ pocketbase (--version)
@okee-tech/pocketbase-cli/0.0.6 win32-x64 node-v22.15.0
$ pocketbase --help [COMMAND]
USAGE
  $ pocketbase COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`pocketbase help [COMMAND]`](#pocketbase-help-command)
* [`pocketbase init`](#pocketbase-init)
* [`pocketbase migrate`](#pocketbase-migrate)
* [`pocketbase reset`](#pocketbase-reset)
* [`pocketbase start`](#pocketbase-start)
* [`pocketbase status`](#pocketbase-status)
* [`pocketbase stop`](#pocketbase-stop)

## `pocketbase help [COMMAND]`

Display help for pocketbase.

```
USAGE
  $ pocketbase help [COMMAND...] [-n]

ARGUMENTS
  [COMMAND...]  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for pocketbase.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.34/src/commands/help.ts)_

## `pocketbase init`

Initialized PocketBase project in current directory

```
USAGE
  $ pocketbase init

DESCRIPTION
  Initialized PocketBase project in current directory

EXAMPLES
  $ pocketbase init
```

_See code: [src/commands/init.ts](https://github.com/okee-tech/pocketbase-cli/blob/v0.0.6/src/commands/init.ts)_

## `pocketbase migrate`

describe the command here

```
USAGE
  $ pocketbase migrate

DESCRIPTION
  describe the command here

EXAMPLES
  $ pocketbase migrate
```

_See code: [src/commands/migrate.ts](https://github.com/okee-tech/pocketbase-cli/blob/v0.0.6/src/commands/migrate.ts)_

## `pocketbase reset`

Reset PocketBase server, re-applying migrations

```
USAGE
  $ pocketbase reset

DESCRIPTION
  Reset PocketBase server, re-applying migrations

EXAMPLES
  $ pocketbase reset
```

_See code: [src/commands/reset.ts](https://github.com/okee-tech/pocketbase-cli/blob/v0.0.6/src/commands/reset.ts)_

## `pocketbase start`

Start PocketBase server

```
USAGE
  $ pocketbase start

DESCRIPTION
  Start PocketBase server

EXAMPLES
  $ pocketbase start
```

_See code: [src/commands/start.ts](https://github.com/okee-tech/pocketbase-cli/blob/v0.0.6/src/commands/start.ts)_

## `pocketbase status`

Display status information

```
USAGE
  $ pocketbase status

DESCRIPTION
  Display status information

EXAMPLES
  $ pocketbase status
```

_See code: [src/commands/status.ts](https://github.com/okee-tech/pocketbase-cli/blob/v0.0.6/src/commands/status.ts)_

## `pocketbase stop`

Stop PocketBase server

```
USAGE
  $ pocketbase stop

DESCRIPTION
  Stop PocketBase server

EXAMPLES
  $ pocketbase stop
```

_See code: [src/commands/stop.ts](https://github.com/okee-tech/pocketbase-cli/blob/v0.0.6/src/commands/stop.ts)_
<!-- commandsstop -->
