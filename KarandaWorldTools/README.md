# KarandaWorldTools

World list, travel, and region protection on a Pumpkin server.

Command replies use `[KarandaWorldTools]`, `[KWorldTools]`, or `[KWT]`. The brackets are grey and the name is dark green. Console lines use the same words with no color. Player chat is not prefixed.

## Install

Copy `karanda_world_tools.wasm` into the server's `plugins` folder and restart.

The first launch creates `plugins/data/karanda-worldtools/` and `config.toml`. Edit that file there.

## What players and admins can do

- The catalog remembers worlds the server already has, plus an alias, an entry permission, a travel cost, and flags.
- `/kwt worlds` lists them. `/kwt go <world>` teleports a player to that world's spawn.
- Cuboid regions are chosen with `/kwt pos1` and `/kwt pos2`, or typed as coordinates.
- Flags `build`, `break`, `interact`, `pvp`, `entry`, and `mob_damage` cancel the action when they are set to deny.
- `catalog.json` keeps worlds and regions across a restart.
- A local web editor edits the same catalog.

`/kwt` and `/worldtools` are the same command.

## Limits

- Creating a world takes a name and a dimension: `overworld`, `nether`, or `end`. It does not take a seed, a generator, or a world folder. If a world with that name already exists, the server returns that world.
- There is no command to delete a world from disk. `/kwt unload` unloads and saves a world, and it fails for the primary world or a world that still has players. Catalog settings are kept.
- This plugin does not change game rules, time, weather, or the world border. Protection cancels the blocked action.
- Region build checks use the place event. A block break with no player, such as an explosion, is not tied to a world on that event, so a region cannot see it.
- Projectile damage reports the projectile, not the shooter. A `mob_damage` deny also cancels that damage. `pvp` applies only when the damager is an online player.
- A player who is already inside a deny-entry region can still move and teleport while they stay inside it, so they can leave. Crossing into a deny-entry region from outside is cancelled.
- Travel cost runs only on `/kwt go`. A portal still has to pass the world entry permission, the world entry flag, and region entry at the arrival point.

## Configuration

`config.toml` is created on first launch. A file that is not valid TOML is ignored and the defaults are used. A bad value is replaced with that key's default and logged. Unknown keys are logged and dropped. The file on disk is not rewritten.

| Key | Default | Meaning |
| --- | --- | --- |
| `editor.host` | `127.0.0.1` | Address browsers use. This is not the address the editor process binds. |
| `editor.port` | `8789` | Port browsers use. KarandaPerms uses 8787. KarandaRewards uses 8788. |
| `display.prefix` | `long` | `long` prints `[KarandaWorldTools]`. `mid` prints `[KWorldTools]`. `short` prints `[KWT]`. Chat prefixes use grey brackets and a dark green name for all three lengths. Console lines stay uncolored. Anything else becomes `long` and is logged. |

## Catalog

`catalog.json` holds worlds and regions. Each world has `name`, `alias`, `entry_permission`, `travel_cost`, and flags. Each region has an id, a world name, an inclusive cuboid, a priority, and flags.

A flag is `allow`, `deny`, or `unset`. Unset inherits. The default is allow. A region flag overrides the world flag inside the cuboid. The highest priority wins. Equal priority uses the alphabetically first region id.

An empty entry permission means anyone may enter, unless the world `entry` flag is deny. A set permission requires that node, unless the player has `karanda-worldtools:command.bypass`.

If `catalog.json` is not valid, it is left on disk and edits are refused until `/kwt reload` can read it.

## Commands and permissions

Player travel nodes default to everyone. Admin nodes default to operator level 2. The parent `karanda-worldtools:command` grants every child and defaults to operator level 2. The root command is registered on `karanda-worldtools:command.kwt` so a player can open `/kwt`. Each subcommand checks its own node.

| Command | Node | Default |
| --- | --- | --- |
| `/kwt` | `karanda-worldtools:command.kwt` | Allow |
| `/kwt worlds` | `karanda-worldtools:command.worlds` | Allow |
| `/kwt go <world>` | `karanda-worldtools:command.go` | Allow |
| `/kwt pos1`, `/kwt pos2` | `karanda-worldtools:command.pos1`, `pos2` | Op 2 |
| `/kwt region ...` | `karanda-worldtools:command.region` | Op 2 |
| `/kwt world ...` | `karanda-worldtools:command.world` | Op 2 |
| `/kwt create <name> <dimension>` | `karanda-worldtools:command.create` | Op 2 |
| `/kwt unload <world>` | `karanda-worldtools:command.unload` | Op 2 |
| `/kwt reload` | `karanda-worldtools:command.reload` | Op 2 |
| `/kwt editor` | `karanda-worldtools:command.editor` | Op 2 |
| bypass flags and entry permission | `karanda-worldtools:command.bypass` | Op 2 |

