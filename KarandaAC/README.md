# KarandaAC

Movement and block-break checks that run on the Pumpkin server. Alerts go to staff who are online.

Command replies and alerts use `[KarandaAC]`, `[KAntiCheat]`, or `[KAC]`. The brackets are grey and the name is dark red. Console lines use the same words with no color. Player chat is left as the player typed it.

This version checks flight, speed, walking on liquid, and breaking blocks too close together. It leaves phase, timer, and boat-fly unchecked. It keeps checks on this server: there is no `/privacy`, no ban or kick from this plugin, and no web page.

## Install

Copy `karanda_ac.wasm` into the server's `plugins` folder and restart.

The first launch creates `plugins/data/karanda-ac/`. Edit `config.toml` in that folder. `/ac module` also rewrites that file.

## Data files

| File | Contents |
| --- | --- |
| `config.toml` | Settings. |
| `violations.json` | The last saved violations for each player. |

`/ac module` rewrites `config.toml`. A bad numeric setting is replaced in that file as well. A file that is not valid TOML is left in place and every setting uses its default.

## Configuration

`config.toml` uses these keys. Missing keys keep the defaults. A number that is present but out of range is replaced with that key's default, and the console logs the bad value. The other keys are kept. A negative number is valid TOML, so only that key is replaced. If the file cannot be parsed, every setting uses its default. The server keeps running.

| Key | Default | Meaning |
| --- | --- | --- |
| `flight_enabled` | `true` | Check for sustained upward motion and hovering. |
| `speed_enabled` | `true` | Check horizontal blocks per second. |
| `jesus_enabled` | `true` | Check on-ground movement over a liquid block. |
| `break_enabled` | `true` | Check the gap between block breaks. |
| `alerts_enabled` | `true` | Tell online staff when a check records a violation. |
| `setback_enabled` | `false` | Cancel a violating move so Pumpkin puts the player back. Off until you opt in. |
| `teleport_grace_seconds` | `2` | Ignore movement checks for this long after a teleport. `0` disables the grace. |
| `knockback_grace_seconds` | `1` | Ignore movement checks for this long after an entity knockback event for that player. `0` disables the grace. |
| `alert_interval_seconds` | `3` | Minimum time between stored violations for the same player and the same check. Alerts use the same interval. `0` records every violation. |
| `max_violations` | `20` | How many violations to keep per player. `0` stores none. Alerts can still be sent. |
| `flight_ascend_seconds` | `0.45` | How long a continuous rise must last. A normal jump rises for about 0.3 seconds, so it stays under this. |
| `flight_ascend_blocks` | `1.6` | How far that rise must climb. A normal jump peaks near 1.25 blocks. Both this and the time above must be met. |
| `flight_hover_seconds` | `0.75` | How long the player can stay airborne without rising or falling before hover is recorded. |
| `speed_blocks_per_second` | `8` | Horizontal cap while not sprinting. Vanilla walking is about 4.3 blocks per second. This default leaves room for lag. |
| `sprint_blocks_per_second` | `12` | Horizontal cap while sprinting. Vanilla sprinting is about 5.6 blocks per second. |
| `speed_effect_per_level` | `0.2` | Extra cap per Speed level. The multiplier is `1 + speed_effect_per_level * (amplifier + 1)`. Speed I is amplifier 0, so the cap is multiplied by 1.2. `0` leaves the cap unchanged. |
| `speed_sample_seconds` | `0.25` | Shortest interval used to measure blocks per second. Shorter moves are added together until this interval is covered. A move that already covers more ground than the cap allows for this interval is recorded immediately. |
| `break_min_interval_seconds` | `0.05` | Minimum time between breaks by the same player. This is one tick. It is not the vanilla break time for the block. |
| `max_move_gap_seconds` | `1` | A gap longer than this, and the first move after a player joins, is not judged. The flight and speed timers start over. |
| `[display] prefix` | `long` | Chat label on command replies, alerts, and console lines. `long` prints `[KarandaAC]`. `mid` prints `[KAntiCheat]`. `short` prints `[KAC]`. Chat prefixes use grey brackets and a dark red name for all three lengths. Console lines stay uncolored. Any other value is replaced with `long` and logged. The other settings are kept. |

Rising means faster than 0.05 blocks per second upward. Falling means faster than 0.25 blocks per second downward. Hover is the band between those two. Those two speeds are not config keys.

The speed cap for a sample window is the higher of the walking and sprinting caps that applied while the window was filling, including the Speed effect. Haste does not change the speed cap or the break interval.

`setback_enabled` cancels a violating move, and the server puts the player back at the previous position. The break check cancels the break whenever it records a violation, whether or not setback is on.

```toml
flight_enabled = true
speed_enabled = true
jesus_enabled = true
break_enabled = true
alerts_enabled = true
setback_enabled = false

teleport_grace_seconds = 2
knockback_grace_seconds = 1
alert_interval_seconds = 3
max_violations = 20

# prefix is "long" ([KarandaAC]), "mid" ([KAntiCheat]), or "short" ([KAC]).
[display]
prefix = "long"
```

