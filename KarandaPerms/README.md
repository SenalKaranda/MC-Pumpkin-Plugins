# KarandaPerms

Permissions, groups, chat prefixes, and a local web editor for a Pumpkin server.

Command replies use `[KarandaPerms]`, `[KPerms]`, or `[KP]`, chosen by `display.brand` in `config.toml`. The brackets are grey and the name is red. A successful reply uses `colors.info`, an error uses `colors.error`, and `/kp` with no arguments uses `colors.text`. Player chat uses `display.chat`.

## Install

Copy `karanda_perms.wasm` into the server's `plugins` folder and restart.

The first launch creates `plugins/data/karanda-perms/`, plus `config.toml`, `db.bin`, and a `default` group when the database has no groups.

When the server asks, allow the plugin to read and write its data folder. Denying either one skips the plugin.

## Data files

| File | Contents |
| --- | --- |
| `config.toml` | Editor address, reply colors, and display formats. Created if it is missing. |
| `db.bin` | Groups, users, revision, and the nodes last written onto online players. |
| `editor/sessions/<code>.json` | Snapshot written by `/kp editor`. |
| `editor/pending/<code>.json` | Full replacement waiting for the plugin to apply. |
| `editor/results/<code>.json` | Apply result: applied, conflict, or error. |
| `editor/live.lock` | Held while the editor process is running. |

## Configuration

`config.toml` starts with the plugin name, a one-line purpose, and the version. Missing keys keep the defaults. A file that is not valid TOML, a `display.brand` other than `long`, `mid`, or `short`, or a color that is not hex, is rejected. The file is left in place. On startup that stops the plugin from loading. `/kp reload` reports the error and keeps the config already running.

```toml
[display]
brand = "long"
```

`brand` is `long`, `mid`, or `short`. A blank value is `long`. `long` prints `[KarandaPerms]`. `mid` prints `[KPerms]`. `short` prints `[KP]`. The command label is `display.brand`.

| Key | Default | Meaning |
| --- | --- | --- |
| `editor.host` | `127.0.0.1` | Address printed by `/kp editor`. This is not the address the editor process binds. |
| `editor.port` | `8787` | Port printed in that link. KarandaRewards uses 8788. KarandaWorldTools uses 8789. |
| `editor.auto_apply` | `true` | Apply pending editor files about once a second. |
| `colors.info` | `#55FF55` | Successful command replies. |
| `colors.error` | `#FF5555` | Failed command replies. |
| `colors.accent` | `#FFAA00` | Stored and checked as a hex color. The command prefix uses grey brackets and a red name, so replies leave this key unused. |
| `colors.text` | `#FFFFFF` | The `/kp` help line. |
| `colors.muted` | `#AAAAAA` | Stored and checked as a hex color. Command replies leave it unused. |
| `display.brand` | `long` | `long` is `[KarandaPerms]`. `mid` is `[KPerms]`. `short` is `[KP]`. |
| `display.chat` | `[{prefix}] {name}: {message}` | Chat line. |
| `display.world` | `{prefix}{name}{suffix}` | Tab list name. `{message}` is omitted. |

A legacy `display.format` fills `chat` and `world` when those keys are missing. A missing `world` falls back to `chat`.

Hex colors accept `#RGB`, `#RRGGBB`, and the same forms without `#`.

`&` in a chat format, group prefix, group suffix, display name, or group color is rewritten to `§`.

## How a check is decided

Groups and users live in `db.bin`. A node set to `true` grants it. `false` denies it. When the database has no groups, the plugin creates `default` at weight 0 with `is_default` on, and the revision becomes 1. A player who joins is stored by UUID and added to every group marked default. Passing a UUID that has never joined does the same.

The winner among matching assignments is chosen in this order:

1. Specificity. An exact node beats a wildcard. Among wildcards, more literal segments win: `a.b.*` beats `a.*` beats `*`. A lone `*` matches every node. A `*` in any other place is a literal character. A pattern ending in `.*` matches a node that continues after that prefix (`a.b.*` matches `a.b.c` and leaves `a.b` unmatched).
2. Source. The user's own nodes beat group nodes when specificity ties.
3. Weight. Higher group weight wins when specificity ties. A node inherited from a parent uses the weight of the group the player is in.
4. Name. If weight also ties, the alphabetically first membership group wins.

