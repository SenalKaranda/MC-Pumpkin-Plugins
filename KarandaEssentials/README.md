# KarandaEssentials

Homes, warps, spawn, teleport requests, random teleport, private messages, mail, kits, moderation, and a simple balance on a Pumpkin server.

Player chat has no plugin prefix. Command replies use `[KarandaEssentials]`, `[KEssentials]`, or `[KE]`, chosen in `config.toml`. The brackets are grey and the name is gold. Console lines use the same words with no color.

## Install

Copy `karanda_essentials.wasm` into the server's `plugins` folder and restart.

The first launch creates `plugins/data/karanda-essentials/`. Edit `config.toml` in that folder. Kits are stored in `kits.json`, not in the toml.

`/repair` is not a command. There is no safe way to reset item damage.

## Data files

| File | Contents |
| --- | --- |
| `config.toml` | Settings. Kits are not stored here. |
| `kits.json` | Kit definitions. Created with a starter kit if the file is missing. |
| `warps.json` | Warps, spawn, and the jail location. |
| `names.json` | Names of players who have joined since the plugin was installed. |
| `userdata/<uuid>.json` | Homes, mail, balance, nickname, ignores, kit and `/rtp` cooldowns, god, fly, vanish, mute, jail, and `/back`. |

An older `config.json` is copied to `config.toml` once. After that, edit `config.toml`. Kits found in an older config are moved into `kits.json` and removed from the toml.

## Configuration

`config.toml` uses these keys. Missing keys keep the defaults.

| Key | Default | Meaning |
| --- | --- | --- |
| `teleport_warmup_seconds` | `0` | Seconds the player must stand still before a home, warp, spawn, TPA, `/back`, or `/rtp` teleport. `0` teleports immediately. Moving cancels the warmup. |
| `rtp_min_radius` | `500` | Closest horizontal distance, in blocks, from the current world's spawn for `/rtp`. |
| `rtp_max_radius` | `5000` | Farthest horizontal distance, in blocks, from the current world's spawn for `/rtp`. |
| `rtp_attempts` | `10` | How many columns `/rtp` checks. |
| `rtp_cooldown_seconds` | `0` | Wait before the same player can use `/rtp` again. `0` disables it. The wait is saved with that player's kit cooldowns. |
| `rtp_allow_underground` | `false` | When false, `/rtp` stays on the surface: the two passable blocks above the stand must be open to the sky, with no solid block above them in that column. Leaves and short grass are not a ceiling. When true, any safe loaded stand is allowed, including underground. |
| `tpa_timeout_seconds` | `60` | How long `/tpa` and `/tpahere` stay open. |
| `max_homes` | `1` | Homes for a player without an extra home permission. |
| `multiple_homes` | `3` | Homes for a player with `karanda-essentials:command.sethome.multiple`. |
| `starting_balance` | `0` | Balance given the first time a player joins. |
| `currency_name` | `dollars` | Word shown next to balances. |
| `motd` | `["Welcome to the server."]` | Lines sent when a player joins. |
| `rules` | `["Be respectful."]` | Lines shown by `/rules`. |
| `afk_timeout_seconds` | `300` | Idle time before a player is marked AFK. `0` disables the idle check. |
| `spawn_on_join` | `false` | Send joining players to the warp spawn. `/setspawn` turns this on. |

```toml
[display]
prefix = "long"
colored_chat = true
```

`prefix` is `long`, `mid`, or `short`. `long` prints `[KarandaEssentials]`. `mid` prints `[KEssentials]`. `short` prints `[KE]`. Chat prefixes use grey brackets and a gold name for all three lengths. Console lines stay uncolored. Any other value is ignored. `colored_chat` colors in-game command feedback. Player chat never includes the prefix.

`kits.json` is a list of kits:

```json
[
  {
    "name": "starter",
    "items": [
      { "item": "bread", "count": 16 },
      { "item": "stone_pickaxe", "count": 1 }
    ],
    "cooldown-seconds": 0,
    "one-time": false
  }
]
```

