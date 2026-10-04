# Pumpkin Plugins

License MIT.

These plugins run on a Pumpkin Minecraft server.

## Install

1. Copy the plugin `.wasm` file into the server's `plugins` folder.
2. Restart the server. The first launch creates `plugins/data/<name>/` and writes `config.toml` there.
3. Edit that `config.toml`. Restart again, or use the plugin's reload command when it has one.

When the server asks, allow the plugin to read and write its data folder. KarandaRewards also needs permission to listen on its vote port. Denying a required permission skips that plugin.

## Editors

The web editors are optional. KarandaPerms, KarandaRewards, and KarandaWorldTools run with only the `.wasm` file and `config.toml`. Each change the editor can make also has a command, or it is a key in that plugin's `config.toml`. You can skip the editors entirely.

Node.js is not required to start them. The programs are the `.exe` files. They serve a page that is already built. You do not install Node, and you do not run `npm`, unless you are rebuilding that page yourself.

Before the first start:

1. Start the server once so `plugins\data` contains `karanda-perms`, `karanda-rewards`, and `karanda-worldtools`.
2. Put each editor's `web\dist` folder in the same folder as that editor's `.exe`. Without it, the program still listens and the browser says the page files are missing. Copy the `web\dist` folder that came with the editor. Do not install Node to create it.
3. In that plugin's `config.toml`, set `editor.host` to the address browsers will open and `editor.port` to the port below.

The in-game command writes a session and prints a link. It does not start the editor.

On a computer that can open the server's plugin data, run this from the folder that contains `start-editors.ps1`:

```powershell
.\start-editors.ps1 -Data "D:\server\plugins\data"
```

`-Data` is the server's `plugins\data` folder. It must already contain `karanda-perms`, `karanda-rewards`, and `karanda-worldtools`. Start the server once before the first editor run so those folders exist.

If you omit `-Data`, the script uses `D:\Docker\projects\pumpkin-mc\data\plugins\data`.

| Parameter | Default | Meaning |
| --- | --- | --- |
| `-Data` | `D:\Docker\projects\pumpkin-mc\data\plugins\data` | Server `plugins\data` folder. You can pass this path as the first argument with no name. |
| `-Bind` | `0.0.0.0` | Address the editors listen on. `127.0.0.1` keeps them on this computer. |
| `-PermsPort` | `8787` | KarandaPerms editor. |
| `-RewardsPort` | `8788` | KarandaRewards editor. |
| `-WorldToolsPort` | `8789` | KarandaWorldTools editor. |
| `-Editors` | (none) | Folder that holds the editor programs. |

The programs are `karanda-editor.exe`, `karanda-rewards-editor.exe`, and `karanda-worldtools-editor.exe`. The script uses the first copy it finds, in this order:

- the `-Editors` folder, or a `KarandaPerms`, `KarandaRewards`, or `KarandaWorldTools` folder inside it
- the folder that contains `start-editors.ps1`, or those same subfolders
- an `editors` folder next to the script, or those subfolders
- a copy already sitting in that plugin's release folder

Put that editor's `web\dist` folder in the same folder as the program. Each editor has its own page, so use one folder per program when you place the files yourself.

Ctrl+C stops all three. Open the `http://` link from the game. `https://` on these ports makes Firefox report `NS_ERROR_NET_EMPTY_RESPONSE`. Do not publish ports 8787–8789 on the Pumpkin container. Docker accepts the connection and sends nothing, which is the same Firefox error.

With `-Bind 0.0.0.0`, another computer uses `http://<this-computer-ip>` and the same port. The session code in the link is the only gate. Set that plugin's `editor.host` to the address browsers should open, set `editor.port` to the same port the script is using, then run the in-game editor command again.

## Menu