`false` wins when its pattern is more specific, or when its source ranks higher at the same specificity. No match leaves the check to Pumpkin, so operator level and the node's registered default still decide.

A group's own nodes beat its parents. Parents fill keys the group does not set. A nearer parent beats a more distant one. At the same distance, the earlier name in the `parents` list wins. A missing parent is skipped. A cycle is skipped.

Online players receive the stored keys. Wildcard patterns stay as keys such as `a.*`. They are applied when the server checks a permission.

## Commands and permissions

`/kp` and `/karanda` are the same command. The root command is registered on `karanda-perms:admin`. Each subcommand also checks its own node. The console and any other non-player sender skip that check. Every node defaults to operator level 4. `karanda-perms:admin` lists the command nodes as children set to true.

| Command | Node |
| --- | --- |
| `/kp` | `karanda-perms:admin` |
| `/kp editor` | `karanda-perms:command.editor` |
| `/kp applyedits <code>` | `karanda-perms:command.applyedits` |
| `/kp check <node> [player]` | `karanda-perms:command.check` |
| `/kp reload` | `karanda-perms:command.reload` |
| `/kp user <player> ...` | `karanda-perms:command.user` |
| `/kp group ...` | `karanda-perms:command.group` |

User commands: `info`, `permission set <node> <true|false>`, `permission unset <node>`, `permission list`, `permission check <node>`, `group add <group>`, `group remove <group>`, `group list`.

Group commands: `list`, `create <name> <weight>`, `delete <name>`, and on one group: `permission set`, `unset`, `list`, `check`, `set weight <weight>`, `set default <true|false>`, `set prefix <text>`, `set suffix <text>`, `set parent add <parent>`, `set parent remove <parent>`.

Weight is 0 to 65535. `true`, `yes`, and `1` count as true. `false`, `no`, and `0` count as false. A prefix or suffix wrapped in one matching pair of quotes has that pair removed. A group cannot parent itself. Deleting a group removes it from parent lists and from players. `/kp group list` prints higher weight first, then name.

`/kp check` with no player uses the sender. The console must name a player. A player is an online name, a stored last name, or a UUID. A name that has never joined needs a UUID. The reply names the winning step, for example `user exact <node> = true` or `vanilla (no match) for <node>`.

`/kp group <name> permission check` resolves the node as if a player belonged only to that group.

`/kp reload` rereads `config.toml` and refreshes online players. With `auto_apply` on, it keeps the editor poll running. With `auto_apply` off, it stops that poll.

Older nodes stored as `KarandaPerms:`, `karandaperms:`, or `perms:` are rewritten to `karanda-perms:` when the database opens.

## Chat and the tab list

`{prefix}`, `{suffix}`, `{name}`, `{displayname}`, `{username}`, `{group}`, and `{message}` are filled by the plugin. `{name}` and `{displayname}` use the player's display name when one is set, and the username otherwise. `{username}` is the account name and is inserted as stored. `{group}` is the group that supplied the prefix. When every prefix is empty, it is the highest-weight group.

Prefix and suffix are chosen separately. The highest weight wins. An empty affix falls through to the next group. Equal weights use the alphabetically first group name. `message_color` and `name_color` follow that order and skip a blank value. A group's message color is placed in front of `{message}`. Its name color is placed in front of `{name}` and `{displayname}`. The chat text itself is inserted as the player typed it. Display name, message color, and name color are stored on the player or group and edited in the web editor.

A chat format with no `{message}` is sent as `<format> {message}`. When that line is already `<username> message`, Pumpkin's own chat stays. Any other line cancels the chat event and is broadcast to the speaking player's world. The tab list uses `display.world`. The display name uses the chat format with `{message}` removed. Both update on join and after a permission or display change.

## Web editor

The editor is optional. The plugin runs with only the `.wasm` file and `config.toml`.

The same work without the editor:

| Editor page | Do this instead |
| --- | --- |
| Groups, weights, default, prefix, suffix, parents | `/kp group` |
| Nodes on a group or user | `/kp group <name> permission` and `/kp user <player> permission` |
| Group membership | `/kp user <player> group` |
| Who has a node | `/kp check` |
| Chat format, tab format, command brand | `config.toml` keys `chat`, `tab`, and `display.brand` |

Display name, message color, and name color on a player or group have no `/kp` subcommand. Those three fields are the one editor-only edit. Leave them blank and the username and group prefix still work.

