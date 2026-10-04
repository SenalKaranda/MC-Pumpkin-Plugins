# KarandaRewards

Vote links, playtime milestones, a reward catalog, raffles, and die, key, and coin rolls on a Pumpkin server.

Chat messages, command replies, and broadcasts use `[KarandaRewards]`, `[KRewards]`, or `[KR]`, chosen in `config.toml`. The brackets are grey and the name is green. Console lines use the same words with no color.

## Install

Copy `karanda_rewards.wasm` into the server's `plugins` folder and restart.

The first launch creates `plugins/data/karanda-rewards/`. Edit `config.toml` in that folder, then restart.

When the server asks, allow the plugin to read its data folder, write its data folder, and bind a TCP port for votes. Denying any one of those skips the plugin.

## Data files

| File | Contents |
| --- | --- |
| `config.toml` | Settings. Created if it is missing. |
| `state.json` | Playtime, vote cooldowns, waiting rewards, open raffles, and each player's die, key, and coin counts. |
| `v1_private.pem` | Classic Votifier private key. Created when classic votes are on and the file is missing. |
| `v1_public.pem` | Classic Votifier public key. Give this to the voting site. |

Restart the server after editing `config.toml`. A setting that parses but is the wrong type or out of range is replaced, logged, and written back. The other settings stay. If the file is not valid TOML, the plugin uses defaults and leaves the broken file in place.

## Configuration

`config.toml` starts with the plugin name, a one-line purpose, and the version. Missing keys keep the defaults.

```toml
[display]
prefix = "long"
```

`prefix` is `long`, `mid`, or `short`. `long` prints `[KarandaRewards]`. `mid` prints `[KRewards]`. `short` prints `[KR]`. Chat prefixes use grey brackets and a green name for all three lengths. Console lines stay uncolored. Any other value is replaced with `long` and logged. A missing `[display]` section keeps `long`. The label is added to command replies, reward messages, and broadcasts.

| Key | Default | Meaning |
| --- | --- | --- |
| `vote_listener` | `true` | Open the vote port. |
| `vote_bind` | `0.0.0.0:8192` | IP address and port. A hostname is not accepted. |
| `vote_cooldown_seconds` | `86400` | Wait before the same player earns another vote reward. `0` allows every vote. |
| `vote_token` | `change-me` | NuVotifier v2 HMAC token. v2 votes are ignored while this is `change-me`. |
| `vote_v1` | `true` | Accept classic Votifier v1 votes. |
| `playtime_max_gap_seconds` | `120` | Largest stall, in seconds, that still counts as playtime. |
| `features.voting` | `true` | Pay vote rewards. A missing key stays on. |
| `features.playtime` | `true` | Pay playtime milestones. A missing key stays on. |
| `features.raffles` | `true` | Draw raffle prizes. A missing key stays on. |
| `features.die` | `true` | Let players spend a die. A missing key stays on. |
| `features.key` | `true` | Let players spend a key. A missing key stays on. |
| `features.coin` | `true` | Let players spend a coin. A missing key stays on. |
| `roll_presentation` | `chat` | `chat` or `world`. A bad value is replaced with `chat` and logged. |

`[vote_service_tokens]` maps a service name to its own v2 token. `[[vote_sites]]` lists the sites `/vote` shows. `[vote_reward]` is given when a vote is accepted. `[[playtime_rewards]]` lists milestones. `[rewards]` is the catalog raffles draw from.

A reward may set `message`, `broadcast`, `commands`, `money`, `die`, `key`, `coin`, and `[[....items]]` with `item` and `count`. `{player}`, `{service}`, and `{address}` are filled in. `&` color codes work in messages sent to a player. Broadcasts are plain text. `money` is a whole number from 0 to 2147483647. `0` adds no money. A bad `money` value is replaced with `0` and logged. `die`, `key`, and `coin` are whole counts from 0 to 1000000 added to the player. `0` adds none. Those counts are still granted when that roll is turned off.

`[[die_rewards]]`, `[[key_rewards]]`, and `[[coin_rewards]]` are the weighted prize lists. Each entry has a `weight` of 1 to 1000000 plus the same reward fields. A new file starts with one diamond prize on each list.

```toml
[editor]
# Address browsers use for /krewards editor. 127.0.0.1 only works on the machine running the editor.
host = "127.0.0.1"
port = 8788
auto_apply = true
```

`editor.host` is the address printed by `/krewards editor`. It is not the address the editor process binds. `editor.port` defaults to `8788`. KarandaPerms uses `8787` and KarandaWorldTools uses `8789`, so all three editors can run together. A bad host or a port outside 1 to 65535 is replaced with the default and logged. `auto_apply` applies pending editor files about once a second. Set it to `false` to apply them only with `/krewards applyedits`.

## Commands

