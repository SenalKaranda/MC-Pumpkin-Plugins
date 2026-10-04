# Karanda Build Tools

Cuboid edits, a clipboard, and shapes on a Pumpkin server. Version 1.0 fills selections, draws spheres, cylinders, and pyramids, and keeps an in-memory clipboard.

This version has no schematic files, brushes, masks, clipboard rotate and flip, or non-cuboid selections.

Command replies use `[KarandaBuildTools]`, `[KBuildTools]`, or `[KBT]`. The brackets are grey and the name is aqua. Console lines use the same words with no color.

## Install

Copy `karanda_build_tools.wasm` into the server's `plugins` folder and restart.

The first launch creates `plugins/data/karanda-buildtools/` and writes `config.toml` there. A config left in `plugins/data/buildtools/` is not read.

## How to type a command

Every edit can be typed with a double slash or a single slash. `//set stone` and `/set stone` do the same edit. Tab completion uses one slash.

`/cyl` and `/cylinder` are the same command. The same is true for `/hcyl` and `/hcylinder`, and for `/kb` and `/karanda`.

Console can run `/kb` and `/karanda`. Every other command has to be typed by a player. The console is treated as having every permission.

## Permissions

Nodes use Pumpkin's Minecraft-style form, `namespace:command.<name>`, the same shape as vanilla nodes such as `minecraft:command.gamemode`. The plugin id is `karanda-buildtools`, so every node starts with `karanda-buildtools:`.

Pumpkin decides a check in this order:

1. An explicit value set on that player for that exact node. `false` denies the node even for an operator. `true` grants it even below level 2.
2. A shorter node or wildcard on that player. `karanda-buildtools:*` covers every Karanda node. `karanda-buildtools:command` and `karanda-buildtools:command.*` cover every command node, including `karanda-buildtools:command.kb.info`. A value of `false` on one of those shorter nodes denies the longer node unless step 1 already set the longer node to `true`.
3. A parent the player has been granted, when this node is registered as its child. This is how `karanda-buildtools:use` grants the commands: that name is not a prefix of `karanda-buildtools:command.set`.
4. The node's default. Every Karanda node defaults to operator level 2 (gamemaster). Level 2, 3, and 4 receive it. Level 0 and 1 do not, unless a node was granted to them.

The plugin does not skip this check for operators. A level-2 player who is explicitly denied `karanda-buildtools:command.set` cannot run `//set` or `/set`.

Pumpkin's `commands` config can raise or lower the permission level of a vanilla or Pumpkin command by looking up `minecraft:command.<name>` and `pumpkin:command.<name>`. It does not look up `karanda-buildtools:command.<name>`, and those overrides run before plugins load, so a `permission_level` entry for `set` does not change `/set` from this plugin. Grant or deny the nodes above instead.

| Node | Grants |
| --- | --- |
| `karanda-buildtools:command.<name>` | That command. The names are listed with each command below. |
| `karanda-buildtools:command` | Every command, when this node is explicitly granted. Does not grant `limit.bypass`. |
| `karanda-buildtools:command.*` | Every command node. Does not grant `limit.bypass`. |
| `karanda-buildtools:use` | Every command, when this node is explicitly granted. Same children as `karanda-buildtools:command`. Does not grant `limit.bypass`. |
| `karanda-buildtools:command.kb` | `/kb` and `/karanda`. When explicitly granted, also grants `info`, `status`, and `reload`. |
| `karanda-buildtools:command.kb.*` | The three `/kb` subcommands. |
| `karanda-buildtools:limit.bypass` | Ignore `max_blocks` and `max_clipboard_blocks`. Defaults to operator level 2. Not included in `command` or `use`. |

`/kb info` checks both `karanda-buildtools:command.kb` and `karanda-buildtools:command.kb.info`. The same pairing applies to `status` and `reload`. An operator passes both because each node defaults to level 2. A non-operator who should use only reload needs `karanda-buildtools:command.kb` and `karanda-buildtools:command.kb.reload`, with the other two subcommands set to `false` if the parent would otherwise grant them.