`item` is a Minecraft item id, with or without the `minecraft:` prefix. `cooldown-seconds` is the wait before the same player can take the kit again. `one-time` lets each player take the kit once. A cooldown is checked before the one-time limit. Restart the server after editing kits.

## Permissions

Nodes follow Minecraft's command permission form. Vanilla uses `minecraft:command.gamemode`. This plugin uses `karanda-essentials:command.<name>`.

The server console bypasses permission checks. Everyone else is checked against the node's default, then against any explicit grant or denial from a permission plugin.

| Default | Who has it before an explicit grant |
| --- | --- |
| Everyone | All players. Same idea as `minecraft:command.list`. |
| Gamemaster | Operators at level 2 or higher. Same level as `minecraft:command.gamemode`, `give`, `teleport`, `time`, and `weather`. |
| Admin | Operators at level 3 or higher. Same level as `minecraft:command.kick` and `minecraft:command.ban`. |
| Explicit | Nobody, until a permission plugin grants the node. |

Operator levels are Minecraft's: 0 normal, 1 moderator, 2 gamemaster, 3 admin, 4 owner.

Wildcards work the same way as other Minecraft permission nodes:

- `karanda-essentials:*` grants every node in this plugin.
- `karanda-essentials:command.*` grants every command node.
- `karanda-essentials:command.sethome.*` grants the extra home nodes, not `/sethome` itself.

These group nodes do nothing until a permission plugin sets them. Setting one to true also sets its children to true.

| Node | Grants |
| --- | --- |
| `karanda-essentials:command.gamemaster` | `/tp`, `/tphere`, `/gamemode`, `/give`, `/time`, `/weather`, `/spawnmob`, `/setspawn`, `/broadcast` |
| `karanda-essentials:command.mod` | `/kick`, `/ban`, `/tempban`, `/unban`, `/banlist`, `/banip`, `/unbanip`, `/mute`, `/unmute`, `/jail`, `/unjail`, `/setjail` |
| `karanda-essentials:command.admin` | Moderation, `/setwarp`, `/delwarp`, `/socialspy`, `/vanish`, `/eco`, and the "other player" nodes listed under extra permissions |

`/karandaessentials` (alias `/ke`) lists the commands you can use, with each permission node.

## Commands

`<argument>` is required. `[argument]` is optional. Durations accept seconds (`90`), minutes (`30m`), hours (`2h`), and days (`1d`).

### Homes, warps, and spawn

| Command | Permission | Default | What it does |
| --- | --- | --- | --- |
| `/home [name]`, `/homes` | `karanda-essentials:command.home` | Everyone | With no name, lists your homes. With a name, teleports to that home. |
| `/sethome [name]` | `karanda-essentials:command.sethome` | Everyone | Saves your location. The default name is `home`. Names are 1 to 32 characters. The limit is `max_homes`, unless a home node below raises it. Setting an existing name replaces that home. |
| `/delhome <name>` | `karanda-essentials:command.delhome` | Everyone | Deletes one of your homes. |
| `/warp [name]`, `/warps` | `karanda-essentials:command.warp` | Everyone | Lists warps, or teleports to one. |
| `/setwarp <name>` | `karanda-essentials:command.setwarp` | Admin | Creates or replaces a warp at your location. |
| `/delwarp <name>` | `karanda-essentials:command.delwarp` | Admin | Deletes a warp. |
| `/spawn` | `karanda-essentials:command.spawn` | Everyone | Teleports to the server spawn. |
| `/setspawn` | `karanda-essentials:command.setspawn` | Gamemaster | Sets the server spawn to your location and turns `spawn_on_join` on. |
| `/back` | `karanda-essentials:command.back` | Everyone | Returns to the location saved by your last death or teleport. |

Extra home nodes are explicit. The highest matching numbered node wins.