| Command | Permission | Who |
| --- | --- | --- |
| `/vote` | `karanda-rewards:command.vote` | Everyone |
| `/playtime` | `karanda-rewards:command.playtime` | Everyone |
| `/rewards` | `karanda-rewards:command.rewards` | Everyone |
| `/rewards claim` | `karanda-rewards:command.rewards` | Everyone |
| `/raffle` | `karanda-rewards:command.raffle` | Everyone |
| `/raffle enter <id>` | `karanda-rewards:command.raffle` | Everyone |
| `/raffle start <id> <reward> <minutes>` | `karanda-rewards:command.raffle.start` | Operator level 2 |
| `/raffle draw <id>` | `karanda-rewards:command.raffle.draw` | Operator level 2 |
| `/raffle cancel <id>` | `karanda-rewards:command.raffle.cancel` | Operator level 2 |
| `/krewards` | `karanda-rewards:command.krewards` | Operator level 2 |
| `/krewards status` | `karanda-rewards:command.status` | Operator level 2 |
| `/krewards editor` | `karanda-rewards:command.editor` | Operator level 2 |
| `/krewards applyedits <code>` | `karanda-rewards:command.applyedits` | Operator level 2 |
| `/krewards vote <player> [service]` | `karanda-rewards:command.recordvote` | Operator level 2 |
| `/die` | `karanda-rewards:command.die` | Everyone |
| `/key` | `karanda-rewards:command.key` | Everyone |
| `/coin` | `karanda-rewards:command.coin` | Everyone |
| `/krewards give <player> <die\|key\|coin> <amount>` | `karanda-rewards:command.give` | Operator level 2 |
| `/krewards take <player> <die\|key\|coin> <amount>` | `karanda-rewards:command.take` | Operator level 2 |
| `/krewards check <player>` | `karanda-rewards:command.check` | Operator level 2 |

`/karandarewards` is the same command as `/krewards`. Minutes `0` leaves the raffle open until `/raffle draw`. `/krewards vote` records a vote without the cooldown. The console can give, take, and check counts. A player who has not joined yet cannot be given a count.

## Dice, keys, and coins

These are counts stored on the player in `state.json`. They are not items in the inventory. A vote, playtime reward, raffle, or roll prize can grant them. Turning a roll off stops spending and stops that roll's prize list. Counts already stored stay, and other rewards can still grant them.

`/die`, `/key`, and `/coin` each spend one count and pick one prize from that list by weight. The command refuses, and does not spend, when that roll is off, the list is empty, or the player has none.

With `roll_presentation = "chat"`, chat shows the roll and then the prize message. A die shows a d20 from 1 to 20. That number is only for show; the prize still comes from the weighted list. A key says the box opened. A coin shows three slot names.

With `roll_presentation = "world"`, the roll appears above the player for a few seconds, where nearby players can see it. A die cycles a number, then shows the d20 and the prize item when the entry has one. A key shows a chest, then the prize name. A coin shows three reels, then the prize name. The prize message is still sent in chat after that result appears. If the chunk is not loaded, or the display cannot be created, the same roll is shown in chat instead. The count is spent once either way. Displays are removed after the result. A restart can leave one behind.

`karanda-rewards:command` defaults to operator level 2 and grants every command above, including the editor commands. The player commands still default to everyone on their own nodes.

## Web editor

The editor is optional. The plugin runs with only the `.wasm` file and `config.toml`.

The same work without the editor:

| What you want | Do this instead |
| --- | --- |
| Vote, playtime claim, raffle entry | `/vote`, `/playtime`, `/rewards claim`, `/raffle enter` |
| Start, draw, or cancel a raffle | `/raffle start`, `/raffle draw`, `/raffle cancel` |
| Give, take, or check die, key, and coin counts | `/krewards give`, `/krewards take`, `/krewards check` |
| Record a vote by hand | `/krewards vote` |
| Reward lists, weights, feature toggles, chat or world rolls | `config.toml`: `vote_reward`, `playtime_rewards`, `rewards`, `[features]`, `roll_presentation`, `die_rewards`, `key_rewards`, `coin_rewards` |

Node.js is not required. The program serves a page that is already built in `web\dist`. You do not install Node, and you do not run `npm`, unless you are rebuilding that page yourself.

Before the first start, start the server once so `plugins\data\karanda-rewards` exists. Put this editor's `web\dist` folder in the same folder as `karanda-rewards-editor.exe`. If that folder is missing, the program still listens and the browser says the page files are missing. Copy the `web\dist` folder that came with the editor. Set `editor.host` and `editor.port` in `config.toml` to the address and port browsers will open.

`/krewards editor` writes a session file and prints a link. It does not start the editor.

Start it with `start-editors.ps1` from the folder that contains that script. Pass `-Data` as the server's `plugins\data` folder (the folder that contains `karanda-perms`, `karanda-rewards`, and `karanda-worldtools`):

```powershell
.\start-editors.ps1 -Data "D:\server\plugins\data"
```