Aliases share one node. `/cyl` and `/cylinder` both require `karanda-buildtools:command.cylinder`. `/hcyl` and `/hcylinder` both require `karanda-buildtools:command.hcylinder`. `/kb` and `/karanda` both require `karanda-buildtools:command.kb`.

## Selection

A selection is two corners, position 1 and position 2, stored for your player id. Both corners have to be in the same world before a cuboid exists. Switching worlds does not delete the corners. An edit in the current world refuses a cuboid whose corners belong to another world.

Your block position is the block containing your feet. Coordinates are integers. A coordinate may be absolute (`10`) or relative to your block (`~`, `~-1`, `~+2`).

Looking up or down counts as a direction when your pitch is below -45 (up) or above 45 (down). Otherwise yaw follows Minecraft: 0 south, 90 west, 180 north, 270 east. Direction names are `north`, `south`, `east`, `west`, `up`, `down`, or `n`, `s`, `e`, `w`, `u`, `d`.

`//chunk` and `//expand vert` use the world's minimum Y as the bottom and `min_y + 383` as the top. That is the vanilla span from -64 through 319. A world with a different height still uses that span.

### //pos1 and //pos2

Permission: `karanda-buildtools:command.pos1` or `karanda-buildtools:command.pos2`.

- `//pos1` sets position 1 to your block.
- `//pos1 <x> <y> <z>` sets it to those coordinates.
- `//pos2` and `//pos2 <x> <y> <z>` do the same for position 2.

```text
//pos1
//pos2 20 ~-1 ~
```

The reply prints the corner you set and, once both corners share a world, the selection and its volume.

### //hpos1 and //hpos2

Permission: `karanda-buildtools:command.hpos1` or `karanda-buildtools:command.hpos2`.

Sets that corner to the block you are looking at. The trace starts at your eyes, ignores fluids, and stops after `raycast_blocks` (256 by default). If the trace hits nothing, the command reports that no block is in sight.

```text
//hpos1
//hpos2
```

### //chunk

Permission: `karanda-buildtools:command.chunk`.

Selects the 16×16 column that contains your block, from the bottom of the world through the top described above. Negative coordinates stay in the correct chunk: block `(-1, 10, -17)` selects X from -16 through -1 and Z from -32 through -17.

```text
//chunk
```

### //expand

Permission: `karanda-buildtools:command.expand`.

Grows the existing cuboid. Amounts are zero or positive. A negative amount is rejected.

- `//expand <amount>` grows the face you are looking at.
- `//expand <amount> <direction>` grows that face.
- `//expand <amount> <direction> <reverse>` grows that face and the opposite face.
- `//expand vert` stretches Y from the bottom of the world through the top. X and Z stay as they are.

```text
//expand 2
//expand 2 up
//expand 2 north 3
//expand vert
```

### //size

Permission: `karanda-buildtools:command.size`.

Prints both corners. When they form a cuboid in the current world, the volume is included. A missing corner is printed as `-`.

```text
//size
```

### //desel

Permission: `karanda-buildtools:command.desel`.

Clears both corners.

```text
//desel
```

## Block patterns

Patterns are resolved against the running block registry before a job is queued. An unknown name or property value cancels the command and does not enqueue anything.

- `stone` and `minecraft:stone` are the same block.
- `oak_stairs[facing=north,half=top]` sets those properties. Names and values are matched without case sensitivity. Property order does not matter. A property you omit stays on the block's default state.
- `50%stone,50%dirt` and `1*stone,3*dirt` are weighted mixes. Weights are positive integers. A space after a comma is allowed.

The block chosen at each position is a pure function of the coordinates and the weights. The same fill is stable, and redo writes the same blocks as the original edit. There is no random number generator.

`//replace` takes one source state in the same `name[properties]` form. The source is not a weighted pattern. The replacement may be a pattern.

Pattern arguments suggest block names, up to 30 matches. The suggestion replaces the text after the last comma, space, `%`, or `*`. Short names are suggested without the `minecraft:` prefix.

```text
//set stone
//set oak_stairs[facing=north]
//set 50%stone,50%dirt
//replace dirt 1*oak_planks,3*spruce_planks
```