| Node | Default | What it does |
| --- | --- | --- |
| `karanda-essentials:command.sethome.multiple` | Explicit | Uses `multiple_homes` from `config.toml` when that number is higher than `max_homes`. |
| `karanda-essentials:command.sethome.unlimited` | Explicit | Removes the home limit. |
| `karanda-essentials:command.sethome.<n>` | Explicit | Allows at least `<n>` homes, for `<n>` from 1 to 20. `/sethome.4` and `/sethome.2` together allow 4. |

### Player teleports

| Command | Permission | Default | What it does |
| --- | --- | --- | --- |
| `/tpa <player>`, `/tpask` | `karanda-essentials:command.tpa` | Everyone | Asks to teleport to that player. The request expires after `tpa_timeout_seconds`. |
| `/tpahere <player>` | `karanda-essentials:command.tpahere` | Everyone | Asks that player to teleport to you. |
| `/tpaccept` | `karanda-essentials:command.tpaccept` | Everyone | Accepts the latest request sent to you. |
| `/tpdeny` | `karanda-essentials:command.tpdeny` | Everyone | Denies the latest request sent to you. |
| `/tpacancel` | `karanda-essentials:command.tpacancel` | Everyone | Cancels requests you sent. |
| `/tp <target>`, `/teleport` | `karanda-essentials:command.tp` | Gamemaster | Teleports you to a player or position, a player to another player, or a player to a position. |
| `/tphere <player>` | `karanda-essentials:command.tphere` | Gamemaster | Teleports those players to you. Players who cannot be moved are named in the result. |
| `/rtp [player]`, `/wild` | `karanda-essentials:command.rtp` | Everyone | Teleports you to a random safe block in your current world. Another player also needs `karanda-essentials:command.rtp.others` (Admin), and that player is the one who moves. |

Home, warp, spawn, TPA, `/back`, and `/rtp` wait `teleport_warmup_seconds` when that value is above 0. Moving cancels the warmup. `/tp` and `/tphere` teleport immediately.

`/rtp` searches around the current world's dimension spawn. `/setspawn` is a separate saved location. Each attempt checks one column in a chunk already loaded near the player, out to the server view distance. The command does not load or generate chunks. When any of those chunks overlap `rtp_min_radius` through `rtp_max_radius`, the column is chosen inside that ring. When none of the loaded chunks reach the ring, the attempt uses a loaded column near the player, so a normal world still has a place to stand. Attempts are not spent on unloaded coordinates. Spots outside the world border are skipped. A safe spot is solid ground with two blocks above it that are not solid and not liquid. Air counts, and so does a plant such as short grass. With `rtp_allow_underground` false, that stand also has to be on the surface: those two blocks are open to the sky, so no solid block sits above them in the column inside the chunk's built height. Leaves and short grass are not a ceiling. If the loaded chunk cannot show the blocks above the stand, that try is skipped. Set `rtp_allow_underground` to true to allow any safe loaded stand, including underground. A column with no solid ground is rejected, which covers the void. A solid ceiling at the top of the world can look safe. Damaging blocks such as magma or cactus can remain.

If every attempt fails, the command says no safe location was found. A player who is still on cooldown is told how long is left. `rtp_attempts` below 1 is replaced with 10. If `rtp_max_radius` is below `rtp_min_radius`, the maximum is replaced with 5000, and the minimum is replaced with 500 when 5000 is still too small. The console logs the bad value, the same way an invalid `display.prefix` is replaced. A missing `rtp_allow_underground` stays false. A value that is not true or false is replaced with false, logged, and the rest of the file still loads. A negative number makes `config.toml` unreadable, and every setting uses its default, the same as the other number keys.

### Chat and social