- [KarandaEssentials](#karandaessentials)
- [KarandaBuildTools](#karandabuildtools)
- [KarandaPerms](#karandaperms)
- [KarandaAC](#karandaac)
- [KarandaHolo](#karandaholo)
- [KarandaRewards](#karandarewards)
- [KarandaWorldTools](#karandaworldtools)

## KarandaEssentials

- Display name: KarandaEssentials
- Purpose: Essentials-style commands for Pumpkin.
- Wasm: copy `karanda_essentials.wasm` into the server `plugins` folder. Data folder: `plugins/data/karanda-essentials/`.
- Prefix: long `[KarandaEssentials]`, mid `[KEssentials]`, short `[KE]` (`display.prefix`). Chat prefixes use grey brackets and a gold name for all three lengths. Console lines stay uncolored.
- Commands: homes, warps, spawn, `/back`, `/rtp`, `/tpa`, `/msg`, `/mail`, `/nick`, kits, moderation, time, weather, balance. Help is `/ke`.
- Setup: [KarandaEssentials/README.md](KarandaEssentials/README.md)

## KarandaBuildTools

- Display name: Karanda Build Tools
- Purpose: Cuboid editor, clipboard, and shapes for Pumpkin.
- Wasm: copy `karanda_build_tools.wasm` into the server `plugins` folder. Data folder: `plugins/data/karanda-buildtools/`.
- Prefix: long `[KarandaBuildTools]`, mid `[KBuildTools]`, short `[KBT]` (`display.prefix`). Chat prefixes use grey brackets and an aqua name for all three lengths. Console lines stay uncolored.
- Commands: `//pos1`, `//pos2`, `//set`, `//copy`, `//paste`, `//undo`, `//redo`, and the shape commands. `/kb` is `info`, `status`, and `reload`. Double-slash and single-slash both work. Tab completion uses one slash.
- Setup: [KarandaBuildTools/README.md](KarandaBuildTools/README.md)

## KarandaPerms

- Display name: KarandaPerms
- Purpose: Permissions and ranks for Pumpkin. The web editor is optional.
- Wasm: copy `karanda_perms.wasm` into the server `plugins` folder. Data folder: `plugins/data/karanda-perms/`.
- Prefix: long `[KarandaPerms]`, mid `[KPerms]`, short `[KP]`. The config key is `display.brand`. Chat prefixes use grey brackets and a red name for all three lengths. Console lines stay uncolored.
- Commands (`/kp`, alias `/karanda`): `editor`, `applyedits`, `check`, `reload`, `user`, `group`.
- Without the editor: `/kp user` and `/kp group` change players, groups, and nodes. Chat format, tab format, and `display.brand` are in `config.toml`.
- Editor (optional): `start-editors.ps1` on port 8787 (`-PermsPort`). `/kp editor` writes a session and prints a link. It does not start the editor. Node.js is not required.
- Setup: [KarandaPerms/README.md](KarandaPerms/README.md)

## KarandaAC

- Display name: KarandaAC
- Purpose: Local movement and break checks for Pumpkin.
- Wasm: copy `karanda_ac.wasm` into the server `plugins` folder. Data folder: `plugins/data/karanda-ac/`.
- Prefix: long `[KarandaAC]`, mid `[KAntiCheat]`, short `[KAC]` (`display.prefix`). Chat prefixes use grey brackets and a dark red name for all three lengths. Console lines stay uncolored.
- Commands (`/ac`, alias `/karandaac`): status, `inspect`, `module`. Checks are flight, speed, walking on liquid, and breaks that are too close together. Alerts go to staff. Setback stays off until it is turned on.
- Setup: [KarandaAC/README.md](KarandaAC/README.md)

## KarandaHolo

- Display name: KarandaHolo
- Purpose: Floating text holograms for Pumpkin.
- Wasm: copy `karanda_holo.wasm` into the server `plugins` folder. Data folder: `plugins/data/karanda-holo/`.
- Prefix: long `[KarandaHolo]`, mid `[KHolo]`, short `[KH]` (`display.prefix`). Chat prefixes use grey brackets and a light purple name for all three lengths. Console lines stay uncolored.
- Commands (`/holo`, alias `/karandaholo`): `create`, `addline`, `setline`, `removeline`, `delete`, `list`, `movehere`, `info`, and one attachment (`item`, `block`, `mob`, `clearvisual`).
- Setup: [KarandaHolo/README.md](KarandaHolo/README.md)

## KarandaRewards

- Display name: KarandaRewards
- Purpose: Vote, playtime, and raffle rewards for Pumpkin.
- Wasm: copy `karanda_rewards.wasm` into the server `plugins` folder. Data folder: `plugins/data/karanda-rewards/`.
- Prefix: long `[KarandaRewards]`, mid `[KRewards]`, short `[KR]` (`display.prefix`). Chat prefixes use grey brackets and a green name for all three lengths. Console lines stay uncolored.
- Commands: `/vote`, `/playtime`, `/rewards`, `/raffle`. Staff command `/krewards` (alias `/karandarewards`): `status`, `editor`, `applyedits`, `vote`.
- Rolls: `/die`, `/key`, and `/coin` spend a stored count on a weighted prize.
- Without the editor: players use `/vote`, `/playtime`, `/rewards`, `/raffle`, `/die`, `/key`, and `/coin`. Staff use `/krewards`. Reward lists, feature toggles, and `roll_presentation` are in `config.toml`.
- Editor (optional): `start-editors.ps1` on port 8788 (`-RewardsPort`). `/krewards editor` writes a session and prints a link. It does not start the editor. Node.js is not required.
- Setup: [KarandaRewards/README.md](KarandaRewards/README.md)

## KarandaWorldTools

- Display name: KarandaWorldTools
- Purpose: Worlds, travel, and region protection for Pumpkin.
- Wasm: copy `karanda_world_tools.wasm` into the server `plugins` folder. Data folder: `plugins/data/karanda-worldtools/`.
- Prefix: long `[KarandaWorldTools]`, mid `[KWorldTools]`, short `[KWT]` (`display.prefix`). Chat prefixes use grey brackets and a dark green name for all three lengths. Console lines stay uncolored.
- Commands (`/kwt`, alias `/worldtools`): `worlds`, `go`, `create`, `unload`, `reload`, `pos1`, `pos2`, `region`, `world`, `editor`. `bypass` skips region flags and the world entry permission.
- Without the editor: `/kwt` creates worlds, sets aliases, costs, entry, and flags, and defines regions.
- Editor (optional): `start-editors.ps1` on port 8789 (`-WorldToolsPort`). `/kwt editor` writes a session and prints a link. It does not start the editor. Node.js is not required.
- Setup: [KarandaWorldTools/README.md](KarandaWorldTools/README.md)