## Edits

One queue serves the whole server, first in, first out. Each server tick takes at most `blocks_per_tick` positions from the front job (8192 by default) and then continues on the next tick. When the job finishes, you get one summary: how many blocks changed, how many writes did not stick, and whether undo was kept.

`//undo` and `//redo` are refused while any job is still in the queue. Other edits wait behind the job in front.

Chunks must already be loaded. This version does not load or generate chunks. A write that does not leave the requested state is counted as a miss and reported at the end. A position that does not change is not history and does not count as written.

Edits do not drop container contents. A chest or other block entity keeps its data, so `//undo` can put that inventory back. `//move`, `//cut`, and `//paste` read the affected blocks before they write, so a source cell and a destination cell that overlap keep the right values. Moving a block onto its neighbor leaves air behind and keeps both the moved block and the neighbor that was pushed aside.

Walls and shapes visit every block of their box, including positions they do not change. `max_blocks` counts those visited positions. A hollow shape is limited by its box, not only by the blocks it places. A shape whose box is larger than 5,000,000 blocks is refused even with `limit.bypass`.

If `history_entries` is 0, the edit still runs. The completion line says that undo was not kept.

### //set

Permission: `karanda-buildtools:command.set`.

Fills every block of the cuboid with the pattern.

```text
//set stone
//set 50%stone,50%dirt
```

### //replace

Permission: `karanda-buildtools:command.replace`.

Visits every block of the cuboid and writes the pattern only where the current state is exactly the source state. Properties matter: `oak_stairs` matches the default stair state, and `oak_stairs[facing=north]` matches only that state.

```text
//replace stone dirt
//replace oak_stairs[facing=north] oak_stairs[facing=south]
```

### //walls

Permission: `karanda-buildtools:command.walls`.

Writes the pattern on the four vertical faces. The floor and ceiling are left alone, except where a side face includes that edge. A one-block-wide selection is entirely side face.

```text
//walls glass
```

### //move

Permission: `karanda-buildtools:command.move`.

Shifts the cuboid's contents by `<distance>` blocks and leaves air in the cells that are not covered by the moved copy. Distance is an integer of at least 1. The direction defaults to where you are looking.

```text
//move 3
//move 3 north
```

The limit counts every cell in the source region and the destination region.

### //sphere and //hsphere

Permission: `karanda-buildtools:command.sphere` or `karanda-buildtools:command.hsphere`.

Draws a sphere centered on position 1. Position 2 is not used. Radius is an integer of at least 1. A block is inside the solid sphere when its distance from the center is at most `radius + 0.5`. The hollow sphere keeps the blocks the solid sphere has and the sphere of radius `radius - 1` does not.

```text
//sphere stone 8
//hsphere glass 6
```

### //cyl, //cylinder, //hcyl, and //hcylinder

Permission: `karanda-buildtools:command.cylinder` or `karanda-buildtools:command.hcylinder`.

Draws a vertical cylinder centered on position 1. The horizontal disk uses the same radius test as a sphere, on X and Z only. Height defaults to 1 and extends upward from position 1, so height 5 occupies position 1 and the four blocks above it. Hollow keeps the outer ring for the full height.

```text
//cyl oak_planks 4 5
//cylinder oak_planks 4
//hcyl glass 4 5
//hcylinder glass 4 5
```

### //pyramid and //hpyramid

Permission: `karanda-buildtools:command.pyramid` or `karanda-buildtools:command.hpyramid`.

Draws a pyramid whose base is a square of width `2 * size + 1`, centered on position 1. Each layer upward shrinks by one block on every side. Size is an integer of at least 1. A hollow pyramid keeps the outline of each layer.

```text
//pyramid sandstone 6
//hpyramid sandstone 6
```

## Clipboard

The clipboard is one dense cuboid per player, including air, plus the offset from the copy's minimum corner to the block you occupied when you copied. It stays in memory across reconnects and is dropped when the server stops. It is not written to disk.

`//paste` reads the clipboard when that job reaches the front of the queue. A `//copy` queued ahead of it is the clipboard that gets pasted.

### //copy

Permission: `karanda-buildtools:command.copy`.