| Command | Permission | Default | What it does |
| --- | --- | --- | --- |
| `/msg <player> <message>`, `/tell`, `/w`, `/whisper` | `karanda-essentials:command.msg` | Everyone | Sends a private message. Ignored players cannot message each other. |
| `/r <message>`, `/reply` | `karanda-essentials:command.msg` | Everyone | Replies to the last player who messaged you. |
| `/ignore <player>` | `karanda-essentials:command.ignore` | Everyone | Toggles hiding that player's chat. You cannot ignore yourself. |
| `/mail` | `karanda-essentials:command.mail` | Everyone | Reads your mail and clears it from the inbox. `/mail read` does the same. |
| `/mail clear` | `karanda-essentials:command.mail` | Everyone | Deletes your mail without printing it. |
| `/mail send <player> <message>` | `karanda-essentials:command.mail` and `karanda-essentials:command.mail.send` | Everyone | Sends mail. The recipient is told to read it if they are online, and again the next time they join. You cannot mail yourself. |
| `/socialspy` | `karanda-essentials:command.socialspy` | Admin | Toggles copies of private messages and public chat you would not otherwise see. |
| `/me <message>` | `karanda-essentials:command.me` | Everyone | Broadcasts `* Name message`. |
| `/broadcast <message>` | `karanda-essentials:command.broadcast` | Gamemaster | Broadcasts `[Broadcast] message`. |
| `/nick <name>` | `karanda-essentials:command.nick` | Everyone | Sets your nickname. `off` clears it. |
| `/nick <player> <name>` | `karanda-essentials:command.nick` and `karanda-essentials:command.nick.others` | `nick.others` is Admin | Sets another player's nickname. |
| `/realname <name>` | `karanda-essentials:command.realname` | Everyone | Finds the account that uses a nickname. |
| `/afk` | `karanda-essentials:command.afk` | Everyone | Toggles AFK. Chat, movement, and commands clear it. Idle players are marked AFK after `afk_timeout_seconds`. A vanished player's AFK line is sent only to that player, the console, and players with `karanda-essentials:command.vanish.see`. |

`karanda-essentials:command.nick.color` is explicit. Without it, color codes in a nickname are stripped. With it, `&` codes are kept.

### Player state

| Command | Permission | Default | What it does |
| --- | --- | --- | --- |
| `/heal [player]` | `karanda-essentials:command.heal` | Everyone | Restores health. Another player also needs `karanda-essentials:command.heal.others` (Admin). |
| `/feed [player]` | `karanda-essentials:command.feed` | Everyone | Fills hunger and saturation. Another player also needs `karanda-essentials:command.feed.others` (Admin). |
| `/fly [player] [on\|off]` | `karanda-essentials:command.fly` | Everyone | Toggles flight, or sets it on or off. Another player also needs `karanda-essentials:command.fly.others` (Admin). Flight is cancelled if the player does not have fly enabled. |
| `/speed <0-10> [player]` | `karanda-essentials:command.speed` | Everyone | Sets walk and fly speed. `0` is the slowest and `10` is the fastest. |
| `/flyspeed <0-10> [player]` | `karanda-essentials:command.speed` | Everyone | Sets fly speed only. |
| `/walkspeed <0-10> [player]` | `karanda-essentials:command.speed` | Everyone | Sets walk speed only. |
| `/god [player]` | `karanda-essentials:command.god` | Everyone | Toggles invulnerability. Another player also needs `karanda-essentials:command.god.others` (Admin). |
| `/gamemode <mode> [player]`, `/gm` | `karanda-essentials:command.gamemode` | Gamemaster | Sets survival, creative, adventure, or spectator. Short names: `s`, `c`, `a`, `sp`. If they are already in that mode, the command says so. |
| `/vanish [player]` | `karanda-essentials:command.vanish` | Admin | Toggles vanish for you, or for that player. Another player uses this same permission. The flag is saved and applied again on join. |
| `/kill [player]` | `karanda-essentials:command.kill` | Everyone | Kills you, or another player if you have `karanda-essentials:command.kill.others` (Admin). |
| `/clear [player]` | `karanda-essentials:command.clear` | Everyone | Clears an inventory. Another player also needs `karanda-essentials:command.clear.others` (Admin). |
| `/hat` | `karanda-essentials:command.hat` | Everyone | Swaps the item in your hand with your helmet. |
| `/enderchest [player]`, `/echest` | `karanda-essentials:command.enderchest` | Everyone | Opens your ender chest. Another player's chest also needs `karanda-essentials:command.enderchest.others` (Admin). |
| `/exp`, `/xp` | `karanda-essentials:command.exp` | Everyone | Shows your experience. |
| `/exp set <amount> [player]` | `karanda-essentials:command.exp` | Everyone | Sets experience. Another player also needs `karanda-essentials:command.exp.others` (Admin). |
| `/exp give <amount> [player]` | `karanda-essentials:command.exp` | Everyone | Adds or removes experience. A negative amount removes it. |

