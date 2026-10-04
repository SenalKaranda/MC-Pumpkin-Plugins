# KarandaHolo

Floating text on a Pumpkin server, with one optional item, block, or frozen mob under the text.

Command replies use `[KarandaHolo]`, `[KHolo]`, or `[KH]`. The brackets are grey and the name is light purple. Console lines use the same words with no color.

## Install

Copy `karanda_holo.wasm` into the server's `plugins` folder and restart.

The first launch creates `plugins/data/karanda-holo/` and `config.toml`. Edit that file, then restart. The commands write `holograms.json`.

## Data files

| File | Contents |
| --- | --- |
| `config.toml` | Line spacing, text-display settings, the attachment offset, and the chat prefix. |
| `holograms.json` | Hologram ids, worlds, anchors, lines, and one optional attachment. |

`holograms.json` is written by the commands. If that file cannot be read, edits are paused and the broken file is left in place. Each hologram has a `revision` number. The commands increase it when the text or the anchor changes, so a display restored from a chunk is updated once.

## Configuration

`config.toml` uses these keys. Missing keys keep the defaults. A bad value is reported on the console and every setting stays at its default until the file is fixed. The broken file is not overwritten. An invalid `[display] prefix` is the exception: that one value becomes `long`, the console logs it, and the other settings still load. The file is not rewritten.

| Key | Default | Meaning |
| --- | --- | --- |
| `line_spacing` | `0.25` | Blocks between stacked lines. Line 1 is at the anchor. Later lines are higher. Allowed range is 0.05 to 4. |
| `billboard` | `center` | `center`, `vertical`, `horizontal`, or `fixed`. `center` turns the text toward the viewer. |
| `view_range` | `1` | Text-display view range. `1` is the vanilla default. Allowed range is 0.1 to 16. |
| `text_shadow` | `false` | Draw a shadow behind the letters. |
| `see_through` | `false` | Draw the text through blocks. |
| `default_background` | `false` | `true` uses the vanilla dark plate. `false` leaves the background transparent. |
| `line_width` | `200` | Pixels before a line wraps. |
| `max_lines` | `16` | Most lines one hologram can hold. The save file itself stops at 64. |
| `visual_offset_y` | `-0.5` | Blocks added to the anchor height for an item, block, or mob. Allowed range is -8 to 8. |
| `visual_scale` | `1` | Size of an item or block display. Mobs keep their normal size. Allowed range is 0.05 to 8. |
| `[display] prefix` | `long` | Chat label on command replies and console lines. `long` prints `[KarandaHolo]`. `mid` prints `[KHolo]`. `short` prints `[KH]`. Chat prefixes use grey brackets and a light purple name for all three lengths. Console lines stay uncolored. Any other value is replaced with `long` and logged. The other settings are kept. |

```toml
# prefix is "long" ([KarandaHolo]), "mid" ([KHolo]), or "short" ([KH]).
[display]
prefix = "long"
```

`prefix` is `long`, `mid`, or `short`. A missing key stays `long`. `[display]` is the only category. `prefix` at the top of the file, or any other key inside `[display]`, is an unknown setting and the whole file is rejected. A bad prefix is not.

`/holo create` and `/holo movehere` put line 1 at your eye position. A line may use `&` color codes, such as `&aHello`.

Display settings are applied when a text display is spawned and again the first time the plugin refreshes after a restart. Restart the server after editing `config.toml`.

## Permissions

Nodes follow Minecraft's command permission form. Vanilla uses `minecraft:command.gamemode`. This plugin uses `karanda-holo:command.<name>`.

Every command node defaults to gamemaster, operator level 2. The server console bypasses the handler checks.

| Node | What it covers |
| --- | --- |
| `karanda-holo:command.holo` | Use `/holo` and `/karandaholo`. An explicit grant also grants the subcommands below. |
| `karanda-holo:command.create` | `/holo create` |
| `karanda-holo:command.addline` | `/holo addline` |
| `karanda-holo:command.setline` | `/holo setline` |
| `karanda-holo:command.removeline` | `/holo removeline` |
| `karanda-holo:command.delete` | `/holo delete` |
| `karanda-holo:command.list` | `/holo list` |
| `karanda-holo:command.movehere` | `/holo movehere` |
| `karanda-holo:command.info` | `/holo info` |
| `karanda-holo:command.item` | `/holo item` |
| `karanda-holo:command.block` | `/holo block` |
| `karanda-holo:command.mob` | `/holo mob` |
| `karanda-holo:command.clearvisual` | `/holo clearvisual` |
| `karanda-holo:command` | Every command node above. |