`prefix` is `long`, `mid`, or `short`. A missing key stays `long`. Any other value, including a custom prefix, is replaced with `long` and the console logs that. `/ac module` rewrites `config.toml`, so a bad prefix is rewritten to `long` with the other corrected settings.

## Permissions

Nodes follow Minecraft's command permission form. Vanilla uses `minecraft:command.gamemode`. This plugin uses `karanda-ac:command.ac` for the staff command. Alerts use `karanda-ac:alert`, which is not a command node.

The server console bypasses permission checks. Everyone else is checked against the node's default, then against any explicit grant or denial from a permission plugin.

| Node | Default | What it does |
| --- | --- | --- |
| `karanda-ac:command.ac` | Gamemaster | Use `/ac` and `/karandaac`. |
| `karanda-ac:alert` | Gamemaster | Receive alert messages. |

Gamemaster is operator level 2 or higher. Same level as `minecraft:command.gamemode`. Operator levels are Minecraft's: 0 normal, 1 moderator, 2 gamemaster, 3 admin, 4 owner.

Pumpkin resolves an explicit player value first, then a wildcard such as `karanda-ac:*` or `karanda-ac:command.*`, then the node's default. Those wildcards do nothing until a permission plugin grants them.

## Commands

`<argument>` is required. `/ac` and `/karandaac` are the same command.

| Command | Permission | Default | What it does |
| --- | --- | --- | --- |
| `/ac` | `karanda-ac:command.ac` | Gamemaster | Shows which checks are on, and whether alerts and setback are on. |
| `/ac inspect <player>` | `karanda-ac:command.ac` | Gamemaster | Shows the saved violations for that player, newest last. An online player is matched by name. A saved name or UUID is used when they are offline. |
| `/ac module <flight\|speed\|jesus\|break> <enable\|disable>` | `karanda-ac:command.ac` | Gamemaster | Turns that check on or off and saves `config.toml`. |

Each inspect line includes the check name, the reason, how long ago it was, and the player's ping at the time. Ping is only a record. It does not change the caps.

Alerts go to online players who have `karanda-ac:alert`. The message names the player, the check, and a short reason, such as `Steve failed flight: hovering`. The same player and check are not alerted again until `alert_interval_seconds` has passed. That interval also limits how often the violation is saved.

## Checks

### Flight

Records `ascending` when the player keeps moving up for `flight_ascend_seconds` and covers `flight_ascend_blocks`. Records `hovering` when they stay airborne in the hover band for `flight_hover_seconds`.

The player is exempt when any of these are true:

- Gamemode is creative or spectator, or the creative ability is set.
- The player is flying, or flight is allowed.
- The player is gliding with an elytra.
- They have a vehicle.
- They are in water or lava.

The on-ground flag seen during a move is the previous move. Flight treats the player as airborne only after that previous flag is off the ground. A client that keeps claiming to be on the ground is not treated as airborne.

Levitation, slow falling, and riptide are not exempt.

### Speed

Compares horizontal distance over time with `speed_blocks_per_second`, or `sprint_blocks_per_second` while the player is sprinting. An active Speed effect multiplies that cap.

The same cases as flight are exempt. Knockback on that player also opens `knockback_grace_seconds`. A cancelled knockback does not.

### Jesus

Records `on liquid` when the player is on ground, moves at least 0.03 blocks horizontally, the block under the feet is liquid, and the player is not swimming.

The block under the feet is one block below the destination, at `floor(y) - 1`. Feet Y is the player's position Y. A liquid block there is the test.

Boats are exempt. The wood boat and chest boat are recognized. Any other vehicle is exempt too. Bamboo rafts are vehicles, so they are exempt as passengers. They are not in the boat type list.

A player who is riding a vehicle is not seen by these on-foot checks. Boat-fly is not checked.

The on-ground flag is the previous move, same as flight. Standing still is not recorded. A one-block edge or slab with water underneath can be recorded, because the check is only the block below the feet.

### Break

Cancels the break when the same player breaks another block sooner than `break_min_interval_seconds`. The first break is allowed. A cancelled break does not move the timer, so the next legal break is measured from the last allowed one.

This is a coarse gap check. It does not compute vanilla break time, tool speed, or haste. Instant-break blocks, and creative players breaking many blocks in one tick, can be recorded. Turn `break_enabled` off if that is too noisy.

## Other behavior

- Teleports that go through, including KarandaEssentials homes, warps, and `/rtp`, open `teleport_grace_seconds`. A cancelled teleport does not. The next moves in that window are not judged, and a gap longer than `max_move_gap_seconds` starts the timers over.
- Violations are saved to `violations.json` in the plugin data folder. Each player keeps the last `max_violations` entries.
- An unreadable `violations.json` is renamed to `violations.json.bak` and the log starts empty.
- Leaving the server clears the in-memory timers. Saved violations stay.