Node.js is not required. The program serves a page that is already built in `web\dist`. You do not install Node, and you do not run `npm`, unless you are rebuilding that page yourself.

Before the first start, start the server once so `plugins\data\karanda-perms` exists. Put this editor's `web\dist` folder in the same folder as `karanda-editor.exe`. If that folder is missing, the program still listens and the browser says the page files are missing. Copy the `web\dist` folder that came with the editor. Set `editor.host` and `editor.port` in `config.toml` to the address and port browsers will open.

`/kp editor` writes `editor/sessions/<code>.json` and prints `http://<host>:<port>/s/<code>`. It does not start the editor.

Start it with `start-editors.ps1` from the folder that contains that script. Pass `-Data` as the server's `plugins\data` folder (the folder that contains `karanda-perms`, `karanda-rewards`, and `karanda-worldtools`):

```powershell
.\start-editors.ps1 -Data "D:\server\plugins\data"
```

If you omit `-Data`, the script uses `D:\Docker\projects\pumpkin-mc\data\plugins\data`. `-Bind` defaults to `0.0.0.0`. This editor uses port 8787 (`-PermsPort`). `-Bind 127.0.0.1` keeps the editors on this computer. The default bind prints a warning that the session code is the only gate.

The program is `karanda-editor.exe`. The script looks in `-Editors` (or a `KarandaPerms` folder inside it), next to the script, in an `editors` folder next to the script, and in a release copy already stored with the plugin. Put this editor's `web\dist` folder in the same folder as the program. If that folder is missing, the program still listens and the page says the files are missing.

The printed link uses `editor.host` and `editor.port` from `config.toml`. Those are the address and port browsers open. They are separate from `-Bind`, which is the address the program listens on. When you change `-PermsPort`, set `editor.port` to that same port. Set `editor.host` to the address browsers should use, then run `/kp editor` again. When that host is empty, `127.0.0.1`, or `localhost`, the command adds a line telling you to set `editor.host` and run `/kp reload`.

Open the printed `http://` link. `https://` on this port makes Firefox report `NS_ERROR_NET_EMPTY_RESPONSE`. Do not publish port 8787 on the Pumpkin container. Docker accepts the connection and sends nothing, which is the same Firefox error. Ctrl+C in the script window stops the editor.

The page has Groups, Users, Settings, Check, and Review. The command-prefix control on Settings lists `[KarandaPerms]`, `[KPerms]`, and `[KP]`. Save on Review writes `editor/pending/<code>.json`. With `auto_apply` on, the plugin applies pending files about once a second (every 20 ticks) and writes `editor/results/<code>.json`. The page polls that result. A successful apply removes `editor/sessions/<code>.json`, so `/kp editor` can open another session while the editor process keeps running. Closing that process is Ctrl+C. A conflict or an error leaves the session file. The pending file is removed after the attempt. `/kp applyedits <code>` applies one pending file immediately.

`/kp editor` starts that poll even when `auto_apply` is false. `/kp reload` with `auto_apply` false stops it.

While the process is running it holds `editor/live.lock` in the plugin data folder, with `"plugin": "karanda-perms"`, and refreshes the heartbeat every 2 seconds. Stopping the process deletes the lock. A second Perms editor on the same data folder is refused until the first process exits. The message is `A KarandaPerms editor session is already open. Close it before starting another one.` If the port is already taken, the process prints the bind error and exits.

An apply replaces groups and users when `base_revision` still matches the stored revision. The draft's own revision is ignored. An in-game edit after the session started bumps the revision, so the apply conflicts and the database stays as it is. The apply also rejects a group key that does not match the group name, a user key that does not match the UUID, or two users with the same name. A change to the chat format, the tab-list format, or `display.brand` is written back to `config.toml`. That rewrite keeps the header and the current settings. Other comments in the file are dropped. Online players are refreshed after a successful apply.

## Limits

- `/kp editor` only writes the session file. The game command does not open the editor port.
- A stored `true` or `false` is what the permission check uses. No match leaves the server's own result in place, including operator level and the node's default.
- Wildcard patterns stay as stored keys such as `a.*`.
- Chat replacement is a system message on the speaking player's world.
- Display name, message color, and name color have no `/kp` subcommand. Those three fields are the one edit that is still editor-only. Leave them blank and the username and group prefix still work.