If you omit `-Data`, the script uses `D:\Docker\projects\pumpkin-mc\data\plugins\data`. `-Bind` defaults to `0.0.0.0`. This editor uses port 8788 (`-RewardsPort`). `-Bind 127.0.0.1` keeps the editors on this computer. Binding `0.0.0.0` warns that the session code is the only gate.

The program is `karanda-rewards-editor.exe`. The script looks in `-Editors` (or a `KarandaRewards` folder inside it), next to the script, in an `editors` folder next to the script, and in a release copy already stored with the plugin. Put this editor's `web\dist` folder in the same folder as the program.

The printed link uses `editor.host` and `editor.port` from `config.toml`. Set `editor.host` to the address browsers should use, and set `editor.port` to the same port as `-RewardsPort`, then run `/krewards editor` again.

Open the printed `http://<host>:<port>/s/<code>` link. `https://` on this port makes Firefox report `NS_ERROR_NET_EMPTY_RESPONSE`. Do not publish port 8788 on the Pumpkin container. Ctrl+C in the script window stops the editor.

Edit the vote reward, playtime rewards, named rewards, open raffles, and the Rolls tab, then Save on Review. Rolls can turn voting, playtime, raffles, die, key, and coin on or off, choose chat or world, and edit each weighted entry. Copy replaces another list, or both other lists, after you confirm. Save writes `editor/pending/<code>.json`. With `auto_apply` on, the plugin applies that file about once a second and writes `editor/results/<code>.json`. The page polls that result. A successful apply removes `editor/sessions/<code>.json`, so that session is finished and `/krewards editor` can open another one immediately. The editor program keeps running. While that program is running it holds `editor/live.lock` in the plugin data folder, with `"plugin": "karanda-rewards"`, and refreshes the heartbeat every 2 seconds. Stopping the program deletes the lock. A second Rewards editor on the same data folder is refused by that lock.

The editor does not show vote tokens. Applying an edit rewrites the reward sections, the feature toggles, the roll lists, the console prefix, and the open raffle list. Entrants already stored on a raffle stay unless that raffle is removed in the editor. If the server's rewards or raffles changed after the session started, the apply conflicts and nothing is written. KarandaPerms stays on 8787 and KarandaWorldTools uses 8789, so those editors can stay running. If port 8788 is already taken, the program says that port is in use.

## Economy

`money` on a vote reward, playtime reward, named reward, or raffle is optional.

KarandaRewards pays money only when KarandaEssentials is loaded. If Essentials is absent, the money is not paid and a console line says so. Items, commands, and messages are still granted.

If KarandaEssentials is loaded, the reward runs the console command `eco give <player> <amount>`. That command updates the Essentials balance for an online player, and Essentials creates the account if that player has not been stored yet. A raffle winner who is offline keeps the reward, including the money, until they join. Essentials config is not rewritten, and `display.prefix` is left alone. The command does not report success back to KarandaRewards. Amounts are 1 to 2147483647, which is the range that command accepts. A name Essentials cannot resolve is rejected by Essentials itself.

## Limits

The plugin listens on `vote_bind` and checks the vote port about once a second, so a connection cannot stall the server tick. It speaks the public Votifier v1 handshake and the NuVotifier v2 HMAC handshake itself.

- `vote_bind` is an IP and port. A hostname is rejected. The plugin does not look up DNS.
- If the server is loopback-only, `0.0.0.0` is rejected. Use `127.0.0.1` and a port.
- There is no PROXY protocol. The voting site must connect directly.
- v2 stays off until `vote_token` (or a per-service token) is at least 8 characters and is not `change-me`.
- Vote usernames must be Java names: letters, digits, and underscore, 1 to 16 characters. A name with a space is rejected so it cannot be substituted into a reward command.
- Reward commands run as the console. A leading `/` is removed.
- An item id the server does not know is skipped. It is not given as air.
- If the inventory is full, leftover vote and raffle items wait until `/rewards claim`. A playtime milestone is not marked claimed until the items fit.
- Playtime is counted from join, quit, and the one-second tick. A gap longer than `playtime_max_gap_seconds` counts only that many seconds. Milestones are claimed with `/rewards claim`. While playtime is off, time still adds up, but milestones are not paid.
- While voting is off, new votes are not paid. While raffles are off, draws are not paid and new raffles cannot be started. Counts already stored are kept.
- World rolls follow the one-second tick. They are not a second timer.
- Open raffles and waiting rewards are saved in `state.json`. A file that cannot be read is left in place, and rewards pause until it is fixed.
- If the server cannot provide random bytes, the first classic key is seeded from the clock and that is logged.
- `/krewards editor` only writes the session file. Start the editor with `start-editors.ps1`.
- A live KarandaPerms editor does not block this editor. Each one uses its own port and its own data folder. A second Rewards editor on the same data folder is refused until the first one exits.
- If KarandaEssentials is missing, or the server reports it as missing, money is skipped. Items, commands, and messages are still granted.