Stores every block in the selection, including air and block-entity NBT. Your current block becomes the paste origin. Copying does not change the world and does not clear redo.

```text
//copy
```

### //cut

Permission: `karanda-buildtools:command.cut`.

Copies the selection, then queues a fill of that selection with air. The air fill is a normal edit: it records history, and cutting a chest records the chest's NBT so `//undo` puts the inventory back.

```text
//cut
```

### //paste

Permission: `karanda-buildtools:command.paste`.

Places the stored origin on your current block.

- `//paste` skips air, so existing blocks remain where the clipboard is empty.
- `//paste -a` writes air as well.

```text
//paste
//paste -a
```

If you have no clipboard and no copy is waiting in the queue, the command tells you to copy a selection first.

## History

History is stored per player and per world. Each entry is one finished edit: the positions that actually changed, their old and new states, and their old and new block-entity NBT. The stack keeps `history_entries` edits (15 by default). A new world edit drops the oldest entry when the stack is full and clears the redo stack.

`//undo` and `//redo` are refused while any job is queued, including another player's job. They replay the latest entry in the world you are standing in. The replay writes states and NBT. It does not create a new history entry; the stacks move when you run the command.

### //undo

Permission: `karanda-buildtools:command.undo`.

Restores the latest finished edit in this world.

```text
//undo
```

### //redo

Permission: `karanda-buildtools:command.redo`.

Reapplies the edit you most recently undid in this world. A new edit after an undo discards that redo.

```text
//redo
```

## Admin

`/kb` and `/karanda` are the same command. Console may run them. `/kb` with no subcommand replies `Usage: /kb <info|status|reload>`. Players need `karanda-buildtools:command.kb` and the subcommand node.

### /kb info

Permission: `karanda-buildtools:command.kb.info`.

Prints the plugin name, version, and the Pumpkin revision this plugin was built for.

```text
/kb info
```

### /kb status

Permission: `karanda-buildtools:command.kb.status`.

Prints whether the queue is idle or how many jobs are waiting, which job is active, how many positions that job has left, the current limits, and the chat prefix in use.

```text
/kb status
```

### /kb reload

Permission: `karanda-buildtools:command.kb.reload`.

Reads `config.toml` again. A valid file replaces the limits immediately, including the history length of stacks that already exist. An invalid file, or a file that cannot be read, leaves the previous settings in place and reports the error.

```text
/kb reload
```

## Config

```toml
# Karanda Build Tools
# Cuboid editor, clipboard, and shapes for Pumpkin.
# version 1.0.0

max_blocks = 250000
blocks_per_tick = 8192
history_entries = 15
max_clipboard_blocks = 250000
raycast_blocks = 256

# prefix is "long" ([KarandaBuildTools]), "mid" ([KBuildTools]), or "short" ([KBT]).
[display]
prefix = "long"
```

Lines may use `key = value`. `#` starts a comment. `[display]` is the only category. Unknown keys and unknown categories are errors. Missing keys keep these defaults. `history_entries` may be 0. The other numeric values must be at least 1. `/kb reload` applies a valid file immediately, including the prefix on later messages.

| Key | Meaning |
| --- | --- |
| `max_blocks` | Most positions one edit may visit. Operators bypass this when they have `karanda-buildtools:limit.bypass`. |
| `blocks_per_tick` | Positions applied from the front job on each server tick. |
| `history_entries` | Undo entries kept per player per world. `0` runs the edit and does not keep undo. |
| `max_clipboard_blocks` | Largest selection `//copy` and `//cut` will store, and the largest clipboard `//paste` will place. Bypassed with the same node as `max_blocks`. |
| `raycast_blocks` | How far `//hpos1` and `//hpos2` look, in blocks. |
| `[display] prefix` | Chat label on every Karanda message. `long` prints `[KarandaBuildTools]`. `mid` prints `[KBuildTools]`. `short` prints `[KBT]`. Chat prefixes use grey brackets and an aqua name for all three lengths. Console lines stay uncolored. The default is `long`. Any other value, including a custom prefix, is rejected and the previous config stays loaded. |