Changing another player's speed also needs `karanda-essentials:command.speed.others` (Admin). Seeing vanished players needs `karanda-essentials:command.vanish.see` (Admin). Players without it do not get that player's join message, leave message, or AFK line, and `/list`, `/near`, `/seen`, `/whois`, `/ping`, `/compass`, and the `/tps` player count treat that player as offline. Console still sees them. A vanished player stays visible in the world and on the tab list.

### Items and kits

| Command | Permission | Default | What it does |
| --- | --- | --- | --- |
| `/give <player> <item> [count]` | `karanda-essentials:command.give` | Gamemaster | Gives items. Count defaults to 1. Items that do not fit are reported. |
| `/kit`, `/kits` | `karanda-essentials:command.kit` | Everyone | Lists kits from `kits.json`. |
| `/kit <name> [player]` | `karanda-essentials:command.kit` | Everyone | Gives that kit. Giving it to someone else also needs `karanda-essentials:command.kit.others` (Admin). |

### Moderation

| Command | Permission | Default | What it does |
| --- | --- | --- | --- |
| `/kick <player> [reason]` | `karanda-essentials:command.kick` | Admin | Disconnects an online player. |
| `/ban <player> [reason]` | `karanda-essentials:command.ban` | Admin | Bans a player who has joined since the plugin was installed. |
| `/tempban <player> <duration> [reason]` | `karanda-essentials:command.tempban` | Admin | Bans a player until the duration ends. |
| `/unban <player>`, `/pardon` | `karanda-essentials:command.unban` | Admin | Removes a player ban. |
| `/banlist` | `karanda-essentials:command.banlist` | Admin | Lists player bans and IP bans. |
| `/banip <player> [reason]` | `karanda-essentials:command.banip` | Admin | Bans the IP of an online player, or the last IP saved for a player who has joined. |
| `/unbanip <ip>`, `/pardonip` | `karanda-essentials:command.unbanip` | Admin | Removes an IP ban. |
| `/mute <player> [duration]` | `karanda-essentials:command.mute` | Admin | Blocks a player's chat. With no duration, the mute stays until `/unmute`. |
| `/unmute <player>` | `karanda-essentials:command.unmute` | Admin | Removes a mute. |
| `/jail <player>` | `karanda-essentials:command.jail` | Admin | Sends a player to the jail and blocks their movement. |
| `/unjail <player>` | `karanda-essentials:command.unjail` | Admin | Releases a jailed player. |
| `/setjail` | `karanda-essentials:command.setjail` | Admin | Sets the jail to your location. `/jail` requires this first. |

### World

| Command | Permission | Default | What it does |
| --- | --- | --- | --- |
| `/time set <value>` | `karanda-essentials:command.time` | Gamemaster | Sets the time. `value` is a tick number, or `day`, `noon`, `night`, or `midnight`. |
| `/time add <ticks>` | `karanda-essentials:command.time` | Gamemaster | Adds ticks to the time of day. |
| `/weather <clear\|rain\|thunder>` | `karanda-essentials:command.weather` | Gamemaster | Changes the world weather. |
| `/spawnmob <type> [count]` | `karanda-essentials:command.spawnmob` | Gamemaster | Spawns entities at your location. Count is 1 to 20. Players cannot be spawned. |
| `/ptime <value>`, `/ptime reset` | `karanda-essentials:command.ptime` | Everyone | Sets or clears your personal client time. |
| `/pweather <clear\|downfall\|reset>` | `karanda-essentials:command.pweather` | Everyone | Sets or clears your personal client weather. |