Region commands: `list`, `info <id>`, `remove <id>`, `define <id>` from the selection, `define <id> <world> <x1> <y1> <z1> <x2> <y2> <z2>`, and `flag <id> <flag> <allow|deny|unset>`.

World commands: `info`, `alias` (`none` or `clear` removes it), `cost`, `entry` (`none` or `clear` removes the permission), and `flag`.

## Web editor

The editor is optional. Worlds, travel, and regions work from `/kwt` alone.

The same work without the editor:

| Editor change | Command |
| --- | --- |
| Create or unload a world | `/kwt create`, `/kwt unload` |
| Alias, travel cost, entry permission | `/kwt world alias`, `/kwt world cost`, `/kwt world entry` |
| World or region flag | `/kwt world flag`, `/kwt region flag` |
| Define, list, inspect, or remove a region | `/kwt pos1`, `/kwt pos2`, `/kwt region define`, `/kwt region list`, `/kwt region info`, `/kwt region remove` |
| Travel | `/kwt worlds`, `/kwt go` |

Node.js is not required. The program serves a page that is already built in `web\dist`. You do not install Node, and you do not run `npm`, unless you are rebuilding that page yourself.

Before the first start, start the server once so `plugins\data\karanda-worldtools` exists. Put this editor's `web\dist` folder in the same folder as `karanda-worldtools-editor.exe`. If that folder is missing, the program still listens and the browser says the page files are missing. Copy the `web\dist` folder that came with the editor. Set `editor.host` and `editor.port` in `config.toml` to the address and port browsers will open.

`/kwt editor` writes a session file under `editor/sessions/` and prints a URL. It does not start the editor.

Start it with `start-editors.ps1` from the folder that contains that script. Pass `-Data` as the server's `plugins\data` folder (the folder that contains `karanda-perms`, `karanda-rewards`, and `karanda-worldtools`):

```powershell
.\start-editors.ps1 -Data "D:\server\plugins\data"
```

If you omit `-Data`, the script uses `D:\Docker\projects\pumpkin-mc\data\plugins\data`. `-Bind` defaults to `0.0.0.0`. This editor uses port 8789 (`-WorldToolsPort`). `-Bind 127.0.0.1` keeps the editors on this computer.

The program is `karanda-worldtools-editor.exe`. The script looks in `-Editors` (or a `KarandaWorldTools` folder inside it), next to the script, in an `editors` folder next to the script, and in a release copy already stored with the plugin. Put this editor's `web\dist` folder in the same folder as the program.

The printed link uses `editor.host` and `editor.port` from `config.toml`. Set `editor.host` to the address browsers should use, and set `editor.port` to the same port as `-WorldToolsPort`, then run `/kwt editor` again.

Open `http://<host>:<port>/s/<code>`. `https://` on this port makes Firefox report `NS_ERROR_NET_EMPTY_RESPONSE`. Do not publish port 8789 on the Pumpkin container. Saving writes `editor/pending/<code>.json`. The plugin applies it on its next tick (about once a second) and writes `editor/results/<code>.json`. Ctrl+C in the script window stops the editor.

The page edits worlds, aliases, entry permissions, travel costs, regions, and flags. It does not create a world or change a game rule.

KarandaPerms stays on 8787 and KarandaRewards uses 8788, so those editors can stay running. This editor refuses to start when another WorldTools editor already holds `editor/live.lock` in its own data folder. If port 8789 is already taken, the program says that port is in use.

## Travel cost and KarandaEssentials

A world with cost `0` is free.

`/kwt go` checks whether KarandaEssentials is loaded. If it is absent, travel still happens and the player is told: `This world costs <cost>, and KarandaEssentials is not installed, so the cost was skipped.`

When Essentials is loaded, the charge is the console command `eco take <player> <amount>`. That command updates the balance. The amount is a whole number from 1 to 2147483647.

- A player name that is not 1–16 characters of letters, digits, or `_` is not charged. Travel is refused, and the player is told: `KarandaEssentials is installed, but this player name cannot be charged safely.`
- If the plugin can read that player's Essentials balance and it is too low, travel is refused: `You need <cost> in KarandaEssentials to travel. Your balance is <balance>.`
- The plugin usually cannot read `plugins/data/karanda-essentials/userdata/<uuid>.json`, so that balance check is skipped. The server does not report whether `eco take` succeeded. The player is told: `Asked KarandaEssentials to take <cost>. The server command API does not report whether that take succeeded.` The teleport still runs.
- When the balance was read and the take was sent, the player is told: `Charged <cost> through KarandaEssentials.`

The plugin does not write the Essentials file.