`/holo` is registered with `karanda-holo:command.holo`. Each subcommand also checks its own node. Holograms are visible to everyone. Only players who pass the command node can edit them.

## Commands

`<argument>` is required. `[argument]` is optional. `/karandaholo` is the same command as `/holo`.

| Command | Permission | Default | What it does |
| --- | --- | --- | --- |
| `/holo` | `karanda-holo:command.holo` | Gamemaster | Lists the hologram commands you can use. |
| `/holo create <line>` | `karanda-holo:command.create` | Gamemaster | Creates a hologram at your eye position. The id is the lowest unused number. |
| `/holo addline <id> <line>` | `karanda-holo:command.addline` | Gamemaster | Adds a line above the last one. |
| `/holo setline <id> <number> <line>` | `karanda-holo:command.setline` | Gamemaster | Replaces one line. Numbers start at 1. |
| `/holo removeline <id> <number>` | `karanda-holo:command.removeline` | Gamemaster | Removes one line. The last line stays until `/holo delete`. |
| `/holo delete <id>` | `karanda-holo:command.delete` | Gamemaster | Deletes the hologram, its text, and its attachment. |
| `/holo list` | `karanda-holo:command.list` | Gamemaster | Lists every hologram with its world, position, attachment, and lines. A line longer than 80 characters is shortened here. `/holo info` shows the full line. |
| `/holo movehere <id>` | `karanda-holo:command.movehere` | Gamemaster | Moves that hologram to your eye position. |
| `/holo info [id]` | `karanda-holo:command.info` | Gamemaster | Shows one hologram. With no id, shows the closest one in your world. |
| `/holo item <id> <item>` | `karanda-holo:command.item` | Gamemaster | Shows that item under the text. Replaces any block or mob already attached. |
| `/holo block <id> <block>` | `karanda-holo:command.block` | Gamemaster | Shows that block's default state under the text. |
| `/holo mob <id> <mob>` | `karanda-holo:command.mob` | Gamemaster | Spawns that mob under the text with gravity and AI off. It is a real entity, so it has a hitbox. |
| `/holo clearvisual <id>` | `karanda-holo:command.clearvisual` | Gamemaster | Removes the item, block, or mob. The text stays. |

Ids are 1 to 32 letters, digits, underscores, or hyphens. A line is trimmed and cannot be empty. A line can be at most 1024 characters.

## Where the text appears

Each line is a text display entity. The lines are stacked on the anchor by `line_spacing`. The entities have no gravity, no sound, and no shadow. An attached item or block is a display entity at `visual_offset_y`, scaled by `visual_scale`, and turned by the same billboard setting as the text. An attached mob is a real entity at that offset. It does not use `visual_scale`.

A line can contain `{name}` tokens. One text display is shared, so every player sees the same string. `{player}` and the other player tokens use the nearest player in that hologram's world. If nobody is in the world, those tokens show `?`. An unknown `{name}` is left as written. The one-second refresh rewrites a line that contains `{`.

| Token | Value |
| --- | --- |
| `{player}` | Nearest player's name. `{player_name}` is the same. |
| `{ping}` `{health}` `{max_health}` `{food}` `{saturation}` `{level}` `{exp}` `{gamemode}` `{item_in_hand}` | That player's ping, health, max health, food, saturation, experience level, experience points, game mode, and held item. |
| `{player_x}` `{player_y}` `{player_z}` `{uuid}` | That player's position and id. |
| `{online}` `{max}` `{tps}` `{mspt}` `{motd}` `{difficulty}` | Server player count, max players, tick rate, milliseconds per tick, message of the day, and difficulty. |
| `{world}` `{time}` `{world_age}` `{mc_time}` `{mc_day}` `{world_players}` `{is_raining}` `{is_thundering}` | World name, time-of-day ticks, world age, clock (`0` ticks is 06:00), day number, players in the world, and weather. |
| `{holo_id}` `{x}` `{y}` `{z}` `{line_count}` `{billboard}` `{view_range}` | This hologram. |

The text is placed only when that chunk is already loaded. The plugin tries at startup, when a player joins, when a player moves into another chunk, and once a second while the server is running. Those checks are what place the text after a restart.

A text display, item display, block display, or mob in a loaded chunk is saved with the chunk when that chunk unloads. The plugin writes the same hologram to `holograms.json`. On the next visit it keeps a text line that is already there when the id, line, and revision match, keeps an attachment when the kind and name match, and removes an entity whose hologram was deleted. A delete or move in a chunk that is not loaded finishes the next time that chunk is loaded.

Changing `config.toml` needs a restart. The first refresh after startup writes the current display settings onto holograms whose chunks are already loaded.