### Economy

Balances are whole numbers. New players start at `starting_balance`.

| Command | Permission | Default | What it does |
| --- | --- | --- | --- |
| `/balance [player]`, `/bal`, `/money` | `karanda-essentials:command.balance` | Everyone | Shows your balance. Another player's balance also needs `karanda-essentials:command.balance.others` (Admin). |
| `/pay <player> <amount>` | `karanda-essentials:command.pay` | Everyone | Pays an online or known player. The amount must be greater than zero, and you cannot pay yourself. |
| `/baltop` | `karanda-essentials:command.baltop` | Everyone | Shows the ten highest balances. |
| `/eco give <player> <amount>` | `karanda-essentials:command.eco` | Admin | Adds money. |
| `/eco take <player> <amount>` | `karanda-essentials:command.eco` | Admin | Removes money. Fails if the player does not have enough. |
| `/eco set <player> <amount>` | `karanda-essentials:command.eco` | Admin | Sets the balance. The amount can be zero. |

### Information

| Command | Permission | Default | What it does |
| --- | --- | --- | --- |
| `/list`, `/who` | `karanda-essentials:command.list` | Everyone | Lists online players, their worlds, and who is AFK. Vanished players are omitted unless you have `karanda-essentials:command.vanish.see`. |
| `/seen <player>` | `karanda-essentials:command.seen` | Everyone | Shows whether a known player is online, or how long ago they left. A vanished player is shown as offline unless you have `karanda-essentials:command.vanish.see`. |
| `/whois <player>` | `karanda-essentials:command.whois` | Everyone | Shows UUID, gamemode, location, nickname, balance, homes, and god, fly, mute, and jail state. A vanished player is reported as not online unless you have `karanda-essentials:command.vanish.see`. |
| `/ping [player]` | `karanda-essentials:command.ping` | Everyone | Shows latency. Another vanished player is reported as not online unless you have `karanda-essentials:command.vanish.see`. |
| `/near` | `karanda-essentials:command.near` | Everyone | Lists players within 200 blocks in your world. Vanished players are omitted unless you have `karanda-essentials:command.vanish.see`. |
| `/compass [player]`, `/compass spawn` | `karanda-essentials:command.compass` | Everyone | Points your compass at spawn or at a player. A vanished player is reported as not online unless you have `karanda-essentials:command.vanish.see`. |
| `/motd` | `karanda-essentials:command.motd` | Everyone | Shows the join message. |
| `/rules` | `karanda-essentials:command.rules` | Everyone | Shows the rules. |
| `/tps` | `karanda-essentials:command.tps` | Everyone | Shows TPS, MSPT, and the player count. The count omits vanished players unless you have `karanda-essentials:command.vanish.see`. |
| `/karandaessentials`, `/ke` | `karanda-essentials:command.help` | Everyone | Lists the commands you are allowed to use. |

`karanda-essentials:command.whois.ip` is Admin. It adds the player's IP to `/whois`.

## Other behavior

- Joining shows the MOTD. Players with unread mail are told to use `/mail read`.
- With `spawn_on_join` enabled, players spawn at `/setspawn` when that spawn is in the world they are entering.
- Death and teleports from outside this plugin update `/back`. Teleports started by this plugin do not overwrite `/back` with the departure point of that same teleport.
- A muted player's chat is cancelled. Ignored players are removed from the recipient list.
- A jailed player cannot move until `/unjail`.
- God, fly, vanish, and nicknames are reapplied when that player joins.
- Unknown player names in bans, mail, and economy refer to players who have joined since the plugin was installed. The name lookup is case-insensitive.
